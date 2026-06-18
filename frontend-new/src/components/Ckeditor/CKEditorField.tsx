import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
}

export default function CKEditorField({ value, onChange, readOnly = false}: Props) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
 
 
  
  useEffect(() => {
    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5.css";
    document.head.appendChild(link);

    // Load Script
    const script = document.createElement("script");
    script.src = "https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5.umd.js";
    script.async = true;
    script.onload = () => {
      const { ClassicEditor, Essentials, Bold, Italic, Underline,
              Strikethrough, Paragraph, Heading, List, BlockQuote,
              Undo } = (window as any).CKEDITOR;

      ClassicEditor.create(containerRef.current, {
        plugins: [Essentials, Bold, Italic, Underline, Strikethrough,
                  Paragraph, Heading, List, BlockQuote, Undo],
        toolbar: [
          "heading", "|",
          "bold", "italic", "underline", "strikethrough", "|",
          "bulletedList", "numberedList", "|",
          "blockQuote", "|",
          "undo", "redo"
          // ❌ tidak ada image, link
        ],
      }).then((editor: any) => {
        editorRef.current = editor;
        editor.setData(value);
        if(readOnly){
          editor.enableReadOnlyMode('view'); 
        }
        editor.model.document.on("change:data", () => {
          onChange(editor.getData());
        });
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      editorRef.current?.destroy();
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return <div ref={containerRef} />;
}