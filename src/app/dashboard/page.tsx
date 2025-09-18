"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2, Download, X } from "lucide-react";
import ImageEditorDrawer from "@/components/ui/image-editor-drawer";

type FontSize = "small" | "medium" | "large";
type TextPosition = "top" | "center" | "bottom";

const FONT_SIZES: Record<FontSize, number> = {
  small: 24,
  medium: 36,
  large: 48,
};

interface Message {
  type: "prompt" | "response";
  content: string;
  imageUrl?: string;
}

export default function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState("");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [textPosition, setTextPosition] = useState<TextPosition>("center");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (promptText: string) => {
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setMessages((prev) => [
      ...prev,
      {
        type: "response",
        content: "Here's your generated image:",
        imageUrl: "/vertical-image.jpg", // Using mock image from public folder
      },
    ]);
    setIsLoading(false);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleDownload = () => {
    if (!selectedImage) return;

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set fixed canvas size (1080x1920)
      canvas.width = 1080;
      canvas.height = 1920;

      if (!ctx) return;

      // Calculate scaling to fit image proportionally
      const scale = Math.min(1080 / img.width, 1920 / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Center the image in the canvas
      const x = (1080 - scaledWidth) / 2;
      const y = (1920 - scaledHeight) / 2;

      // Clear canvas and draw scaled image
      ctx.fillStyle = "#000000"; // Black background
      ctx.fillRect(0, 0, 1080, 1920);

      // Draw the image with proper scaling
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Configure text style
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
      const maxWidth = canvas.width * 0.6; // 60% of canvas width
      const fontSizeValue = FONT_SIZES[fontSize]; // Use the selected font size
      ctx.font = `bold ${fontSizeValue}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Wrap text function
      function getWrappedLines(
        context: CanvasRenderingContext2D,
        text: string,
        maxTextWidth: number
      ): string[] {
        if (!text) return [];
        const lines: string[] = [];
        let currentLine = "";
        const words = text.split(" ");

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const { width } = context.measureText(testLine);

          if (width <= maxTextWidth) {
            currentLine = testLine;
          } else {
            // If it's the first word and it's too long, force-break it
            if (!currentLine) {
              let partialWord = word;
              while (partialWord) {
                let i = partialWord.length;
                while (i > 0) {
                  const partial = partialWord.substring(0, i);
                  const partialWidth = context.measureText(partial).width;
                  if (partialWidth <= maxTextWidth) {
                    lines.push(partial);
                    partialWord = partialWord.substring(i);
                    i = partialWord.length;
                  }
                  i--;
                }
                if (i === 0) break; // Prevent infinite loop
              }
            } else {
              lines.push(currentLine);
              currentLine = word;
            }
          }
        }

        if (currentLine) {
          lines.push(currentLine);
        }

        return lines;
      }

      // Calculate wrapped lines
      const lines = getWrappedLines(ctx, overlayText, maxWidth);
      const lineHeight = fontSizeValue * 1.2;
      const totalHeight = lineHeight * lines.length;

      // Calculate Y position based on text position
      let startY: number;
      switch (textPosition) {
        case "top":
          startY = 200; // Add padding from top
          break;
        case "bottom":
          startY = canvas.height - totalHeight - 200; // Add padding from bottom
          break;
        default: // center
          startY = canvas.height / 2 - totalHeight / 2 + lineHeight / 2;
      }

      // Draw each line
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        // Draw text stroke
        ctx.strokeText(line, canvas.width / 2, y);
        // Draw text fill
        ctx.fillText(line, canvas.width / 2, y);
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "generated-image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    img.src = selectedImage;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const currentPrompt = prompt;
    // Add user prompt to messages
    setMessages((prev) => [
      ...prev,
      { type: "prompt", content: currentPrompt },
    ]);
    setPrompt(""); // Clear input immediately

    // Start generating response without awaiting
    if (!isLoading) {
      setIsLoading(true);
      generateResponse(currentPrompt);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-emerald-900 to-green-900 text-zinc-100">
      <Navbar variant="dashboard" />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-5rem)]">
        {/* Main content area with messages */}
        <div className="flex flex-col h-full">
          {/* Messages/Chat Area */}
          <div
            className="flex-1 overflow-y-auto py-8 px-4 space-y-8"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "prompt" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === "prompt"
                      ? "bg-emerald-800/30 border border-emerald-700/30"
                      : "bg-zinc-800/30 border border-zinc-700/30"
                  }`}
                >
                  <p className="text-zinc-100">{message.content}</p>
                  {message.imageUrl && (
                    <div className="mt-4 flex flex-col items-center gap-4">
                      <img
                        src={message.imageUrl}
                        alt="Generated content"
                        className="rounded-lg w-[300px] h-[300px] object-contain"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            // Create a link to download the raw image
                            const link = document.createElement("a");
                            link.href = message.imageUrl || "";
                            link.download = "raw-image.jpg";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          variant="outline"
                          className="bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-700/30 cursor-pointer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Raw
                        </Button>
                        <Button
                          onClick={() =>
                            message.imageUrl &&
                            handleImageClick(message.imageUrl)
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Edit Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Input Area */}
          <div className="py-4">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="flex-1 h-[50px] bg-zinc-800/30 border-zinc-700/30 text-zinc-100 placeholder:text-zinc-400"
              />
              <Button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="h-[50px] px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Image Editor Drawer */}
        <ImageEditorDrawer
          isOpen={selectedImage !== null}
          selectedImage={selectedImage}
          overlayText={overlayText}
          fontSize={fontSize}
          textPosition={textPosition}
          onClose={() => setSelectedImage(null)}
          onTextChange={setOverlayText}
          onFontSizeChange={setFontSize}
          onTextPositionChange={setTextPosition}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}
