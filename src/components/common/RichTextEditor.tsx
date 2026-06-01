"use client";

import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const toolbarButtonClass =
  "min-h-9 rounded-lg border border-text-secondary/15 bg-card px-2.5 text-xs font-bold text-text-primary transition-colors hover:bg-text-secondary/5";

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const syncValue = () => {
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const runCommand = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    syncValue();
  };

  const setLink = () => {
    const url = window.prompt("링크 URL을 입력해주세요", "https://");
    if (!url) return;
    runCommand("createLink", url);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-text-secondary/20 focus-within:border-primary-green">
      <div className="flex flex-wrap gap-1 border-b border-text-secondary/10 bg-card px-2 py-2">
        <button type="button" className={toolbarButtonClass} onClick={() => runCommand("bold")}>
          B
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => runCommand("italic")}>
          I
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => runCommand("underline")}>
          U
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => runCommand("insertUnorderedList")}>
          목록
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => runCommand("insertOrderedList")}>
          번호
        </button>
        <button type="button" className={toolbarButtonClass} onClick={setLink}>
          링크
        </button>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        onInput={syncValue}
        onBlur={syncValue}
        className="min-h-[220px] w-full rounded-b-xl bg-background px-3.5 py-3 text-sm leading-7 text-text-primary outline-none [&_a]:text-primary-blue [&_a]:underline [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
      />
    </div>
  );
}
