"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ImageIcon,
  Loader2,
  Download,
  X,
  Bold,
  Italic,
  Underline,
} from "lucide-react";

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
  const [textBorder, setTextBorder] = useState(false);
  const [borderSize, setBorderSize] = useState(2);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<TextPosition>("center");
  const [logoSize, setLogoSize] = useState(100); // Initial size of 100px
  const [hasTextBackground, setHasTextBackground] = useState(false);
  const [textBackgroundColor, setTextBackgroundColor] = useState("#000000");
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

    // Set the mock image as the selected image
    setSelectedImage("/vertical-image.jpg");

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

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const downloadCanvasImage = () => {
      canvas.toBlob((blob: Blob | null) => {
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

    const drawLogoAndFinish = () => {
      if (!logo) {
        downloadCanvasImage();
        return;
      }

      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        // Maintain aspect ratio while respecting the user-defined size
        const scale = logoSize / logoImg.width;
        const logoWidth = logoSize;
        const logoHeight = logoImg.height * scale;

        const logoX = (canvas.width - logoWidth) / 2;
        const padding = 40;
        const logoY =
          logoPosition === "top"
            ? padding
            : logoPosition === "bottom"
            ? canvas.height - logoHeight - padding
            : (canvas.height - logoHeight) / 2;

        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
        downloadCanvasImage();
      };
      logoImg.src = logo;
    };

    const mainImage = new Image();
    mainImage.crossOrigin = "anonymous";
    mainImage.onload = () => {
      // Scale and position main image
      const scale = Math.min(
        canvas.width / mainImage.width,
        canvas.height / mainImage.height
      );
      const w = mainImage.width * scale;
      const h = mainImage.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;

      // Draw main image
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mainImage, x, y, w, h);

      // Configure text style
      const fontSizeValue = FONT_SIZES[fontSize];
      ctx.fillStyle = textColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = textBorder ? borderSize * 2 : 0;
      ctx.font = `${isItalic ? "italic" : ""} ${
        isBold ? "bold" : ""
      } ${fontSizeValue}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Process text
      const lines = overlayText.split("\n");
      const lineHeight = fontSizeValue * 1.2;
      const totalHeight = lineHeight * lines.length;
      const textPadding = 200;

      // Calculate starting Y position
      let startY =
        textPosition === "top"
          ? textPadding
          : textPosition === "bottom"
          ? canvas.height - totalHeight - textPadding
          : (canvas.height - totalHeight) / 2;

      // Draw each line
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        const x = canvas.width / 2;

        // Draw background if enabled
        if (hasTextBackground) {
          const metrics = ctx.measureText(line);
          const padding = fontSizeValue * 0.5;
          const backgroundHeight = fontSizeValue * 1.2;

          ctx.save();
          ctx.fillStyle = textBackgroundColor;
          ctx.fillRect(
            x - metrics.width / 2 - padding,
            y - backgroundHeight / 2,
            metrics.width + padding * 2,
            backgroundHeight
          );
          ctx.restore();
        }

        if (textBorder) {
          ctx.strokeText(line, x, y);
        }
        ctx.fillText(line, x, y);

        if (isUnderline) {
          const metrics = ctx.measureText(line);
          const underlineY = y + fontSizeValue * 0.1;

          ctx.beginPath();
          ctx.moveTo(x - metrics.width / 2, underlineY);
          ctx.lineTo(x + metrics.width / 2, underlineY);
          ctx.lineWidth = fontSizeValue * 0.05;
          ctx.strokeStyle = textColor;
          ctx.stroke();
        }
      });

      drawLogoAndFinish();
    };

    mainImage.src = selectedImage;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const mainImg = new Image();
      mainImg.onload = () => {
        const maxDimension = 1920;
        let width = mainImg.width;
        let height = mainImg.height;

        if (width > maxDimension || height > maxDimension) {
          const scale = Math.min(1080 / mainImg.width, 1920 / mainImg.height);
          width = width * scale;
          height = height * scale;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(mainImg, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelectedImage(dataUrl);
      };
      mainImg.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogo(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="h-screen bg-gradient-to-br from-zinc-900 via-emerald-900 to-green-900 text-zinc-100 overflow-hidden">
      <Navbar variant="dashboard" />

      <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-5rem)] flex flex-col pb-8">
        {/* Prompt Section - Full Row */}
        <div className="w-full py-4">
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
          {/* Left Column - Editor Controls */}
          <div className="bg-zinc-900/95 border border-emerald-800/30 rounded-xl p-6 space-y-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Warning Message - Fixed at top */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 mb-4 rounded-lg p-4 flex-shrink-0">
                <p className="text-yellow-300 text-sm">
                  ⚠️ This is a scaled preview. The final image will be 1080x1920
                  pixels.
                </p>
              </div>
              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Text</label>
                <Textarea
                  placeholder="Add text to your image..."
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  className="bg-zinc-800/30 border-zinc-700/30 text-zinc-100 placeholder:text-zinc-400 min-h-[100px] resize-none"
                />
              </div>

              {/* Font Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as FontSize)}
                    className="w-full bg-zinc-800/30 border-zinc-700/30 text-zinc-100 rounded-md p-2"
                    style={{ backgroundColor: "rgb(24 24 27 / 0.95)" }}
                  >
                    <option value="small" className="bg-zinc-900 text-zinc-100">
                      Small
                    </option>
                    <option
                      value="medium"
                      className="bg-zinc-900 text-zinc-100"
                    >
                      Medium
                    </option>
                    <option value="large" className="bg-zinc-900 text-zinc-100">
                      Large
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Position</label>
                  <select
                    value={textPosition}
                    onChange={(e) =>
                      setTextPosition(e.target.value as TextPosition)
                    }
                    className="w-full bg-zinc-800/30 border-zinc-700/30 text-zinc-100 rounded-md p-2"
                    style={{ backgroundColor: "rgb(24 24 27 / 0.95)" }}
                  >
                    <option value="top" className="bg-zinc-900 text-zinc-100">
                      Top
                    </option>
                    <option
                      value="center"
                      className="bg-zinc-900 text-zinc-100"
                    >
                      Center
                    </option>
                    <option
                      value="bottom"
                      className="bg-zinc-900 text-zinc-100"
                    >
                      Bottom
                    </option>
                  </select>
                </div>
              </div>

              {/* Text Style */}
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Text Style</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsBold(!isBold)}
                    variant={isBold ? "default" : "outline"}
                    className={`flex-1 ${
                      isBold ? "bg-emerald-600" : "bg-zinc-800/30"
                    }`}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setIsItalic(!isItalic)}
                    variant={isItalic ? "default" : "outline"}
                    className={`flex-1 ${
                      isItalic ? "bg-emerald-600" : "bg-zinc-800/30"
                    }`}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setIsUnderline(!isUnderline)}
                    variant={isUnderline ? "default" : "outline"}
                    className={`flex-1 ${
                      isUnderline ? "bg-emerald-600" : "bg-zinc-800/30"
                    }`}
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Text Options */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="textBorder"
                      checked={textBorder}
                      onChange={(e) => setTextBorder(e.target.checked)}
                      className="h-4 w-4 rounded bg-zinc-800/30 border-zinc-700/30 text-emerald-500"
                    />
                    <label
                      htmlFor="textBorder"
                      className="ml-2 text-sm text-zinc-400"
                    >
                      Text Border
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="textBackground"
                      checked={hasTextBackground}
                      onChange={(e) => setHasTextBackground(e.target.checked)}
                      className="h-4 w-4 rounded bg-zinc-800/30 border-zinc-700/30 text-emerald-500"
                    />
                    <label
                      htmlFor="textBackground"
                      className="ml-2 text-sm text-zinc-400"
                    >
                      Text Background
                    </label>
                  </div>
                </div>

                {/* Color Controls */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Text Color */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-zinc-400">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded bg-zinc-800/30"
                      />
                      <span className="text-sm text-zinc-400">{textColor}</span>
                    </div>
                  </div>

                  {/* Border Color */}
                  {textBorder && (
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-zinc-400">
                        Border Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          className="w-8 h-8 rounded bg-zinc-800/30"
                        />
                        <span className="text-sm text-zinc-400">
                          {strokeColor}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Background Color */}
                  {hasTextBackground && (
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-zinc-400">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textBackgroundColor}
                          onChange={(e) =>
                            setTextBackgroundColor(e.target.value)
                          }
                          className="w-8 h-8 rounded bg-zinc-800/30"
                        />
                        <span className="text-sm text-zinc-400">
                          {textBackgroundColor}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Section */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadLogo}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      onClick={() =>
                        document.getElementById("logo-upload")?.click()
                      }
                      variant="outline"
                      className="w-full bg-zinc-800/30"
                    >
                      {logo ? "Change Logo" : "Upload Logo"}
                    </Button>
                  </div>
                  {logo && (
                    <Button
                      onClick={() => setLogo(null)}
                      variant="outline"
                      className="bg-zinc-800/30 hover:bg-red-900/30 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {logo && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Logo Position
                      </label>
                      <select
                        value={logoPosition}
                        onChange={(e) =>
                          setLogoPosition(e.target.value as TextPosition)
                        }
                        className="w-full bg-zinc-800/30 border-zinc-700/30 text-zinc-100 rounded-md p-2"
                        style={{ backgroundColor: "rgb(24 24 27 / 0.95)" }}
                      >
                        <option
                          value="top"
                          className="bg-zinc-900 text-zinc-100"
                        >
                          Top
                        </option>
                        <option
                          value="center"
                          className="bg-zinc-900 text-zinc-100"
                        >
                          Center
                        </option>
                        <option
                          value="bottom"
                          className="bg-zinc-900 text-zinc-100"
                        >
                          Bottom
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm text-zinc-400">
                          Logo Size
                        </label>
                        <span className="text-sm text-zinc-400">
                          {logoSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="864"
                        value={logoSize}
                        onChange={(e) => setLogoSize(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Preview Button */}
              <Button
                variant="outline"
                className="w-full bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-700/30 py-4 cursor-pointer flex-shrink-0 mb-4"
                onClick={() => {
                  const previewWindow = window.open("", "_blank");
                  if (previewWindow) {
                    previewWindow.document.write(`
                    <html>
                      <head>
                        <title>Full Size Preview</title>
                        <style>
                          body { 
                            margin: 0; 
                            padding: 20px;
                            background: #18181B;
                            min-height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: start;
                          }
                          .container {
                            width: 1080px;
                            height: 1920px;
                            position: relative;
                            background: #000;
                          }
                          img {
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                            object-position: left;
                          }
                          .text-overlay {
                            position: absolute;
                            inset: 0;
                            display: flex;
                            align-items: ${
                              textPosition === "top"
                                ? "flex-start"
                                : textPosition === "bottom"
                                ? "flex-end"
                                : "center"
                            };
                            justify-content: center;
                            padding: ${
                              textPosition === "top"
                                ? "4rem 2rem 2rem"
                                : textPosition === "bottom"
                                ? "2rem 2rem 4rem"
                                : "2rem"
                            };
                          }
                          .text {
                            color: ${textColor};
                            font-family: system-ui;
                            font-weight: ${isBold ? "bold" : "normal"};
                            font-style: ${isItalic ? "italic" : "normal"};
                            text-decoration: ${
                              isUnderline ? "underline" : "none"
                            };
                            text-align: center;
                            max-width: 80%;
                            white-space: pre-wrap;
                            font-size: ${FONT_SIZES[fontSize]}px;
                            background-color: ${
                              hasTextBackground
                                ? textBackgroundColor
                                : "transparent"
                            };
                            padding: ${hasTextBackground ? "0.5em 1em" : "0"};
                            border-radius: ${hasTextBackground ? "0.5em" : "0"};
                            ${
                              textBorder
                                ? `
                              -webkit-text-stroke: ${borderSize}px ${strokeColor};
                              text-stroke: ${borderSize}px ${strokeColor};
                            `
                                : !hasTextBackground
                                ? `
                              text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                            `
                                : ""
                            }
                          }
                          .logo-overlay {
                            position: absolute;
                            inset: 0;
                            display: flex;
                            align-items: ${
                              logoPosition === "top"
                                ? "flex-start"
                                : logoPosition === "bottom"
                                ? "flex-end"
                                : "center"
                            };
                            justify-content: center;
                            padding: 2rem;
                          }
                          .logo {
                            max-width: ${logoSize}px;
                            width: auto;
                            height: auto;
                            object-fit: contain;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          ${
                            selectedImage
                              ? `<img src="${selectedImage}" alt="Preview" />`
                              : ""
                          }
                          <div class="text-overlay">
                            <p class="text">${overlayText}</p>
                          </div>
                          ${
                            logo
                              ? `<div class="logo-overlay">
                                  <img src="${logo}" alt="Logo" class="logo" />
                                </div>`
                              : ""
                          }
                        </div>
                      </body>
                    </html>
                  `);
                  }
                }}
              >
                <span className="h-4 w-4 mr-2">🔍</span>
                Preview Full Size
              </Button>
              {/* Download Button - Fixed at bottom */}
              <Button
                onClick={handleDownload}
                disabled={!selectedImage}
                className="w-full  p-4 bg-emerald-600 hover:bg-emerald-700 flex-shrink-0"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </div>
          </div>

          {/* Right Column - Image Preview */}
          <div className="relative bg-zinc-900/95 border border-emerald-800/30 rounded-xl p-6 flex flex-col h-full min-h-0">
            {/* Scrollable preview area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                </div>
              ) : (
                <div
                  className="relative mx-auto bg-black/50 rounded-lg shadow-lg overflow-hidden"
                  style={{ width: "540px", height: "960px" }}
                >
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {/* Text Overlay */}
                  <div
                    className={`absolute inset-0 flex justify-center ${
                      textPosition === "top"
                        ? "items-start pt-8"
                        : textPosition === "center"
                        ? "items-center"
                        : "items-end pb-8"
                    }`}
                  >
                    <div
                      className={`text-center max-w-[80%] ${
                        !textBorder && !hasTextBackground && "drop-shadow-lg"
                      }`}
                      style={{
                        color: textColor,
                        backgroundColor: hasTextBackground
                          ? textBackgroundColor
                          : "transparent",
                        padding: hasTextBackground ? "0.5em 1em" : 0,
                        borderRadius: hasTextBackground ? "0.5em" : 0,
                        fontSize: `${Math.floor(FONT_SIZES[fontSize] * 0.5)}px`,
                        fontWeight: isBold ? "bold" : "normal",
                        fontStyle: isItalic ? "italic" : "normal",
                        textDecoration: isUnderline ? "underline" : "none",
                        ...(textBorder && {
                          WebkitTextStroke: `${borderSize}px ${strokeColor}`,
                        }),
                      }}
                    >
                      {overlayText}
                    </div>
                  </div>

                  {/* Logo Overlay */}
                  {logo && (
                    <div
                      className={`absolute inset-0 flex justify-center ${
                        logoPosition === "top"
                          ? "items-start pt-8"
                          : logoPosition === "center"
                          ? "items-center"
                          : "items-end pb-8"
                      }`}
                    >
                      <img
                        src={logo}
                        alt="Logo"
                        className="w-auto object-contain"
                        style={{
                          maxWidth: `${Math.floor(logoSize * 0.5)}px`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
