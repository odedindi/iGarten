"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    UnderlineIcon,
    List,
    ListOrdered,
    LinkIcon,
    ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
} from "lucide-react";
import TextAlign from "@tiptap/extension-text-align";

interface TipTapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            Image.configure({
                inline: true,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose max-w-none focus:outline-none min-h-[200px] p-4 border rounded-md garden-input",
            },
        },
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
    });

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const url = window.prompt("URL");
        if (url) {
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
        } else {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        }
    };

    const addImage = () => {
        const url = window.prompt("Image URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="garden-input overflow-hidden rounded-md border">
            <div className="bg-muted/20 flex flex-wrap gap-1 border-b p-2">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "bg-primary/20" : ""}
                >
                    <Bold className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "bg-primary/20" : ""}
                >
                    <Italic className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    className={
                        editor.isActive("underline") ? "bg-primary/20" : ""
                    }
                >
                    <UnderlineIcon className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 1 })
                            ? "bg-primary/20"
                            : ""
                    }
                >
                    <Heading1 className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={
                        editor.isActive("heading", { level: 2 })
                            ? "bg-primary/20"
                            : ""
                    }
                >
                    <Heading2 className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={
                        editor.isActive("bulletList") ? "bg-primary/20" : ""
                    }
                >
                    <List className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={
                        editor.isActive("orderedList") ? "bg-primary/20" : ""
                    }
                >
                    <ListOrdered className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={setLink}
                    className={editor.isActive("link") ? "bg-primary/20" : ""}
                >
                    <LinkIcon className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addImage}
                >
                    <ImageIcon className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().setTextAlign("left").run()
                    }
                    className={
                        editor.isActive({ textAlign: "left" })
                            ? "bg-primary/20"
                            : ""
                    }
                >
                    <AlignLeft className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().setTextAlign("center").run()
                    }
                    className={
                        editor.isActive({ textAlign: "center" })
                            ? "bg-primary/20"
                            : ""
                    }
                >
                    <AlignCenter className="garden-icon h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().setTextAlign("right").run()
                    }
                    className={
                        editor.isActive({ textAlign: "right" })
                            ? "bg-primary/20"
                            : ""
                    }
                >
                    <AlignRight className="garden-icon h-4 w-4" />
                </Button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
