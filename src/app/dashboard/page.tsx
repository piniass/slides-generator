"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Sparkles, RotateCcw, X, Download, Grid3x3, LayoutList, Edit2, Type, Bold, Italic, Underline, Image as ImageIcon, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Palette, Square, MoreVertical, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Upload, CaseUpper, CaseLower, CaseSensitive } from "lucide-react";
import JSZip from "jszip";

export default function Dashboard() {
  const [hookIdea, setHookIdea] = useState("");
  const [visualPrompt, setVisualPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [numericValue, setNumericValue] = useState("3");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [blurValue, setBlurValue] = useState(0);
  const [brightnessValue, setBrightnessValue] = useState(1.0);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(48);
  const [textShadow, setTextShadow] = useState(true);
  const [textBold, setTextBold] = useState(true);
  const [textItalic, setTextItalic] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);
  const [textColor, setTextColor] = useState("#FFFFFF"); // Color del texto
  const [textBorder, setTextBorder] = useState(false); // Borde del texto
  const [textBorderWidth, setTextBorderWidth] = useState(2); // Grosor del borde
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [customTexts, setCustomTexts] = useState<(string | null)[]>([]);
  const [imageLinks, setImageLinks] = useState<(string | null)[]>([]); // Enlaces por imagen
  const [imageTitles, setImageTitles] = useState<(string | null)[]>([]); // Títulos por imagen
  const [imageTitleSizes, setImageTitleSizes] = useState<(number | null)[]>([]); // Tamaños de título por imagen
  const [imageLogos, setImageLogos] = useState<(string | null)[]>([]); // Logos por imagen
  const [imageLogoSizes, setImageLogoSizes] = useState<(number | null)[]>([]); // Tamaños de logo por imagen
  const [uploadingLogoIndex, setUploadingLogoIndex] = useState<number | null>(null); // Índice de la imagen donde se está subiendo el logo
  const [editingLogoSizeIndex, setEditingLogoSizeIndex] = useState<number | null>(null); // Índice de la imagen donde se está editando el tamaño del logo
  const [tempLogo, setTempLogo] = useState<string | null>(null); // Logo temporal antes de confirmar
  const [editingLogoSize, setEditingLogoSize] = useState(100); // Tamaño del logo por defecto (100%)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingLink, setEditingLink] = useState(""); // Enlace temporal en edición
  const [editingTitle, setEditingTitle] = useState(""); // Título temporal en edición
  const [editingTitleSize, setEditingTitleSize] = useState(72); // Tamaño del título por defecto (72px)
  const [editingTextBold, setEditingTextBold] = useState(true);
  const [editingTextItalic, setEditingTextItalic] = useState(false);
  const [editingTextUnderline, setEditingTextUnderline] = useState(false);
  const [editingTextColor, setEditingTextColor] = useState("#FFFFFF");
  const [editingTextSize, setEditingTextSize] = useState(48);
  const [editingTextCase, setEditingTextCase] = useState<"none" | "uppercase" | "lowercase" | "capitalize">("none");
  const [openTextCaseMenu, setOpenTextCaseMenu] = useState(false);
  const [changingImageIndex, setChangingImageIndex] = useState<number | null>(null);
  const [imageChangePrompt, setImageChangePrompt] = useState("");
  const [tempUploadedImage, setTempUploadedImage] = useState<string | null>(null); // Imagen temporal antes de confirmar
  const [imageBaseSources, setImageBaseSources] = useState<(string | null)[]>([]); // Almacena la imagen base de cada imagen generada
  const [blurBlocked, setBlurBlocked] = useState<boolean[]>([]); // true = blur bloqueado, false = blur activo
  const [textPositions, setTextPositions] = useState<("top" | "center" | "bottom")[]>([]); // Posición del texto de cada imagen
  const [openTextPositionMenu, setOpenTextPositionMenu] = useState<number | null>(null); // Índice del menú de posición abierto
  const [openImageMenu, setOpenImageMenu] = useState<number | null>(null); // Índice del menú de imagen abierto
  const shouldRegenerateRef = useRef(false);

  const availableFonts = [
    { value: "Inter", label: "Inter" },
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Courier New", label: "Courier New" },
    { value: "Verdana", label: "Verdana" },
    { value: "Georgia", label: "Georgia" },
    { value: "Palatino", label: "Palatino" },
    { value: "Garamond", label: "Garamond" },
    { value: "Comic Sans MS", label: "Comic Sans MS" },
    { value: "Impact", label: "Impact" },
  ];

  const mockTexts = [
    "Descubre las ventajas de usar tecnologías modernas en tu próximo proyecto.",
    "Transforma tus ideas en realidad con herramientas de desarrollo potentes.",
    "Optimiza tu flujo de trabajo con las mejores prácticas de la industria.",
    "Crea experiencias excepcionales que tus usuarios recordarán para siempre.",
    "Acelera tu productividad con soluciones diseñadas para desarrolladores.",
    "Construye aplicaciones escalables que crecen junto con tu negocio.",
    "Mejora la calidad de tu código con frameworks y librerías probadas.",
    "Simplifica procesos complejos con arquitecturas bien diseñadas.",
    "Potencia tu creatividad con herramientas que inspiran innovación.",
    "Conecta con tu audiencia a través de interfaces intuitivas y elegantes.",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Función para esperar a que una fuente esté cargada
  const waitForFont = async (fontFamily: string, fontSize: number): Promise<void> => {
    if (document.fonts && document.fonts.check) {
      const fontString = `bold ${fontSize}px ${fontFamily}`;
      if (document.fonts.check(fontString)) {
        return;
      }
      await document.fonts.ready;
      // Verificar nuevamente después de que las fuentes estén listas
      if (!document.fonts.check(fontString)) {
        // Si la fuente no está disponible, esperar un poco más
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  };

  // Función para dividir texto en líneas que quepan en el ancho máximo
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // Función para generar imágenes
  const generateImages = async () => {
    // Regenerar todas las imágenes existentes, no solo las primeras count
    const currentCount = generatedImages.length;
    const initialCount = parseInt(numericValue) || 6;
    // Usar el máximo entre las imágenes existentes y el count inicial para preservar las añadidas
    const count = Math.max(currentCount, initialCount);
    const images: string[] = [];
    const baseSources: (string | null)[] = [];

    // Usar la imagen de public o la imagen subida
    const baseImageSrc = uploadedImage || "/vertical-image.jpg";

    setIsGenerating(true);

    // Esperar a que la fuente esté cargada
    await waitForFont(fontFamily, fontSize);

    // Asegurar que blurBlocked tenga el tamaño correcto, manteniendo los valores existentes
    setBlurBlocked((prev) => {
      const newBlurBlocked = [...prev];
      while (newBlurBlocked.length < count) {
        // Si es la primera imagen (índice 0), bloquear por defecto, sino blur activo
        const index = newBlurBlocked.length;
        newBlurBlocked.push(index === 0 ? true : false);
      }
      // Si hay más elementos de los necesarios, mantenerlos (por si se redujo el número)
      // Asegurar que la primera imagen esté bloqueada si no hay valor previo
      if (newBlurBlocked.length > 0 && (newBlurBlocked[0] === undefined || newBlurBlocked[0] === false)) {
        newBlurBlocked[0] = true;
      }
      return newBlurBlocked;
    });

    // Asegurar que imageLogos tenga el tamaño correcto (null por defecto = sin logo)
    setImageLogos((prev) => {
      const newLogos = [...prev];
      while (newLogos.length < count) {
        newLogos.push(null);
      }
      return newLogos;
    });

    for (let i = 0; i < count; i++) {
      // Usar la imagen base guardada si existe, sino usar la imagen base actual
      const imageBase = imageBaseSources[i] !== undefined ? imageBaseSources[i] : baseImageSrc;
      baseSources.push(imageBase);
      
      // Usar texto personalizado si existe, sino usar el mockText correspondiente
      const customText = customTexts[i] !== undefined ? customTexts[i] : null;
      // Si no hay texto personalizado y es una imagen añadida (índice >= initialCount), no usar texto
      const textToUse = customText !== null ? customText : (i < initialCount ? mockTexts[i % mockTexts.length] : "");
      
      // Obtener el título si existe
      const customTitle = imageTitles[i] !== undefined ? imageTitles[i] : null;
      // Obtener el tamaño del título si existe
      const customTitleSize = imageTitleSizes[i] !== undefined && imageTitleSizes[i] !== null ? imageTitleSizes[i]! : 72;
      // Obtener el logo si existe
      const customLogo = imageLogos[i] !== undefined ? imageLogos[i] : null;
      // Obtener el tamaño del logo si existe
      const customLogoSize = imageLogoSizes[i] !== undefined && imageLogoSizes[i] !== null ? imageLogoSizes[i]! : 100;
      
      // Obtener la posición del texto para esta imagen (por defecto "center")
      const textPosition = textPositions[i] !== undefined ? textPositions[i] : "center";
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;

    const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve) => {
        img.onload = async () => {
          // Usar la imagen base correcta para esta iteración
          const currentImageBase = imageBase;
          // Capturar el logo para esta iteración
          const currentLogo = customLogo;
          // Dibujar el fondo negro primero
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Aplicar blur solo a la imagen de fondo si es necesario (si no está bloqueado)
          // Usar el estado actual de blurBlocked
          const currentBlurBlocked = blurBlocked[i] === true;
          if (blurValue > 0 && !currentBlurBlocked) {
            // Crear un canvas temporal del tamaño completo del canvas para aplicar el blur
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = canvas.width; // 1080
            tempCanvas.height = canvas.height; // 1920
            const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
            
            if (tempCtx) {
              // Dibujar el fondo negro en el canvas temporal
              tempCtx.fillStyle = "#000000";
              tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
              
              // Escalar la imagen para que cubra todo el canvas (cover, no contain)
              const scale = Math.max(
                tempCanvas.width / img.width,
                tempCanvas.height / img.height
              );
              const w = img.width * scale;
              const h = img.height * scale;
              const x = (tempCanvas.width - w) / 2;
              const y = (tempCanvas.height - h) / 2;
              
              // Aplicar filtro de brillo antes de dibujar
              tempCtx.filter = `brightness(${brightnessValue})`;
              // Dibujar la imagen escalada para cubrir todo el canvas
              tempCtx.drawImage(img, x, y, w, h);
              // Resetear el filtro
              tempCtx.filter = "none";
              
              // Aplicar blur usando box blur (más eficiente que gaussian)
              const radius = Math.max(1, Math.ceil(blurValue));
              
              // Aplicar blur en múltiples pasadas para mejor efecto
              // Usar un tamaño reducido para procesamiento más rápido, pero luego escalar de vuelta
              const processScale = 0.5; // Procesar a la mitad del tamaño para mejor rendimiento
              const processWidth = Math.floor(tempCanvas.width * processScale);
              const processHeight = Math.floor(tempCanvas.height * processScale);
              
              // Crear canvas de procesamiento
              const processCanvas = document.createElement("canvas");
              processCanvas.width = processWidth;
              processCanvas.height = processHeight;
              const processCtx = processCanvas.getContext("2d", { willReadFrequently: true });
              
              if (processCtx) {
                // Escalar la imagen al tamaño de procesamiento
                processCtx.drawImage(tempCanvas, 0, 0, processWidth, processHeight);
                
                // Aplicar blur en el canvas de procesamiento
                for (let pass = 0; pass < 2; pass++) {
                  const imageData = processCtx.getImageData(0, 0, processCanvas.width, processCanvas.height);
                  const data = imageData.data;
                  const blurred = new ImageData(processCanvas.width, processCanvas.height);
                  const blurredData = blurred.data;
                  
                  // Blur horizontal
                  for (let y = 0; y < processCanvas.height; y++) {
                    for (let x = 0; x < processCanvas.width; x++) {
                      let r = 0, g = 0, b = 0, a = 0, count = 0;
                      
                      for (let dx = -radius; dx <= radius; dx++) {
                        const nx = Math.max(0, Math.min(processCanvas.width - 1, x + dx));
                        const idx = (y * processCanvas.width + nx) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        a += data[idx + 3];
                        count++;
                      }
                      
                      const idx = (y * processCanvas.width + x) * 4;
                      blurredData[idx] = r / count;
                      blurredData[idx + 1] = g / count;
                      blurredData[idx + 2] = b / count;
                      blurredData[idx + 3] = a / count;
                    }
                  }
                  
                  // Blur vertical
                  const tempData = new Uint8ClampedArray(blurredData);
                  for (let y = 0; y < processCanvas.height; y++) {
                    for (let x = 0; x < processCanvas.width; x++) {
                      let r = 0, g = 0, b = 0, a = 0, count = 0;
                      
                      for (let dy = -radius; dy <= radius; dy++) {
                        const ny = Math.max(0, Math.min(processCanvas.height - 1, y + dy));
                        const idx = (ny * processCanvas.width + x) * 4;
                        r += tempData[idx];
                        g += tempData[idx + 1];
                        b += tempData[idx + 2];
                        a += tempData[idx + 3];
                        count++;
                      }
                      
                      const idx = (y * processCanvas.width + x) * 4;
                      blurredData[idx] = r / count;
                      blurredData[idx + 1] = g / count;
                      blurredData[idx + 2] = b / count;
                      blurredData[idx + 3] = a / count;
                    }
                  }
                  
                  processCtx.putImageData(blurred, 0, 0);
                }
                
                // Escalar de vuelta al tamaño completo con suavizado
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.imageSmoothingEnabled = true;
                tempCtx.imageSmoothingQuality = "high";
                tempCtx.drawImage(processCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
              }
              
              // Dibujar la imagen con blur en el canvas principal ocupando todo el espacio (1080x1920)
              ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
            } else {
              // Fallback: dibujar sin blur usando cover
              const scale = Math.max(
                canvas.width / img.width,
                canvas.height / img.height
              );
              const w = img.width * scale;
              const h = img.height * scale;
              const x = (canvas.width - w) / 2;
              const y = (canvas.height - h) / 2;
              // Aplicar filtro de brillo antes de dibujar
              ctx.filter = `brightness(${brightnessValue})`;
              ctx.drawImage(img, x, y, w, h);
              // Resetear el filtro antes de dibujar el texto
              ctx.filter = "none";
            }
          } else {
            // Sin desenfoque, dibujar normalmente usando cover para ocupar todo el canvas
            const scale = Math.max(
              canvas.width / img.width,
              canvas.height / img.height
            );
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            // Aplicar filtro de brillo antes de dibujar
            ctx.filter = `brightness(${brightnessValue})`;
            ctx.drawImage(img, x, y, w, h);
            // Resetear el filtro antes de dibujar el texto
            ctx.filter = "none";
          }

          // Configurar el texto (sin desenfoque)
          ctx.fillStyle = textColor;
          // Construir el string de font con los estilos
          const fontStyle = textItalic ? "italic" : "normal";
          const fontWeight = textBold ? "bold" : "normal";
          ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Añadir sombra al texto para mejor legibilidad (solo si está activado)
          if (textShadow) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
          } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          // Dibujar título en la parte superior si existe
          if (customTitle && customTitle.trim()) {
            // Usar el tamaño personalizado del título
            const titleFontSize = customTitleSize;
            const titleFontStyle = textItalic ? "italic" : "normal";
            const titleFontWeight = textBold ? "bold" : "normal";
            ctx.font = `${titleFontStyle} ${titleFontWeight} ${titleFontSize}px ${fontFamily}`;
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            
            // Añadir sombra al título
            if (textShadow) {
              ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 4;
            }
            
            // Dividir el título en líneas
            const maxTitleWidth = 1080 - 80;
            const titleLines = wrapText(ctx, customTitle, maxTitleWidth);
            const titleLineHeight = titleFontSize + 10;
            const titleStartY = 60; // Padding desde arriba
            
            // Dibujar cada línea del título
            titleLines.forEach((line, index) => {
              const y = titleStartY + index * titleLineHeight;
              
              // Si hay borde, dibujar primero el borde
              if (textBorder) {
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = textBorderWidth;
                ctx.lineJoin = "round";
                ctx.miterLimit = 2;
                ctx.strokeText(line, canvas.width / 2, y);
              }
              
              ctx.fillText(line, canvas.width / 2, y);
            });
            
            // Resetear sombra para el texto principal
            if (textShadow) {
              ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 4;
            }
          }
          
          // Solo dibujar texto si hay texto que dibujar
          if (textToUse && textToUse.trim()) {
            // Restaurar el estilo del texto principal
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // Dividir el texto en líneas con wrap (ancho máximo 1080px con padding)
            const maxTextWidth = 1080 - 80; // 40px de padding a cada lado
            const textLines = wrapText(ctx, textToUse, maxTextWidth);
            const lineHeight = 60;
            const totalHeight = lineHeight * textLines.length;
            
            // Calcular startY según la posición del texto
            let startY: number;
            const padding = 100; // Padding desde los bordes
            if (textPosition === "top") {
              startY = padding + lineHeight / 2;
            } else if (textPosition === "bottom") {
              startY = canvas.height - padding - totalHeight + lineHeight / 2;
            } else {
              // center (por defecto)
              startY = canvas.height / 2 - totalHeight / 2 + lineHeight / 2;
            }

            // Dibujar cada línea
            textLines.forEach((line, index) => {
              const y = startY + index * lineHeight;
              
              // Si hay borde, dibujar primero el borde (stroke) y luego el relleno (fill)
              if (textBorder) {
                ctx.strokeStyle = "#000000"; // Borde negro
                ctx.lineWidth = textBorderWidth;
                ctx.lineJoin = "round";
                ctx.miterLimit = 2;
                ctx.strokeText(line, canvas.width / 2, y);
              }
              
              // Dibujar el texto con el color seleccionado
              ctx.fillText(line, canvas.width / 2, y);
              
              // Dibujar subrayado si está activado
              if (textUnderline) {
                const textMetrics = ctx.measureText(line);
                const textWidth = textMetrics.width;
                const underlineY = y + 5; // 5px debajo del texto
                ctx.strokeStyle = textColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - textWidth / 2, underlineY);
                ctx.lineTo(canvas.width / 2 + textWidth / 2, underlineY);
                ctx.stroke();
              }
            });
          }

          // Dibujar logo en la parte inferior si existe
          if (currentLogo && currentLogo.trim()) {
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";
            
            await new Promise<void>((resolveLogo) => {
              logoImg.onload = () => {
                // Tamaño máximo del logo (ajustable)
                const maxLogoWidth = 300;
                const maxLogoHeight = 150;
                const padding = 160; // Padding desde el borde inferior
                
                // Calcular dimensiones manteniendo la proporción
                let logoWidth = logoImg.width;
                let logoHeight = logoImg.height;
                
                if (logoWidth > maxLogoWidth) {
                  const scale = maxLogoWidth / logoWidth;
                  logoWidth = maxLogoWidth;
                  logoHeight = logoHeight * scale;
                }
                
                if (logoHeight > maxLogoHeight) {
                  const scale = maxLogoHeight / logoHeight;
                  logoHeight = maxLogoHeight;
                  logoWidth = logoWidth * scale;
                }
                
                // Posicionar el logo en el centro inferior
                const logoX = (canvas.width - logoWidth) / 2;
                const logoY = canvas.height - logoHeight - padding;
                
                // Dibujar el logo
                ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                resolveLogo();
              };
              logoImg.onerror = () => {
                resolveLogo();
              };
              logoImg.src = currentLogo;
            });
          }

          // Convertir canvas a data URL
          const dataUrl = canvas.toDataURL("image/png");
          images.push(dataUrl);
          resolve();
        };
        img.src = imageBase || baseImageSrc;
      });
    }

    setGeneratedImages(images);
    setImageBaseSources(baseSources);
    
    // Asegurar que las posiciones de texto tengan el tamaño correcto (por defecto "center")
    setTextPositions((prev) => {
      const newPositions = [...prev];
      while (newPositions.length < count) {
        newPositions.push("center");
      }
      // Mantener las posiciones existentes, solo añadir nuevas si es necesario
      return newPositions;
    });

    // Asegurar que imageLogos tenga el tamaño correcto (null por defecto = sin logo)
    setImageLogos((prev) => {
      const newLogos = [...prev];
      while (newLogos.length < count) {
        newLogos.push(null);
      }
      return newLogos;
    });

    // Asegurar que imageLogoSizes tenga el tamaño correcto (null por defecto = tamaño por defecto)
    setImageLogoSizes((prev) => {
      const newLogoSizes = [...prev];
      while (newLogoSizes.length < count) {
        newLogoSizes.push(null);
      }
      return newLogoSizes;
    });
    
    setIsGenerating(false);
  };

  const handleCreateConcepts = async () => {
    shouldRegenerateRef.current = true;
    // Limpiar textos personalizados al crear nuevos conceptos
    setCustomTexts([]);
    // Inicializar el array de blur bloqueado (primera imagen bloqueada por defecto = true, resto activo = false)
    const count = parseInt(numericValue) || 6;
    const initialBlurBlocked = new Array(count).fill(false);
    initialBlurBlocked[0] = true; // Primera imagen bloqueada por defecto
    setBlurBlocked(initialBlurBlocked);
    // Inicializar el array de logos (todos null = sin logo)
    setImageLogos(new Array(count).fill(null));
    // Inicializar el array de tamaños de logos (todos null = tamaño por defecto)
    setImageLogoSizes(new Array(count).fill(null));
    await generateImages();
  };

  const handleReset = () => {
    // Resetear todos los estados a sus valores iniciales
    setHookIdea("");
    setVisualPrompt("");
    setUploadedImage(null);
    setNumericValue("3");
    setGeneratedImages([]);
    setBlurValue(0);
    setBrightnessValue(1.0);
    setFontFamily("Inter");
    setTextShadow(true);
    setTextBold(true);
    setTextItalic(false);
    setTextUnderline(false);
    setCustomTexts([]);
    setImageLinks([]);
    setImageTitles([]);
    setImageTitleSizes([]);
    setImageLogos([]);
    setImageLogoSizes([]);
    setBlurBlocked([]);
    setEditingIndex(null);
    setEditingText("");
    setEditingLink("");
    setEditingTitle("");
    setChangingImageIndex(null);
    setImageChangePrompt("");
    setImageBaseSources([]);
    setCarouselIndex(0);
    setViewMode("grid");
    shouldRegenerateRef.current = false;
    
    // Limpiar el input de archivo si existe
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Regenerar imágenes cuando cambie la fuente, tamaño de fuente, sombra o estilos del texto (solo si ya hay imágenes generadas)
  useEffect(() => {
    if (generatedImages.length > 0 && shouldRegenerateRef.current && !isGenerating) {
      generateImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontFamily, fontSize, textShadow, textBold, textItalic, textUnderline, textColor, textBorder, textBorderWidth]);

  // Regenerar imágenes cuando cambie el blur o el brillo (solo si ya hay imágenes generadas)
  useEffect(() => {
    if (generatedImages.length > 0 && !isGenerating) {
      const timeoutId = setTimeout(() => {
        if (generatedImages.length > 0) {
          generateImages();
        }
      }, 300); // Debounce para evitar regeneraciones excesivas
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blurValue, brightnessValue]);

  // Cerrar el menú de posición de texto al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openTextPositionMenu !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.text-position-menu-container')) {
          setOpenTextPositionMenu(null);
        }
      }
    };

    if (openTextPositionMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openTextPositionMenu]);

  // Cerrar el menú de imagen al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openImageMenu !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.image-menu-container')) {
          setOpenImageMenu(null);
        }
      }
    };

    if (openImageMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openImageMenu]);

  // Cerrar el menú de caso de texto al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openTextCaseMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.text-case-menu-container')) {
          setOpenTextCaseMenu(false);
        }
      }
    };

    if (openTextCaseMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openTextCaseMenu]);


  const handleDownloadZip = async () => {
    if (generatedImages.length === 0) return;

    const zip = new JSZip();

    // Convertir cada imagen data URL a blob y añadirla al zip
    for (let i = 0; i < generatedImages.length; i++) {
      const dataUrl = generatedImages[i];
      // Convertir data URL a blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      zip.file(`concepto-${i + 1}.png`, blob);
    }

    // Generar el archivo zip
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
    link.download = "conceptos.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
  };

  const handleDeleteImage = (index: number) => {
    setGeneratedImages((prev) => prev.filter((_, i) => i !== index));
    setCustomTexts((prev) => prev.filter((_, i) => i !== index));
    setImageLinks((prev) => prev.filter((_, i) => i !== index));
    setImageTitles((prev) => prev.filter((_, i) => i !== index));
    setImageTitleSizes((prev) => prev.filter((_, i) => i !== index));
    setImageLogos((prev) => prev.filter((_, i) => i !== index));
    setBlurBlocked((prev) => prev.filter((_, i) => i !== index));
    setImageBaseSources((prev) => prev.filter((_, i) => i !== index));
    // Si estamos en carrusel y eliminamos la imagen actual, ajustar el índice
    if (viewMode === "carousel") {
      if (carouselIndex >= index && carouselIndex > 0) {
        setCarouselIndex(carouselIndex - 1);
      } else if (carouselIndex >= generatedImages.length - 1) {
        setCarouselIndex(Math.max(0, generatedImages.length - 2));
      }
    }
  };

  // Función para generar una sola imagen
  const generateSingleImage = async (
    imageBaseSrc: string, 
    imageIndex: number, 
    includeText: boolean = true, 
    customText?: string | null, 
    isBlurBlockedOverride?: boolean, 
    textPositionOverride?: "top" | "center" | "bottom",
    customStyles?: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      color?: string;
      size?: number;
    },
    customTitle?: string | null,
    customTitleSize?: number | null,
    customLogo?: string | null,
    customLogoSize?: number | null
  ): Promise<string> => {
    // Usar estilos personalizados si se proporcionan, sino usar los globales
    const textBoldStyle = customStyles?.bold !== undefined ? customStyles.bold : textBold;
    const textItalicStyle = customStyles?.italic !== undefined ? customStyles.italic : textItalic;
    const textUnderlineStyle = customStyles?.underline !== undefined ? customStyles.underline : textUnderline;
    const textColorStyle = customStyles?.color || textColor;
    const textSizeStyle = customStyles?.size || fontSize;
    
    // Esperar a que la fuente esté cargada solo si vamos a añadir texto
    if (includeText) {
      await waitForFont(fontFamily, textSizeStyle);
    }
    
    return new Promise((resolve) => {
      // Usar texto personalizado si existe, sino usar el mockText correspondiente
      let textToUse: string;
      if (includeText) {
        if (customText !== undefined && customText !== null) {
          textToUse = customText;
        } else {
          textToUse = mockTexts[imageIndex % mockTexts.length];
        }
      } else {
        textToUse = "";
      }
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = async () => {
        // Dibujar el fondo negro primero
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Aplicar blur solo a la imagen de fondo si es necesario (si no está bloqueado)
        // Usar el override si se proporciona, sino usar el estado
        const isBlurBlocked = isBlurBlockedOverride !== undefined 
          ? isBlurBlockedOverride 
          : (blurBlocked[imageIndex] === true);
        if (blurValue > 0 && !isBlurBlocked) {
          // Crear un canvas temporal del tamaño completo del canvas para aplicar el blur
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvas.width; // 1080
          tempCanvas.height = canvas.height; // 1920
          const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
          
          if (tempCtx) {
            // Dibujar el fondo negro en el canvas temporal
            tempCtx.fillStyle = "#000000";
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Escalar la imagen para que cubra todo el canvas (cover, no contain)
            const scale = Math.max(
              tempCanvas.width / img.width,
              tempCanvas.height / img.height
            );
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (tempCanvas.width - w) / 2;
            const y = (tempCanvas.height - h) / 2;
            
            // Aplicar filtro de brillo antes de dibujar
            tempCtx.filter = `brightness(${brightnessValue})`;
            // Dibujar la imagen escalada para cubrir todo el canvas
            tempCtx.drawImage(img, x, y, w, h);
            // Resetear el filtro
            tempCtx.filter = "none";
            
            // Aplicar blur usando box blur (más eficiente que gaussian)
            const radius = Math.max(1, Math.ceil(blurValue));
            
            // Aplicar blur en múltiples pasadas para mejor efecto
            // Usar un tamaño reducido para procesamiento más rápido, pero luego escalar de vuelta
            const processScale = 0.5; // Procesar a la mitad del tamaño para mejor rendimiento
            const processWidth = Math.floor(tempCanvas.width * processScale);
            const processHeight = Math.floor(tempCanvas.height * processScale);
            
            // Crear canvas de procesamiento
            const processCanvas = document.createElement("canvas");
            processCanvas.width = processWidth;
            processCanvas.height = processHeight;
            const processCtx = processCanvas.getContext("2d", { willReadFrequently: true });
            
            if (processCtx) {
              // Escalar la imagen al tamaño de procesamiento
              processCtx.drawImage(tempCanvas, 0, 0, processWidth, processHeight);
              
              // Aplicar blur en el canvas de procesamiento
              for (let pass = 0; pass < 2; pass++) {
                const imageData = processCtx.getImageData(0, 0, processCanvas.width, processCanvas.height);
                const data = imageData.data;
                const blurred = new ImageData(processCanvas.width, processCanvas.height);
                const blurredData = blurred.data;
                
                // Blur horizontal
                for (let y = 0; y < processCanvas.height; y++) {
                  for (let x = 0; x < processCanvas.width; x++) {
                    let r = 0, g = 0, b = 0, a = 0, count = 0;
                    
                    for (let dx = -radius; dx <= radius; dx++) {
                      const nx = Math.max(0, Math.min(processCanvas.width - 1, x + dx));
                      const idx = (y * processCanvas.width + nx) * 4;
                      r += data[idx];
                      g += data[idx + 1];
                      b += data[idx + 2];
                      a += data[idx + 3];
                      count++;
                    }
                    
                    const idx = (y * processCanvas.width + x) * 4;
                    blurredData[idx] = r / count;
                    blurredData[idx + 1] = g / count;
                    blurredData[idx + 2] = b / count;
                    blurredData[idx + 3] = a / count;
                  }
                }
                
                // Blur vertical
                const tempData = new Uint8ClampedArray(blurredData);
                for (let y = 0; y < processCanvas.height; y++) {
                  for (let x = 0; x < processCanvas.width; x++) {
                    let r = 0, g = 0, b = 0, a = 0, count = 0;
                    
                    for (let dy = -radius; dy <= radius; dy++) {
                      const ny = Math.max(0, Math.min(processCanvas.height - 1, y + dy));
                      const idx = (ny * processCanvas.width + x) * 4;
                      r += tempData[idx];
                      g += tempData[idx + 1];
                      b += tempData[idx + 2];
                      a += tempData[idx + 3];
                      count++;
                    }
                    
                    const idx = (y * processCanvas.width + x) * 4;
                    blurredData[idx] = r / count;
                    blurredData[idx + 1] = g / count;
                    blurredData[idx + 2] = b / count;
                    blurredData[idx + 3] = a / count;
                  }
                }
                
                processCtx.putImageData(blurred, 0, 0);
              }
              
              // Escalar de vuelta al tamaño completo con suavizado
              tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
              tempCtx.imageSmoothingEnabled = true;
              tempCtx.imageSmoothingQuality = "high";
              tempCtx.drawImage(processCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
            }
            
            // Dibujar la imagen con blur en el canvas principal ocupando todo el espacio (1080x1920)
            ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
          } else {
            // Fallback: dibujar sin blur usando cover
            const scale = Math.max(
              canvas.width / img.width,
              canvas.height / img.height
            );
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            // Aplicar filtro de brillo antes de dibujar
            ctx.filter = `brightness(${brightnessValue})`;
            ctx.drawImage(img, x, y, w, h);
            // Resetear el filtro antes de dibujar el texto
            ctx.filter = "none";
          }
        } else {
          // Sin desenfoque, dibujar normalmente usando cover para ocupar todo el canvas
          const scale = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
          );
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (canvas.width - w) / 2;
          const y = (canvas.height - h) / 2;
          // Aplicar filtro de brillo antes de dibujar
          ctx.filter = `brightness(${brightnessValue})`;
          ctx.drawImage(img, x, y, w, h);
          // Resetear el filtro antes de dibujar el texto
          ctx.filter = "none";
        }

        // Añadir texto solo si includeText es true
        if (includeText) {
          // Configurar el texto (sin desenfoque)
          ctx.fillStyle = textColorStyle;
          // Construir el string de font con los estilos
          const fontStyle = textItalicStyle ? "italic" : "normal";
          const fontWeight = textBoldStyle ? "bold" : "normal";
          ctx.font = `${fontStyle} ${fontWeight} ${textSizeStyle}px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Añadir sombra al texto para mejor legibilidad (solo si está activado)
          if (textShadow) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
          } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          // Dibujar título en la parte superior si existe
          if (customTitle && customTitle.trim()) {
            // Usar el tamaño personalizado si se proporciona, sino usar un tamaño grande por defecto
            const titleFontSize = customTitleSize && customTitleSize > 0 ? customTitleSize : 72;
            const titleFontStyle = textItalicStyle ? "italic" : "normal";
            const titleFontWeight = textBoldStyle ? "bold" : "normal";
            ctx.font = `${titleFontStyle} ${titleFontWeight} ${titleFontSize}px ${fontFamily}`;
            ctx.fillStyle = textColorStyle;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            
            // Añadir sombra al título
            if (textShadow) {
              ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 4;
            }
            
            // Dividir el título en líneas
            const maxTitleWidth = 1080 - 80;
            const titleLines = wrapText(ctx, customTitle, maxTitleWidth);
            const titleLineHeight = titleFontSize + 10;
            const titleStartY = 60; // Padding desde arriba
            
            // Dibujar cada línea del título
            titleLines.forEach((line, index) => {
              const y = titleStartY + index * titleLineHeight;
              
              // Si hay borde, dibujar primero el borde
              if (textBorder) {
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = textBorderWidth;
                ctx.lineJoin = "round";
                ctx.miterLimit = 2;
                ctx.strokeText(line, canvas.width / 2, y);
              }
              
              ctx.fillText(line, canvas.width / 2, y);
            });
            
            // Resetear sombra para el texto principal
            if (textShadow) {
              ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 4;
            }
          }
          
          // Restaurar el estilo del texto principal
          ctx.font = `${fontStyle} ${fontWeight} ${textSizeStyle}px ${fontFamily}`;
          ctx.fillStyle = textColorStyle;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Dividir el texto en líneas con wrap (ancho máximo 1080px con padding)
          const maxTextWidth = 1080 - 80; // 40px de padding a cada lado
          const textLines = wrapText(ctx, textToUse, maxTextWidth);
          const lineHeight = 60;
          const totalHeight = lineHeight * textLines.length;
          
          // Obtener la posición del texto (usar override si se proporciona, sino usar el estado)
          const currentTextPosition = textPositionOverride !== undefined 
            ? textPositionOverride 
            : (textPositions[imageIndex] !== undefined ? textPositions[imageIndex] : "center");
          
          // Calcular startY según la posición del texto
          let startY: number;
          const padding = 100; // Padding desde los bordes
          if (currentTextPosition === "top") {
            startY = padding + lineHeight / 2;
          } else if (currentTextPosition === "bottom") {
            startY = canvas.height - padding - totalHeight + lineHeight / 2;
          } else {
            // center (por defecto)
            startY = canvas.height / 2 - totalHeight / 2 + lineHeight / 2;
          }

          // Dibujar cada línea
          textLines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            
            // Si hay borde, dibujar primero el borde (stroke) y luego el relleno (fill)
            if (textBorder) {
              ctx.strokeStyle = "#000000"; // Borde negro
              ctx.lineWidth = textBorderWidth;
              ctx.lineJoin = "round";
              ctx.miterLimit = 2;
              ctx.strokeText(line, canvas.width / 2, y);
            }
            
            // Dibujar el texto con el color seleccionado
            ctx.fillText(line, canvas.width / 2, y);
            
            // Dibujar subrayado si está activado
            if (textUnderlineStyle) {
              const textMetrics = ctx.measureText(line);
              const textWidth = textMetrics.width;
              const underlineY = y + 5; // 5px debajo del texto
              ctx.strokeStyle = textColorStyle;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(canvas.width / 2 - textWidth / 2, underlineY);
              ctx.lineTo(canvas.width / 2 + textWidth / 2, underlineY);
              ctx.stroke();
            }
          });
        }

        // Dibujar logo en la parte inferior si existe
        if (customLogo && customLogo.trim()) {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          
          await new Promise<void>((resolveLogo) => {
            logoImg.onload = () => {
                // Tamaño base del logo (ajustable)
                const baseLogoWidth = 300;
                const baseLogoHeight = 150;
                const padding = 160; // Padding desde el borde inferior
              
              // Obtener el tamaño personalizado del logo (porcentaje, por defecto 100%)
              const logoSizePercent = customLogoSize !== undefined && customLogoSize !== null ? customLogoSize : 100;
              const sizeMultiplier = logoSizePercent / 100;
              
              // Calcular dimensiones base manteniendo la proporción
              let logoWidth = logoImg.width;
              let logoHeight = logoImg.height;
              
              // Escalar al tamaño base si es necesario
              if (logoWidth > baseLogoWidth) {
                const scale = baseLogoWidth / logoWidth;
                logoWidth = baseLogoWidth;
                logoHeight = logoHeight * scale;
              }
              
              if (logoHeight > baseLogoHeight) {
                const scale = baseLogoHeight / logoHeight;
                logoHeight = baseLogoHeight;
                logoWidth = logoWidth * scale;
              }
              
              // Aplicar el multiplicador de tamaño
              logoWidth = logoWidth * sizeMultiplier;
              logoHeight = logoHeight * sizeMultiplier;
              
              // Posicionar el logo en el centro inferior
              const logoX = (canvas.width - logoWidth) / 2;
              const logoY = canvas.height - logoHeight - padding;
              
              // Dibujar el logo
              ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
              resolveLogo();
            };
            logoImg.onerror = () => {
              resolveLogo();
            };
            logoImg.src = customLogo;
          });
        }

        // Convertir canvas a data URL
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      };
      img.src = imageBaseSrc;
    });
  };

  const handleAddNewImage = async () => {
    // Usar la imagen base actual (subida o la de public)
    const baseImageSrc = uploadedImage || "/vertical-image.jpg";
    
    setIsGenerating(true);
    try {
      // Generar la nueva imagen sin texto usando la imagen base actual
      const newImageIndex = generatedImages.length;
      const newImage = await generateSingleImage(baseImageSrc, newImageIndex, false, null, undefined, undefined, undefined, null, null, null, null);
      if (newImage) {
        setGeneratedImages((prev) => [...prev, newImage]);
        // Añadir null al array de textos personalizados para mantener la sincronización
        setCustomTexts((prev) => [...prev, null]);
        // Añadir null al array de enlaces
        setImageLinks((prev) => [...prev, null]);
        // Añadir null al array de títulos
        setImageTitles((prev) => [...prev, null]);
        // Añadir null al array de tamaños de títulos
        setImageTitleSizes((prev) => [...prev, null]);
        // Añadir null al array de logos
        setImageLogos((prev) => [...prev, null]);
        // Añadir null al array de tamaños de logos
        setImageLogoSizes((prev) => [...prev, null]);
        // Añadir false al array de blur bloqueado (blur activo por defecto)
        setBlurBlocked((prev) => [...prev, false]);
        // Guardar la fuente de imagen base
        setImageBaseSources((prev) => [...prev, baseImageSrc]);
        // Añadir posición de texto por defecto (center)
        setTextPositions((prev) => [...prev, "center"]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = (index: number) => {
    // Obtener el texto actual de la imagen (personalizado o mock)
    const currentText = customTexts[index] !== undefined && customTexts[index] !== null
      ? customTexts[index]!
      : mockTexts[index % mockTexts.length];
    setEditingText(currentText);
    
    // Obtener el enlace actual si existe
    const currentLink = imageLinks[index] !== undefined ? (imageLinks[index] || "") : "";
    setEditingLink(currentLink);
    
    // Obtener el título actual si existe
    const currentTitle = imageTitles[index] !== undefined ? (imageTitles[index] || "") : "";
    setEditingTitle(currentTitle);
    
    // Obtener el tamaño del título actual si existe, sino usar el por defecto
    const currentTitleSize = imageTitleSizes[index] !== undefined && imageTitleSizes[index] !== null 
      ? imageTitleSizes[index]! 
      : 72;
    setEditingTitleSize(currentTitleSize);
    
    // Cargar estilos actuales (por ahora usamos los globales, pero podrían ser específicos por imagen)
    setEditingTextBold(textBold);
    setEditingTextItalic(textItalic);
    setEditingTextUnderline(textUnderline);
    setEditingTextColor(textColor);
    setEditingTextSize(fontSize);
    setEditingTextCase("none"); // Resetear el caso al abrir el editor
    
    setEditingIndex(index);
  };

  // Función para aplicar el caso al texto
  const applyTextCase = (text: string, textCase: "none" | "uppercase" | "lowercase" | "capitalize"): string => {
    if (textCase === "uppercase") {
      return text.toUpperCase();
    } else if (textCase === "lowercase") {
      return text.toLowerCase();
    } else if (textCase === "capitalize") {
      return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return text;
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null) return;

    setIsGenerating(true);
    try {
      // Aplicar el caso al texto antes de guardar
      const finalText = applyTextCase(editingText, editingTextCase);
      
      // Actualizar el texto personalizado
      const newCustomTexts = [...customTexts];
      while (newCustomTexts.length <= editingIndex) {
        newCustomTexts.push(null);
      }
      newCustomTexts[editingIndex] = finalText;
      setCustomTexts(newCustomTexts);

      // Actualizar el enlace
      const newImageLinks = [...imageLinks];
      while (newImageLinks.length <= editingIndex) {
        newImageLinks.push(null);
      }
      newImageLinks[editingIndex] = editingLink.trim() || null;
      setImageLinks(newImageLinks);

      // Actualizar el título
      const newImageTitles = [...imageTitles];
      while (newImageTitles.length <= editingIndex) {
        newImageTitles.push(null);
      }
      newImageTitles[editingIndex] = editingTitle.trim() || null;
      setImageTitles(newImageTitles);

      // Actualizar el tamaño del título
      const newImageTitleSizes = [...imageTitleSizes];
      while (newImageTitleSizes.length <= editingIndex) {
        newImageTitleSizes.push(null);
      }
      newImageTitleSizes[editingIndex] = editingTitle.trim() ? editingTitleSize : null;
      setImageTitleSizes(newImageTitleSizes);

      // Regenerar la imagen específica con el nuevo texto y estilos personalizados
      // Usar la imagen base guardada si existe, sino usar la imagen base actual
      const baseImageSrc = imageBaseSources[editingIndex] !== undefined 
        ? (imageBaseSources[editingIndex] || uploadedImage || "/vertical-image.jpg")
        : (uploadedImage || "/vertical-image.jpg");
      const currentTextPosition = textPositions[editingIndex] !== undefined ? textPositions[editingIndex] : "center";
      const newImage = await generateSingleImage(
        baseImageSrc, 
        editingIndex, 
        true, 
        finalText, 
        undefined, 
        currentTextPosition,
        {
          bold: editingTextBold,
          italic: editingTextItalic,
          underline: editingTextUnderline,
          color: editingTextColor,
          size: editingTextSize
        },
        editingTitle.trim() || null,
        editingTitle.trim() ? editingTitleSize : null,
        imageLogos[editingIndex] !== undefined ? imageLogos[editingIndex] : null,
        imageLogoSizes[editingIndex] !== undefined && imageLogoSizes[editingIndex] !== null ? imageLogoSizes[editingIndex]! : 100
      );
      
      if (newImage) {
        const newGeneratedImages = [...generatedImages];
        newGeneratedImages[editingIndex] = newImage;
        setGeneratedImages(newGeneratedImages);
      }

      // Cerrar el modal
      setEditingIndex(null);
      setEditingText("");
      setEditingLink("");
      setEditingTitle("");
      setEditingTitleSize(72);
      setEditingTextCase("none");
      setOpenTextCaseMenu(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
    setEditingLink("");
    setEditingTitle("");
    setEditingTitleSize(72);
    setEditingTextCase("none");
    setOpenTextCaseMenu(false);
  };

  const handleChangeImage = (index: number) => {
    setChangingImageIndex(index);
    setImageChangePrompt("");
  };

  const handleUploadLogo = (index: number) => {
    setUploadingLogoIndex(index);
    setTempLogo(imageLogos[index] || null);
    // Cargar el tamaño del logo si existe, sino usar 100% por defecto
    const currentLogoSize = imageLogoSizes[index] !== undefined && imageLogoSizes[index] !== null ? imageLogoSizes[index]! : 100;
    setEditingLogoSize(currentLogoSize);
  };

  const handleLogoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setTempLogo(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    if (uploadingLogoIndex === null || !tempLogo) return;

    const index = uploadingLogoIndex;
    
    // Actualizar el logo
    const newImageLogos = [...imageLogos];
    while (newImageLogos.length <= index) {
      newImageLogos.push(null);
    }
    newImageLogos[index] = tempLogo;
    setImageLogos(newImageLogos);

    // Regenerar la imagen con el nuevo logo
    setIsGenerating(true);
    try {
      const baseImageSrc = imageBaseSources[index] !== undefined 
        ? (imageBaseSources[index] || uploadedImage || "/vertical-image.jpg")
        : (uploadedImage || "/vertical-image.jpg");
      const customText = customTexts[index] !== undefined ? customTexts[index] : null;
      const currentBlurBlocked = blurBlocked[index] !== undefined ? blurBlocked[index] : false;
      const currentTextPosition = textPositions[index] !== undefined ? textPositions[index] : "center";
      const customTitle = imageTitles[index] !== undefined ? imageTitles[index] : null;
      const customTitleSize = imageTitleSizes[index] !== undefined && imageTitleSizes[index] !== null ? imageTitleSizes[index]! : 72;
      const customLogo = tempLogo;
      const customLogoSize = editingLogoSize;
      const newImage = await generateSingleImage(
        baseImageSrc, 
        index, 
        true, 
        customText, 
        currentBlurBlocked, 
        currentTextPosition, 
        undefined, 
        customTitle, 
        customTitleSize,
        customLogo,
        customLogoSize
      );
      
      if (newImage) {
        const newGeneratedImages = [...generatedImages];
        newGeneratedImages[index] = newImage;
        setGeneratedImages(newGeneratedImages);
      }
    } finally {
      setIsGenerating(false);
    }

    // Cerrar el modal y limpiar estados temporales
    setUploadingLogoIndex(null);
    setTempLogo(null);
  };

  const handleCancelLogo = () => {
    setUploadingLogoIndex(null);
    setTempLogo(null);
    setEditingLogoSize(100);
    // Resetear el input file
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleEditLogoSize = (index: number) => {
    setEditingLogoSizeIndex(index);
    // Cargar el tamaño actual del logo si existe, sino usar 100% por defecto
    const currentLogoSize = imageLogoSizes[index] !== undefined && imageLogoSizes[index] !== null ? imageLogoSizes[index]! : 100;
    setEditingLogoSize(currentLogoSize);
  };

  const handleSaveLogoSize = async () => {
    if (editingLogoSizeIndex === null) return;

    const index = editingLogoSizeIndex;
    
    // Actualizar el tamaño del logo
    const newImageLogoSizes = [...imageLogoSizes];
    while (newImageLogoSizes.length <= index) {
      newImageLogoSizes.push(null);
    }
    newImageLogoSizes[index] = editingLogoSize;
    setImageLogoSizes(newImageLogoSizes);

    // Regenerar la imagen con el nuevo tamaño de logo
    setIsGenerating(true);
    try {
      const baseImageSrc = imageBaseSources[index] !== undefined 
        ? (imageBaseSources[index] || uploadedImage || "/vertical-image.jpg")
        : (uploadedImage || "/vertical-image.jpg");
      const customText = customTexts[index] !== undefined ? customTexts[index] : null;
      const currentBlurBlocked = blurBlocked[index] !== undefined ? blurBlocked[index] : false;
      const currentTextPosition = textPositions[index] !== undefined ? textPositions[index] : "center";
      const customTitle = imageTitles[index] !== undefined ? imageTitles[index] : null;
      const customTitleSize = imageTitleSizes[index] !== undefined && imageTitleSizes[index] !== null ? imageTitleSizes[index]! : 72;
      const customLogo = imageLogos[index] !== undefined ? imageLogos[index] : null;
      const customLogoSize = editingLogoSize;
      const newImage = await generateSingleImage(
        baseImageSrc, 
        index, 
        true, 
        customText, 
        currentBlurBlocked, 
        currentTextPosition, 
        undefined, 
        customTitle, 
        customTitleSize,
        customLogo,
        customLogoSize
      );
      
      if (newImage) {
        const newGeneratedImages = [...generatedImages];
        newGeneratedImages[index] = newImage;
        setGeneratedImages(newGeneratedImages);
      }
    } finally {
      setIsGenerating(false);
    }

    // Cerrar el modal
    setEditingLogoSizeIndex(null);
    setEditingLogoSize(100);
  };

  const handleCancelLogoSize = () => {
    setEditingLogoSizeIndex(null);
    setEditingLogoSize(100);
  };

  const handleRemoveLogo = async (index: number) => {
    // Eliminar el logo
    const newImageLogos = [...imageLogos];
    while (newImageLogos.length <= index) {
      newImageLogos.push(null);
    }
    newImageLogos[index] = null;
    setImageLogos(newImageLogos);

    // Eliminar el tamaño del logo
    const newImageLogoSizes = [...imageLogoSizes];
    while (newImageLogoSizes.length <= index) {
      newImageLogoSizes.push(null);
    }
    newImageLogoSizes[index] = null;
    setImageLogoSizes(newImageLogoSizes);

    // Regenerar la imagen sin logo
    setIsGenerating(true);
    try {
      const baseImageSrc = imageBaseSources[index] !== undefined 
        ? (imageBaseSources[index] || uploadedImage || "/vertical-image.jpg")
        : (uploadedImage || "/vertical-image.jpg");
      const customText = customTexts[index] !== undefined ? customTexts[index] : null;
      const currentBlurBlocked = blurBlocked[index] !== undefined ? blurBlocked[index] : false;
      const currentTextPosition = textPositions[index] !== undefined ? textPositions[index] : "center";
      const customTitle = imageTitles[index] !== undefined ? imageTitles[index] : null;
      const customTitleSize = imageTitleSizes[index] !== undefined && imageTitleSizes[index] !== null ? imageTitleSizes[index]! : 72;
      const newImage = await generateSingleImage(
        baseImageSrc, 
        index, 
        true, 
        customText, 
        currentBlurBlocked, 
        currentTextPosition, 
        undefined, 
        customTitle,
        customTitleSize,
        null,
        null
      );
      
      if (newImage) {
        const newGeneratedImages = [...generatedImages];
        newGeneratedImages[index] = newImage;
        setGeneratedImages(newGeneratedImages);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newImageSrc = e.target.result as string;
        setTempUploadedImage(newImageSrc);
        // Limpiar el prompt si hay una imagen subida
        setImageChangePrompt("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImageChange = async () => {
    if (changingImageIndex === null) return;
    
    const index = changingImageIndex;
    let newImageSrc: string | null = null;

    // Si hay una imagen temporal, usarla
    if (tempUploadedImage) {
      newImageSrc = tempUploadedImage;
    } else if (imageChangePrompt.trim()) {
      // Si hay un prompt, usar la imagen generada (por ahora la default)
      newImageSrc = "/vertical-image.jpg";
    }

    if (!newImageSrc) return;

    // Actualizar la fuente de imagen base
    const newImageBaseSources = [...imageBaseSources];
    while (newImageBaseSources.length <= index) {
      newImageBaseSources.push(null);
    }
    newImageBaseSources[index] = newImageSrc;
    setImageBaseSources(newImageBaseSources);

    // Regenerar la imagen con la nueva imagen base
    setIsGenerating(true);
    try {
      const customText = customTexts[index] !== undefined ? customTexts[index] : null;
      const currentBlurBlocked = blurBlocked[index] !== undefined ? blurBlocked[index] : false;
      const currentTextPosition = textPositions[index] !== undefined ? textPositions[index] : "center";
      const customTitle = imageTitles[index] !== undefined ? imageTitles[index] : null;
      const customTitleSize = imageTitleSizes[index] !== undefined && imageTitleSizes[index] !== null ? imageTitleSizes[index]! : 72;
      const customLogo = imageLogos[index] !== undefined ? imageLogos[index] : null;
      const customLogoSize = imageLogoSizes[index] !== undefined && imageLogoSizes[index] !== null ? imageLogoSizes[index]! : 100;
      const newImage = await generateSingleImage(newImageSrc, index, true, customText, currentBlurBlocked, currentTextPosition, undefined, customTitle, customTitleSize, customLogo, customLogoSize);
      
      if (newImage) {
        const newGeneratedImages = [...generatedImages];
        newGeneratedImages[index] = newImage;
        setGeneratedImages(newGeneratedImages);
      }
    } finally {
      setIsGenerating(false);
    }

    // Cerrar el modal y limpiar estados temporales
    setChangingImageIndex(null);
    setImageChangePrompt("");
    setTempUploadedImage(null);
  };

  const handleRemoveTempImage = () => {
    setTempUploadedImage(null);
    // Resetear el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleImagePromptChange = async () => {
    if (!imageChangePrompt.trim()) return;

    // Por ahora, usar la imagen de public (en el futuro generará una imagen)
    const generatedImageSrc = "/vertical-image.jpg";
    
    // Guardar la imagen generada en el estado temporal para mostrar preview
    setTempUploadedImage(generatedImageSrc);
    // Resetear el input file si hay una imagen generada
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleCancelImageChange = () => {
    setChangingImageIndex(null);
    setImageChangePrompt("");
    setTempUploadedImage(null);
    // Resetear el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleChangeTextPosition = async (index: number, position: "top" | "center" | "bottom") => {
    // Actualizar la posición del texto
    const newTextPositions = [...textPositions];
    while (newTextPositions.length <= index) {
      newTextPositions.push("center");
    }
    newTextPositions[index] = position;
    setTextPositions(newTextPositions);
    
    // Cerrar el menú
    setOpenTextPositionMenu(null);
    
    // Regenerar la imagen con la nueva posición
    setIsGenerating(true);
    try {
      const baseImageSrc = imageBaseSources[index] !== undefined 
        ? (imageBaseSources[index] || uploadedImage || "/vertical-image.jpg")
        : (uploadedImage || "/vertical-image.jpg");
      const customText = customTexts[index] !== undefined ? customTexts[index] : null;
      const currentBlurBlocked = blurBlocked[index] !== undefined ? blurBlocked[index] : false;
      const customTitle = imageTitles[index] !== undefined ? imageTitles[index] : null;
      const customTitleSize = imageTitleSizes[index] !== undefined && imageTitleSizes[index] !== null ? imageTitleSizes[index]! : 72;
      const newImage = await generateSingleImage(baseImageSrc, index, true, customText, currentBlurBlocked, position, undefined, customTitle, customTitleSize);
      
      if (newImage) {
        const newGeneratedImages = [...generatedImages];
        newGeneratedImages[index] = newImage;
        setGeneratedImages(newGeneratedImages);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleBlur = async (index: number) => {
    // Alternar el estado de blur bloqueado
    const newBlurBlocked = [...blurBlocked];
    while (newBlurBlocked.length <= index) {
      newBlurBlocked.push(false);
    }
    const newBlurBlockedValue = !newBlurBlocked[index];
    newBlurBlocked[index] = newBlurBlockedValue;
    setBlurBlocked(newBlurBlocked);

    // Regenerar la imagen con el nuevo estado de blur (usando el nuevo valor directamente)
    setIsGenerating(true);
    try {
      // Usar la imagen base guardada si existe, sino usar la imagen base actual
      const baseImageSrc = imageBaseSources[index] !== undefined 
        ? (imageBaseSources[index] || uploadedImage || "/vertical-image.jpg")
        : (uploadedImage || "/vertical-image.jpg");
      // Obtener el texto personalizado si existe, sino será null y se usará el mockeado
      const customText = customTexts[index] !== undefined ? customTexts[index] : null;
      // Siempre incluir texto (true), el customText puede ser null y se usará el mockeado
      // Pasar el nuevo estado de bloqueo directamente para que se aplique inmediatamente
      const currentTextPosition = textPositions[index] !== undefined ? textPositions[index] : "center";
      const customTitle = imageTitles[index] !== undefined ? imageTitles[index] : null;
      const customTitleSize = imageTitleSizes[index] !== undefined && imageTitleSizes[index] !== null ? imageTitleSizes[index]! : 72;
      const customLogo = imageLogos[index] !== undefined ? imageLogos[index] : null;
      const customLogoSize = imageLogoSizes[index] !== undefined && imageLogoSizes[index] !== null ? imageLogoSizes[index]! : 100;
      const newImage = await generateSingleImage(baseImageSrc, index, true, customText, newBlurBlockedValue, currentTextPosition, undefined, customTitle, customTitleSize, customLogo, customLogoSize);
      
      if (newImage) {
        const newGeneratedImages = [...generatedImages];
        newGeneratedImages[index] = newImage;
        setGeneratedImages(newGeneratedImages);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadBackgroundImage = async () => {
    // Usar la imagen de public o la imagen subida
    const baseImageSrc = uploadedImage || "/vertical-image.jpg";

        const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise<void>((resolve) => {
      img.onload = () => {
        // Dibujar el fondo negro
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Escalar la imagen para que cubra todo el canvas (cover)
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        
        // Aplicar filtro de brillo antes de dibujar
        ctx.filter = `brightness(${brightnessValue})`;
        // Dibujar solo la imagen de fondo (sin texto)
        ctx.drawImage(img, x, y, w, h);
        // Resetear el filtro
        ctx.filter = "none";
        
        // Convertir canvas a blob y descargar
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve();
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "imagen-fondo.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
        }, "image/png");
      };
      img.src = baseImageSrc;
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <Navbar variant="dashboard" />
      <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Caja de inputs */}
        <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-6 sm:p-8 space-y-6 mb-8 shadow-lg backdrop-blur-sm">
          {/* HOOK IDEA */}
          <div className="space-y-3">
            <label className="text-white text-sm font-semibold block tracking-wide">HOOK IDEA</label>
            <Textarea
              placeholder="Escribe tu hook idea..."
              value={hookIdea}
              onChange={(e) => setHookIdea(e.target.value)}
              className="bg-zinc-900/60 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px] text-base resize-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50"
              rows={4}
            />
          </div>

          {/* VISUAL PROMPT y CUSTOM UPLOAD en fila */}
          <div className="grid grid-cols-2 gap-6">
            {/* VISUAL PROMPT */}
            <div className="space-y-3">
              <label className="text-zinc-400 text-sm font-semibold block tracking-wide">VISUAL PROMPT</label>
              <div className="relative">
            <Input
              type="text"
                  placeholder="Neon cyber city..."
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  disabled={!!uploadedImage}
                  className="bg-zinc-900/60 border-zinc-700 text-zinc-400 placeholder:text-zinc-500 h-12 text-base pr-10 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50"
                />
                {uploadedImage && (
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                )}
        </div>
              </div>

            {/* CUSTOM UPLOAD */}
            <div className="space-y-3">
              <label className="text-white text-sm font-semibold block tracking-wide">CUSTOM UPLOAD</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                {uploadedImage ? (
                  <div className="relative h-12 rounded-md overflow-hidden border border-zinc-700">
                    <img
                      src={uploadedImage}
                      alt="Imagen subida"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 bg-zinc-900/80 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                </div>
                ) : (
                  <button
                    onClick={() => document.getElementById("image-upload")?.click()}
                    className="w-full h-12 rounded-md border border-zinc-700 border-dashed bg-zinc-900/60 hover:bg-zinc-900/80 hover:border-zinc-600 transition-all flex items-center justify-center text-zinc-500 text-sm cursor-pointer"
                  >
                    Click to upload
                  </button>
                )}
              </div>
                </div>
              </div>

          {/* Controles inferiores */}
          <div className="flex items-center gap-4 pt-4">
            {/* Input numérico */}
            <Input
              type="number"
              value={numericValue}
              onChange={(e) => setNumericValue(e.target.value)}
              className="bg-zinc-900/60 border-zinc-700 text-white w-20 h-10 text-center focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50"
            />

            {/* Botón CREATE CONCEPTS */}
                  <Button
              onClick={handleCreateConcepts}
              className="flex-1 bg-white text-black hover:bg-zinc-100 h-12 text-base font-medium rounded-md cursor-pointer"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              CREATE CONCEPTS
                  </Button>

            {/* Botón refresh */}
            <Tooltip>
              <TooltipTrigger asChild>
                  <Button
                  onClick={handleReset}
                  variant="outline"
                  className="h-12 w-12 rounded-full bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 p-0 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4 text-white" />
                  </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Resetear todo</p>
              </TooltipContent>
            </Tooltip>
                </div>
              </div>

        {/* Grid de imágenes generadas */}
        {generatedImages.length > 0 && (
              <div className="space-y-4">
            {/* Toolbar sticky */}
            <div className="sticky top-4 z-10 bg-zinc-800/95 backdrop-blur-md border border-zinc-700/50 rounded-xl p-4 mb-4 shadow-lg">
              <div className="flex flex-col gap-4">
                {/* Primera fila: Controles de imagen */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Grupo: Desenfoque y Brillo */}
                  <div className="flex items-center gap-4 px-3 py-2 bg-zinc-900/40 rounded-lg border border-zinc-700/30">
                    {/* Desenfoque */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <label className="text-zinc-300 text-xs font-medium whitespace-nowrap min-w-[70px]">
                        Blur
                    </label>
                      <div className="flex items-center gap-2 flex-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                    <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.5"
                              value={blurValue}
                              onChange={(e) => setBlurValue(parseFloat(e.target.value))}
                              className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                              aria-label="Blur control"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Blur: {blurValue}px - Applies blur to background images</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-emerald-400 text-xs font-semibold w-8 text-right tabular-nums">
                          {blurValue}px
                        </span>
                  </div>
                </div>

                    <div className="h-5 w-px bg-zinc-700/50" />
                    
                    {/* Brillo */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <label className="text-zinc-300 text-xs font-medium whitespace-nowrap min-w-[50px]">
                        Brightness
                      </label>
                      <div className="flex items-center gap-2 flex-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                      <input
                              type="range"
                              min="0.5"
                              max="2.0"
                              step="0.1"
                              value={brightnessValue}
                              onChange={(e) => setBrightnessValue(parseFloat(e.target.value))}
                              className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                              aria-label="Brightness control"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Brightness: {brightnessValue.toFixed(1)}x - Adjusts the brightness of background images</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-emerald-400 text-xs font-semibold w-8 text-right tabular-nums">
                          {brightnessValue.toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grupo: Fuente */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900/40 rounded-lg border border-zinc-700/30">
                    <label className="text-zinc-300 text-xs font-medium whitespace-nowrap">
                      Font
                      </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                  <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          disabled={isGenerating}
                          className="bg-zinc-900/70 border border-zinc-700 text-white text-xs rounded-md px-3 py-1.5 min-w-[130px] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          style={{ fontFamily: fontFamily }}
                          aria-label="Font selector"
                        >
                          {availableFonts.map((font) => (
                            <option key={font.value} value={font.value} className="bg-zinc-900" style={{ fontFamily: font.value }}>
                              {font.label}
                    </option>
                          ))}
                  </select>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Font: {fontFamily} - Changes the font of the text on images</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <div className="h-5 w-px bg-zinc-700/50" />
                    
                    {/* Tamaño de fuente */}
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <label className="text-zinc-300 text-xs font-medium whitespace-nowrap min-w-[35px]">
                        Size
                      </label>
                      <div className="flex items-center gap-2 flex-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                        <input
                              type="range"
                              min="24"
                              max="96"
                              step="2"
                              value={fontSize}
                              onChange={(e) => setFontSize(parseInt(e.target.value))}
                              className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                              aria-label="Font size control"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Font Size: {fontSize}px - Adjusts the size of the text on images</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-emerald-400 text-xs font-semibold w-8 text-right tabular-nums">
                          {fontSize}px
                        </span>
                      </div>
                    </div>
                </div>

                  {/* Grupo: Estilos de texto */}
                  <div className="flex items-center gap-1.5 px-2 py-2 bg-zinc-900/40 rounded-lg border border-zinc-700/30">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setTextBold(!textBold)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            textBold
                              ? "bg-emerald-600 text-white"
                              : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                          }`}
                          aria-label={textBold ? "Disable bold" : "Enable bold"}
                        >
                          <Bold className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{textBold ? "Disable bold" : "Enable bold"}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setTextItalic(!textItalic)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            textItalic
                              ? "bg-emerald-600 text-white"
                              : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                          }`}
                          aria-label={textItalic ? "Disable italic" : "Enable italic"}
                        >
                          <Italic className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{textItalic ? "Disable italic" : "Enable italic"}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setTextUnderline(!textUnderline)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            textUnderline
                              ? "bg-emerald-600 text-white"
                              : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                          }`}
                          aria-label={textUnderline ? "Disable underline" : "Enable underline"}
                        >
                          <Underline className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{textUnderline ? "Disable underline" : "Enable underline"}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setTextShadow(!textShadow)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            textShadow
                              ? "bg-emerald-600 text-white"
                              : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                          }`}
                          aria-label={textShadow ? "Disable text shadow" : "Enable text shadow"}
                        >
                          <Type className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{textShadow ? "Disable text shadow" : "Enable text shadow"}</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="h-5 w-px bg-zinc-700/50" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                        <input
                          type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border border-zinc-700 bg-transparent"
                            aria-label="Text color"
                          />
                      </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Text color: {textColor}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setTextBorder(!textBorder)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            textBorder
                              ? "bg-emerald-600 text-white"
                              : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                          }`}
                          aria-label={textBorder ? "Disable text border" : "Enable text border"}
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{textBorder ? "Disable text border" : "Enable text border"}</p>
                      </TooltipContent>
                    </Tooltip>
                    </div>

                  {/* Grupo: Vista */}
                  <div className="flex items-center gap-2 px-2 py-2 bg-zinc-900/40 rounded-lg border border-zinc-700/30">
                    <label className="text-zinc-300 text-xs font-medium whitespace-nowrap">
                      View
                    </label>
                    <div className="flex items-center gap-1 bg-zinc-800/50 rounded-md p-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded transition-all cursor-pointer ${
                              viewMode === "grid"
                                ? "bg-emerald-600 text-white"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                            aria-label="Switch to grid view"
                          >
                            <Grid3x3 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Grid View - View images in a grid</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setViewMode("carousel");
                              setCarouselIndex(0);
                            }}
                            className={`p-1.5 rounded transition-all cursor-pointer ${
                              viewMode === "carousel"
                                ? "bg-emerald-600 text-white"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                            aria-label="Switch to carousel view"
                          >
                            <LayoutList className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Carousel View - View images in a carousel</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                </div>
              </div>

                {/* Segunda fila: Botones de descarga */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-700/30">
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs">
                      <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </div>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <Button
                        onClick={handleDownloadBackgroundImage}
                        disabled={isGenerating || (!uploadedImage && !generatedImages.length)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm h-8 px-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Background
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download background image without text</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <Button
                        onClick={handleDownloadZip}
                        disabled={isGenerating || generatedImages.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-8 px-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download ZIP
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download all images in a ZIP file</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                </div>
                </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {generatedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative bg-zinc-800/30 border border-zinc-700/50 rounded-lg overflow-hidden"
                  >
                    <img
                      src={imageUrl}
                      alt={`Concepto ${index + 1}`}
                      className="w-full h-auto object-contain transition-all duration-300"
                      style={{
                        aspectRatio: "1080/1920",
                      }}
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleToggleBlur(index)}
                            disabled={isGenerating}
                            className={`p-2 rounded-full shadow-lg transition-colors cursor-pointer ${
                              blurBlocked[index] === true
                                ? "bg-emerald-600/90 hover:bg-emerald-600 text-white"
                                : "bg-zinc-900/90 hover:bg-zinc-800 text-white"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={`${blurBlocked[index] === true ? "Desbloquear" : "Bloquear"} difuminado de la imagen ${index + 1}`}
                          >
                            <Lock className={`h-4 w-4 ${blurBlocked[index] === true ? "" : "opacity-50"}`} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{blurBlocked[index] === true ? `Desbloquear difuminado - La imagen ${index + 1} no tendrá difuminado` : `Bloquear difuminado - La imagen ${index + 1} tendrá difuminado`}</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="relative image-menu-container">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setOpenImageMenu(openImageMenu === index ? null : index)}
                              className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                              aria-label={`Options for image ${index + 1}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Options for image {index + 1}</p>
                          </TooltipContent>
                        </Tooltip>
                        {openImageMenu === index && (
                          <div className="absolute top-full right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[180px]">
                            <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide border-b border-zinc-700">
                              Text Position
                            </div>
                            <button
                              onClick={() => {
                                handleChangeTextPosition(index, "top");
                                setOpenImageMenu(null);
                              }}
                              disabled={isGenerating}
                              className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                textPositions[index] === "top" ? "bg-zinc-700/50" : ""
                              }`}
                            >
                              <AlignVerticalJustifyStart className="h-4 w-4" />
                              Top
                            </button>
                            <button
                              onClick={() => {
                                handleChangeTextPosition(index, "center");
                                setOpenImageMenu(null);
                              }}
                              disabled={isGenerating}
                              className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                textPositions[index] === "center" ? "bg-zinc-700/50" : ""
                              }`}
                            >
                              <AlignVerticalJustifyCenter className="h-4 w-4" />
                              Center
                            </button>
                            <button
                              onClick={() => {
                                handleChangeTextPosition(index, "bottom");
                                setOpenImageMenu(null);
                              }}
                              disabled={isGenerating}
                              className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                textPositions[index] === "bottom" ? "bg-zinc-700/50" : ""
                              }`}
                            >
                              <AlignVerticalJustifyEnd className="h-4 w-4" />
                              Bottom
                            </button>
                            <div className="h-px bg-zinc-700 my-1" />
                            <button
                              onClick={() => {
                                handleEditImage(index);
                                setOpenImageMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit text
                            </button>
                            <button
                              onClick={() => {
                                handleChangeImage(index);
                                setOpenImageMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
                            >
                              <ImageIcon className="h-4 w-4" />
                              Change image
                            </button>
                            <button
                              onClick={() => {
                                handleUploadLogo(index);
                                setOpenImageMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Upload logo
                            </button>
                            {imageLogos[index] && (
                              <>
                                <div className="h-px bg-zinc-700 my-1" />
                                <button
                                  onClick={() => {
                                    handleEditLogoSize(index);
                                    setOpenImageMenu(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
                                >
                                  <Square className="h-4 w-4" />
                                  Edit logo size
                                </button>
                                <button
                                  onClick={async () => {
                                    await handleRemoveLogo(index);
                                    setOpenImageMenu(null);
                                  }}
                                  disabled={isGenerating}
                                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X className="h-4 w-4" />
                                  Remove logo
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleDeleteImage(index)}
                            className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                            aria-label={`Delete image ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete image {index + 1}</p>
                        </TooltipContent>
                      </Tooltip>
                          </div>
                        </div>
                ))}
                {/* Botón para añadir nueva imagen */}
                <button
                  onClick={handleAddNewImage}
                  disabled={isGenerating}
                  className="relative bg-zinc-800/30 border border-zinc-700/50 border-dashed rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-zinc-800/40 hover:border-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    aspectRatio: "1080/1920",
                    minHeight: "200px",
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors p-4">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-sm font-medium">Añadir imagen</span>
            </div>
                </button>
                </div>
              ) : (
              <div className="relative flex justify-center w-full">
                {/* Carrusel */}
                <div className="relative bg-zinc-800/30 border border-zinc-700/50 rounded-lg overflow-hidden max-w-4xl w-full">
                  <div 
                    className="relative w-full flex items-center justify-center"
                    style={{ 
                      aspectRatio: "1080/1920", 
                      maxHeight: "80vh", 
                      minHeight: "400px"
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={generatedImages[carouselIndex]}
                        alt={`Concepto ${carouselIndex + 1}`}
                        className="max-w-full max-h-full w-auto h-auto object-contain transition-all duration-300"
                      />
                      </div>
                </div>

                  {/* Controles del carrusel */}
                  {generatedImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCarouselIndex((prev) =>
                            prev > 0 ? prev - 1 : generatedImages.length - 1
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-900/80 hover:bg-zinc-800 text-white p-2 rounded-full transition-all cursor-pointer"
                        aria-label="Imagen anterior"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                      onClick={() =>
                          setCarouselIndex((prev) =>
                            prev < generatedImages.length - 1 ? prev + 1 : 0
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-900/80 hover:bg-zinc-800 text-white p-2 rounded-full transition-all cursor-pointer"
                        aria-label="Imagen siguiente"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Indicadores */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 items-center">
                    {generatedImages.map((_, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setCarouselIndex(index)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              index === carouselIndex
                                ? "bg-emerald-600 w-8"
                                : "bg-zinc-600/50 w-2 hover:bg-zinc-500"
                            }`}
                            aria-label={`Ir a imagen ${index + 1}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ir a imagen {index + 1}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {/* Botón para añadir nueva imagen en el carousel */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleAddNewImage}
                          disabled={isGenerating}
                          className="ml-2 p-2 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-full transition-colors shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Añadir nueva imagen"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Añadir nueva imagen sin texto</p>
                      </TooltipContent>
                    </Tooltip>
                    </div>

                  {/* Contador y botones */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="bg-zinc-900/80 text-white text-xs px-3 py-1.5 rounded-full">
                      {carouselIndex + 1} / {generatedImages.length}
                      </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleToggleBlur(carouselIndex)}
                          disabled={isGenerating}
                          className={`p-2 rounded-full shadow-lg transition-colors cursor-pointer ${
                            blurBlocked[carouselIndex] === true
                              ? "bg-emerald-600/90 hover:bg-emerald-600 text-white"
                              : "bg-zinc-900/90 hover:bg-zinc-800 text-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          aria-label={`${blurBlocked[carouselIndex] === true ? "Unlock" : "Lock"} blur for image ${carouselIndex + 1}`}
                        >
                          <Lock className={`h-4 w-4 ${blurBlocked[carouselIndex] === true ? "" : "opacity-50"}`} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{blurBlocked[carouselIndex] === true ? `Unlock blur - Image ${carouselIndex + 1} will not have blur` : `Lock blur - Image ${carouselIndex + 1} will have blur`}</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="relative image-menu-container">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setOpenImageMenu(openImageMenu === carouselIndex ? null : carouselIndex)}
                            className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                            aria-label={`Options for image ${carouselIndex + 1}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Options for image {carouselIndex + 1}</p>
                        </TooltipContent>
                      </Tooltip>
                      {openImageMenu === carouselIndex && (
                        <div className="absolute top-full right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[180px]">
                          <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide border-b border-zinc-700">
                            Text Position
                          </div>
                          <button
                            onClick={() => {
                              handleChangeTextPosition(carouselIndex, "top");
                              setOpenImageMenu(null);
                            }}
                            disabled={isGenerating}
                            className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              textPositions[carouselIndex] === "top" ? "bg-zinc-700/50" : ""
                            }`}
                          >
                            <AlignVerticalJustifyStart className="h-4 w-4" />
                            Top
                          </button>
                          <button
                            onClick={() => {
                              handleChangeTextPosition(carouselIndex, "center");
                              setOpenImageMenu(null);
                            }}
                            disabled={isGenerating}
                            className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              textPositions[carouselIndex] === "center" ? "bg-zinc-700/50" : ""
                            }`}
                          >
                            <AlignVerticalJustifyCenter className="h-4 w-4" />
                            Center
                          </button>
                          <button
                            onClick={() => {
                              handleChangeTextPosition(carouselIndex, "bottom");
                              setOpenImageMenu(null);
                            }}
                            disabled={isGenerating}
                            className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              textPositions[carouselIndex] === "bottom" ? "bg-zinc-700/50" : ""
                            }`}
                          >
                            <AlignVerticalJustifyEnd className="h-4 w-4" />
                            Bottom
                          </button>
                          <div className="h-px bg-zinc-700 my-1" />
                          <button
                            onClick={() => {
                              handleEditImage(carouselIndex);
                              setOpenImageMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit text
                          </button>
                          <button
                            onClick={() => {
                              handleChangeImage(carouselIndex);
                              setOpenImageMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Change image
                          </button>
                          <button
                            onClick={() => {
                              handleUploadLogo(carouselIndex);
                              setOpenImageMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Upload logo
                          </button>
                          {imageLogos[carouselIndex] && (
                            <>
                              <div className="h-px bg-zinc-700 my-1" />
                              <button
                                onClick={() => {
                                  handleEditLogoSize(carouselIndex);
                                  setOpenImageMenu(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
                              >
                                <Square className="h-4 w-4" />
                                Edit logo size
                              </button>
                              <button
                                onClick={async () => {
                                  await handleRemoveLogo(carouselIndex);
                                  setOpenImageMenu(null);
                                }}
                                disabled={isGenerating}
                                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <X className="h-4 w-4" />
                                Remove logo
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleDeleteImage(carouselIndex)}
                          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-full transition-colors shadow-lg cursor-pointer"
                          aria-label={`Delete image ${carouselIndex + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete image {carouselIndex + 1}</p>
                      </TooltipContent>
                    </Tooltip>
                    </div>
                      </div>
                    </div>
                )}
              </div>
              )}

        {/* Modal de edición de texto */}
        {editingIndex !== null && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-3xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">
                Edit text of image {editingIndex + 1}
              </h2>
              
              {/* Input para título */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Title (opcional) - Se mostrará en la parte superior de la imagen
                  </label>
                  <Input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    placeholder="Escribe un título para la imagen..."
                    className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                {editingTitle && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 flex items-center justify-between">
                      <span>Title Size</span>
                      <span className="text-emerald-400 text-sm font-semibold tabular-nums">
                        {editingTitleSize}px
                      </span>
                    </label>
                    <input
                      type="range"
                      min="36"
                      max="144"
                      step="4"
                      value={editingTitleSize}
                      onChange={(e) => setEditingTitleSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      aria-label="Title size control"
                    />
                  </div>
                )}
              </div>
              
              {/* Barra de herramientas de formato */}
              <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 space-y-3">
                {/* Primera fila: Estilos básicos */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setEditingTextBold(!editingTextBold)}
                        className={`p-2 rounded transition-all cursor-pointer ${
                          editingTextBold
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                        }`}
                        aria-label={editingTextBold ? "Disable bold" : "Enable bold"}
                      >
                        <Bold className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{editingTextBold ? "Disable bold" : "Enable bold"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setEditingTextItalic(!editingTextItalic)}
                        className={`p-2 rounded transition-all cursor-pointer ${
                          editingTextItalic
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                        }`}
                        aria-label={editingTextItalic ? "Disable italic" : "Enable italic"}
                      >
                        <Italic className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{editingTextItalic ? "Disable italic" : "Enable italic"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setEditingTextUnderline(!editingTextUnderline)}
                        className={`p-2 rounded transition-all cursor-pointer ${
                          editingTextUnderline
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                        }`}
                        aria-label={editingTextUnderline ? "Disable underline" : "Enable underline"}
                      >
                        <Underline className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{editingTextUnderline ? "Disable underline" : "Enable underline"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="h-6 w-px bg-zinc-700" />
                  {/* Botón para cambiar caso del texto */}
                  <div className="relative text-case-menu-container">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setOpenTextCaseMenu(!openTextCaseMenu)}
                          className={`p-2 rounded transition-all cursor-pointer ${
                            editingTextCase !== "none"
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                          }`}
                          aria-label="Change text case"
                        >
                          {editingTextCase === "uppercase" ? (
                            <CaseUpper className="h-4 w-4" />
                          ) : editingTextCase === "lowercase" ? (
                            <CaseLower className="h-4 w-4" />
                          ) : editingTextCase === "capitalize" ? (
                            <CaseSensitive className="h-4 w-4" />
                          ) : (
                            <Type className="h-4 w-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Change text case</p>
                      </TooltipContent>
                    </Tooltip>
                    {openTextCaseMenu && (
                      <div className="absolute top-full left-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[140px]">
                        <button
                          onClick={() => {
                            setEditingTextCase("none");
                            setOpenTextCaseMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                            editingTextCase === "none" ? "bg-zinc-700/50" : ""
                          }`}
                        >
                          <Type className="h-4 w-4" />
                          Normal
                        </button>
                        <button
                          onClick={() => {
                            setEditingTextCase("uppercase");
                            setOpenTextCaseMenu(false);
                            // Aplicar cambio inmediatamente
                            setEditingText(editingText.toUpperCase());
                          }}
                          className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                            editingTextCase === "uppercase" ? "bg-zinc-700/50" : ""
                          }`}
                        >
                          <CaseUpper className="h-4 w-4" />
                          UPPERCASE
                        </button>
                        <button
                          onClick={() => {
                            setEditingTextCase("lowercase");
                            setOpenTextCaseMenu(false);
                            // Aplicar cambio inmediatamente
                            setEditingText(editingText.toLowerCase());
                          }}
                          className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                            editingTextCase === "lowercase" ? "bg-zinc-700/50" : ""
                          }`}
                        >
                          <CaseLower className="h-4 w-4" />
                          lowercase
                        </button>
                        <button
                          onClick={() => {
                            setEditingTextCase("capitalize");
                            setOpenTextCaseMenu(false);
                            // Aplicar cambio inmediatamente - capitalizar primera letra de cada palabra
                            const capitalized = editingText
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                              .join(' ');
                            setEditingText(capitalized);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                            editingTextCase === "capitalize" ? "bg-zinc-700/50" : ""
                          }`}
                        >
                          <CaseSensitive className="h-4 w-4" />
                          Capitalize
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="h-6 w-px bg-zinc-700" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <input
                          type="color"
                          value={editingTextColor}
                          onChange={(e) => setEditingTextColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border border-zinc-700 bg-transparent"
                          aria-label="Text color"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Text color: {editingTextColor}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="h-6 w-px bg-zinc-700" />
                  {/* Selector de tamaño de fuente */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400 whitespace-nowrap">Size:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="24"
                        max="96"
                        step="2"
                        value={editingTextSize}
                        onChange={(e) => setEditingTextSize(parseInt(e.target.value))}
                        className="w-20 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        aria-label="Font size control"
                      />
                      <span className="text-emerald-400 text-xs font-semibold w-8 text-right tabular-nums">
                        {editingTextSize}px
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Segunda fila: Selector de fuente */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-400 whitespace-nowrap">Font:</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="bg-zinc-900/70 border border-zinc-700 text-white text-xs rounded-md px-3 py-1.5 min-w-[130px] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    style={{ fontFamily: fontFamily }}
                    aria-label="Font selector"
                  >
                    {availableFonts.map((font) => (
                      <option key={font.value} value={font.value} className="bg-zinc-900" style={{ fontFamily: font.value }}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview del texto con estilos aplicados */}
              <div className="bg-zinc-900/30 border border-zinc-700 rounded-lg p-4">
                <label className="text-xs text-zinc-400 mb-2 block">Preview:</label>
                {editingTitle && (
                  <div
                    className="text-center mb-3"
                    style={{
                      color: editingTextColor,
                      fontSize: `${Math.max(32, editingTextSize * 0.6)}px`,
                      fontFamily: fontFamily,
                      fontWeight: editingTextBold ? "bold" : "normal",
                      fontStyle: editingTextItalic ? "italic" : "normal",
                    }}
                  >
                    {editingTitle}
                  </div>
                )}
                <div
                  className="text-center"
                  style={{
                    color: editingTextColor,
                    fontSize: `${editingTextSize}px`,
                    fontFamily: fontFamily,
                    fontWeight: editingTextBold ? "bold" : "normal",
                    fontStyle: editingTextItalic ? "italic" : "normal",
                    textDecoration: editingTextUnderline ? "underline" : "none",
                    textTransform: editingTextCase === "none" ? "none" : editingTextCase,
                  }}
                >
                  {editingText || "Your text will appear here..."}
                </div>
              </div>

              {/* Textarea para editar el texto */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Text Content</label>
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  placeholder="Write the text for this image..."
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[150px] text-base"
                  rows={6}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-700">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="border-zinc-500 text-white hover:bg-zinc-600 hover:text-white hover:border-zinc-500 bg-zinc-700/50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isGenerating}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isGenerating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para cambiar imagen */}
        {changingImageIndex !== null && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-2xl w-full space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Change image {changingImageIndex + 1}
              </h2>
              
              {/* Preview de imagen (si hay una imagen temporal) */}
              {tempUploadedImage && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Image Preview</label>
                  <div className="relative">
                    <img
                      src={tempUploadedImage}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg border border-zinc-700"
                    />
                    <button
                      onClick={handleRemoveTempImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    </div>
                </div>
              )}

              {/* Opción 1: Subir imagen */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadChange}
                  disabled={!!tempUploadedImage}
                  className="w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

              {/* Separador */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-zinc-700"></div>
                <span className="text-sm text-zinc-400">OR</span>
                <div className="flex-1 h-px bg-zinc-700"></div>
          </div>

              {/* Opción 2: Prompt para generar imagen */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Generate Image (Future Feature)</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={imageChangePrompt}
                    onChange={(e) => setImageChangePrompt(e.target.value)}
                    placeholder="Enter prompt to generate image..."
                    className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 flex-1"
                    disabled={!!tempUploadedImage}
                  />
                  <Button
                    onClick={handleImagePromptChange}
                    disabled={isGenerating || !imageChangePrompt.trim() || !!tempUploadedImage}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Generate
                  </Button>
        </div>
                <p className="text-xs text-zinc-400">
                  Currently returns the default image. Image generation will be available in the future.
                </p>
      </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  onClick={handleCancelImageChange}
                  variant="outline"
                  className="border-zinc-500 text-white hover:bg-zinc-600 hover:text-white hover:border-zinc-500 bg-zinc-700/50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveImageChange}
                  disabled={!tempUploadedImage && !imageChangePrompt.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save
                </Button>
    </div>
          </div>
        </div>
              )}

        {/* Modal para subir logo */}
        {uploadingLogoIndex !== null && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-2xl w-full space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Upload logo for image {uploadingLogoIndex + 1}
              </h2>
              
              {/* Preview de logo (si hay un logo temporal) */}
              {tempLogo && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Logo Preview</label>
                  <div className="relative">
                    <img
                      src={tempLogo}
                      alt="Logo Preview"
                      className="w-full h-48 object-contain rounded-lg border border-zinc-700 bg-zinc-900/50"
                    />
                    <button
                      onClick={() => {
                        setTempLogo(null);
                        const fileInput = document.querySelector('input[type="file"][id="logo-upload"]') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = '';
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                      aria-label="Remove logo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400">
                    El logo se mostrará en la parte inferior de la imagen, centrado.
                  </p>
                </div>
              )}

              {/* Opción: Subir logo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Upload Logo</label>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUploadChange}
                  disabled={!!tempLogo}
                  className="w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-zinc-400">
                  El logo se redimensionará automáticamente para ajustarse (máximo 300x150px).
                </p>
              </div>

              {/* Slider para el tamaño del logo */}
              {(tempLogo || imageLogos[uploadingLogoIndex]) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Logo Size: {editingLogoSize}%</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="25"
                      max="200"
                      step="5"
                      value={editingLogoSize}
                      onChange={(e) => setEditingLogoSize(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      aria-label="Logo size control"
                    />
                    <span className="text-emerald-400 text-sm font-semibold w-12 text-right tabular-nums">
                      {editingLogoSize}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Ajusta el tamaño del logo (25% - 200%).
                  </p>
                </div>
              )}

              {/* Mostrar logo actual si existe */}
              {imageLogos[uploadingLogoIndex] && !tempLogo && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Current Logo</label>
                  <div className="relative">
                    <img
                      src={imageLogos[uploadingLogoIndex]!}
                      alt="Current Logo"
                      className="w-full h-48 object-contain rounded-lg border border-zinc-700 bg-zinc-900/50"
                    />
                    <button
                      onClick={() => handleRemoveLogo(uploadingLogoIndex)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                      aria-label="Remove logo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                {/* Botón para eliminar logo si existe */}
                {imageLogos[uploadingLogoIndex] && !tempLogo && (
                  <Button
                    onClick={async () => {
                      if (uploadingLogoIndex !== null) {
                        await handleRemoveLogo(uploadingLogoIndex);
                        handleCancelLogo();
                      }
                    }}
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 bg-transparent cursor-pointer"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Logo
                  </Button>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <Button
                    onClick={handleCancelLogo}
                    variant="outline"
                    className="border-zinc-500 text-white hover:bg-zinc-600 hover:text-white hover:border-zinc-500 bg-zinc-700/50 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveLogo}
                    disabled={!tempLogo}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar tamaño del logo */}
        {editingLogoSizeIndex !== null && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Edit logo size for image {editingLogoSizeIndex + 1}
              </h2>
              
              {/* Preview del logo actual */}
              {imageLogos[editingLogoSizeIndex] && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Current Logo</label>
                  <div className="relative">
                    <img
                      src={imageLogos[editingLogoSizeIndex]!}
                      alt="Current Logo"
                      className="w-full h-48 object-contain rounded-lg border border-zinc-700 bg-zinc-900/50"
                      style={{
                        transform: `scale(${editingLogoSize / 100})`,
                        transformOrigin: 'center',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Slider para el tamaño del logo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Logo Size: {editingLogoSize}%</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="5"
                    value={editingLogoSize}
                    onChange={(e) => setEditingLogoSize(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    aria-label="Logo size control"
                  />
                  <span className="text-emerald-400 text-sm font-semibold w-12 text-right tabular-nums">
                    {editingLogoSize}%
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Ajusta el tamaño del logo (25% - 200%).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-700">
                <Button
                  onClick={handleCancelLogoSize}
                  variant="outline"
                  className="border-zinc-500 text-white hover:bg-zinc-600 hover:text-white hover:border-zinc-500 bg-zinc-700/50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveLogoSize}
                  disabled={isGenerating}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}
