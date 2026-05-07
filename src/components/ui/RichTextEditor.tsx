import React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading2,
  Heading3,
  Link2,
  Link2Off,
  Undo,
  Redo,
  Code,
  Quote,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

// ─── Toolbar Button ───────────────────────────────────────────────────────────
interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) => (
  <Toggle
    size="sm"
    pressed={active}
    onPressedChange={() => onClick()}
    disabled={disabled}
    title={title}
    className={cn(
      "h-8 w-8 p-0 rounded-md",
      active
        ? "bg-primary text-primary-foreground hover:bg-primary/90"
        : "hover:bg-muted",
    )}
  >
    {children}
  </Toggle>
);

// ─── Toolbar Full ─────────────────────────────────────────────────────────────
const Toolbar = ({ editor }: { editor: Editor }) => {
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/40 rounded-t-md">
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
        <Code className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
        <AlignRight className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Align Justify" onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })}>
        <AlignJustify className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton title="Set Link" onClick={setLink} active={editor.isActive("link")}>
        <Link2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}>
        <Link2Off className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
};

// ─── Toolbar Inline (hanya Bold, Italic, Underline, Code) ─────────────────────
const InlineToolbar = ({ editor }: { editor: Editor }) => (
  <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-muted/40 rounded-t-md">
    <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
      <Undo className="h-3.5 w-3.5" />
    </ToolbarButton>
    <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
      <Redo className="h-3.5 w-3.5" />
    </ToolbarButton>
    <Separator orientation="vertical" className="h-5 mx-1" />
    <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
      <Bold className="h-3.5 w-3.5" />
    </ToolbarButton>
    <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
      <Italic className="h-3.5 w-3.5" />
    </ToolbarButton>
    <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
      <UnderlineIcon className="h-3.5 w-3.5" />
    </ToolbarButton>
    <ToolbarButton title="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
      <Code className="h-3.5 w-3.5" />
    </ToolbarButton>
  </div>
);

// ─── RichTextEditor ───────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
  className?: string;
  /** Mode ringkas: toolbar hanya Bold/Italic/Underline/Code, tinggi minimal */
  inline?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis deskripsi produk di sini...",
  readOnly = false,
  minHeight,
  className,
  inline = false,
}: RichTextEditorProps) {
  const resolvedMinHeight = minHeight ?? (inline ? 44 : 220);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc pl-5 space-y-1" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-5 space-y-1" } },
        blockquote: { HTMLAttributes: { class: "border-l-4 border-primary pl-4 italic text-muted-foreground" } },
        heading: { levels: [2, 3] },
        code: { HTMLAttributes: { class: "bg-muted rounded px-1 py-0.5 font-mono text-sm" } },
        codeBlock: { HTMLAttributes: { class: "bg-muted rounded-md p-3 font-mono text-sm" } },
      }),
      Underline,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2 cursor-pointer" },
      }),
      Placeholder.configure({ placeholder, emptyEditorClass: "is-editor-empty" }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3",
          `min-h-[${resolvedMinHeight}px]`,
        ),
      },
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (currentHTML !== value) {
      editor.commands.setContent(value ?? "", { emitUpdate: false });
    }
  }, [value, editor]);

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [readOnly, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background text-sm ring-offset-background",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        readOnly && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {!readOnly && (inline ? <InlineToolbar editor={editor} /> : <Toolbar editor={editor} />)}
      <EditorContent editor={editor} />
    </div>
  );
}
