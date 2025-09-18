"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, X } from "lucide-react";

type FontSize = "small" | "medium" | "large";
type TextPosition = "top" | "center" | "bottom";

const FONT_SIZES: Record<FontSize, number> = {
  small: 24,
  medium: 36,
  large: 48,
};

interface ImageEditorDrawerProps {
  isOpen: boolean;
  selectedImage: string | null;
  overlayText: string;
  fontSize: FontSize;
  textPosition: TextPosition;
  onClose: () => void;
  onTextChange: (text: string) => void;
  onFontSizeChange: (size: FontSize) => void;
  onTextPositionChange: (position: TextPosition) => void;
  onDownload: () => void;
}

export default function ImageEditorDrawer({
  isOpen,
  selectedImage,
  overlayText,
  fontSize,
  textPosition,
  onClose,
  onTextChange,
  onFontSizeChange,
  onTextPositionChange,
  onDownload,
}: ImageEditorDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        !isOpen && "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-[600px] bg-zinc-900/95 border-l border-emerald-800/30 shadow-xl transform transition-all duration-500 ease-out flex flex-col ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-emerald-800/30">
          <h2 className="text-lg font-semibold text-zinc-100">Edit Image</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-800/50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Input section */}
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Text</label>
              <Textarea
                placeholder="Add text to your image..."
                value={overlayText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  onTextChange(e.target.value)
                }
                className="bg-zinc-800/30 border-zinc-700/30 text-zinc-100 placeholder:text-zinc-400 min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Font Size</label>
              <select
                value={fontSize}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onFontSizeChange(e.target.value as FontSize)
                }
                className="w-full bg-zinc-800/30 border border-zinc-700/30 text-zinc-100 rounded-md p-2 cursor-pointer hover:bg-zinc-700/30 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option className="bg-zinc-800" value="small">
                  Small
                </option>
                <option className="bg-zinc-800" value="medium">
                  Medium
                </option>
                <option className="bg-zinc-800" value="large">
                  Large
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Text Position</label>
              <select
                value={textPosition}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onTextPositionChange(e.target.value as TextPosition)
                }
                className="w-full bg-zinc-800/30 border border-zinc-700/30 text-zinc-100 rounded-md p-2 cursor-pointer hover:bg-zinc-700/30 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option className="bg-zinc-800" value="top">
                  Top
                </option>
                <option className="bg-zinc-800" value="center">
                  Center
                </option>
                <option className="bg-zinc-800" value="bottom">
                  Bottom
                </option>
              </select>
            </div>
          </div>

          <div className="px-6 space-y-6">
            {/* Warning Message */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                ⚠️ This is a scaled preview. The final image will be 1080x1920
                pixels.
              </p>
            </div>

            {/* Image Preview with Text Overlay */}
            <div className="relative w-full aspect-[9/16] bg-black/50 rounded-lg shadow-lg">
              <div
                className={`absolute inset-0 flex ${
                  textPosition === "top"
                    ? "items-start pt-16"
                    : textPosition === "bottom"
                    ? "items-end pb-16"
                    : "items-center"
                } justify-center p-8`}
              >
                <p
                  className="font-bold text-white text-center drop-shadow-lg max-w-[80%] break-words"
                  style={{
                    fontSize: `${FONT_SIZES[fontSize]}px * 0.4`,
                  }}
                >
                  {overlayText}
                </p>
              </div>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Selected image"
                  className="w-full h-full object-contain object-left rounded-lg"
                />
              )}
            </div>

            {/* Preview Button */}
            <Button
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
                          color: white;
                          font-family: system-ui;
                          font-weight: bold;
                          text-align: center;
                          max-width: 80%;
                          font-size: ${FONT_SIZES[fontSize]}px;
                          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
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
                      </div>
                    </body>
                  </html>
                `);
                }
              }}
              variant="outline"
              className="w-full bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-700/30"
            >
              <span className="mr-2">🔍</span>
              Open Full Size Preview
            </Button>

            {/* Download Button */}
            <Button
              onClick={onDownload}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 mb-6 cursor-pointer"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
