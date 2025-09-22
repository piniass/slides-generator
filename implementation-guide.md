Here's what you need to implement:

1. First, add these imports at the top of your file:

```tsx
import { Download, X, Bold, Italic, Underline } from "lucide-react";
```

2. Update your ImageEditorDrawerProps interface to include the new props:

```tsx
interface ImageEditorDrawerProps {
  // ... existing props ...
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  onBoldChange: (bold: boolean) => void;
  onItalicChange: (italic: boolean) => void;
  onUnderlineChange: (underline: boolean) => void;
}
```

3. Add this JSX after your text position select:

```tsx
<div className="space-y-2">
  <label className="text-sm text-zinc-400">Text Style</label>
  <div className="flex gap-2">
    <Button
      type="button"
      onClick={() => onBoldChange(!isBold)}
      variant={isBold ? "default" : "outline"}
      className={`flex-1 ${
        isBold
          ? "bg-emerald-600 hover:bg-emerald-700"
          : "bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-700/30"
      }`}
    >
      <Bold className="h-4 w-4" />
    </Button>
    <Button
      type="button"
      onClick={() => onItalicChange(!isItalic)}
      variant={isItalic ? "default" : "outline"}
      className={`flex-1 ${
        isItalic
          ? "bg-emerald-600 hover:bg-emerald-700"
          : "bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-700/30"
      }`}
    >
      <Italic className="h-4 w-4" />
    </Button>
    <Button
      type="button"
      onClick={() => onUnderlineChange(!isUnderline)}
      variant={isUnderline ? "default" : "outline"}
      className={`flex-1 ${
        isUnderline
          ? "bg-emerald-600 hover:bg-emerald-700"
          : "bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-700/30"
      }`}
    >
      <Underline className="h-4 w-4" />
    </Button>
  </div>
</div>
```

4. Update the text preview styles to include these styles:

```tsx
style={{
  color: textColor,
  fontSize: `${FONT_SIZES[fontSize]}px * 0.4`,
  fontWeight: isBold ? "bold" : "normal",
  fontStyle: isItalic ? "italic" : "normal",
  textDecoration: isUnderline ? "underline" : "none",
  ...(textBorder && {
    WebkitTextStroke: `${borderSize - 1}px ${strokeColor}`,
    textStroke: `${borderSize - 1}px ${strokeColor}`,
  }),
}}
```
