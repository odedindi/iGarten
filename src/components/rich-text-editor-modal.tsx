"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TipTapEditor } from "@/components/tiptap-editor";
import { Save, X } from "lucide-react";

interface RichTextEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContent: string;
    onSave: (content: string) => void;
    title?: string;
}

export function RichTextEditorModal({
    isOpen,
    onClose,
    initialContent,
    onSave,
    title = "Edit Content",
}: RichTextEditorModalProps) {
    const [content, setContent] = useState(initialContent);
    const [hasChanges, setHasChanges] = useState(false);

    // Update content when initialContent changes
    useEffect(() => {
        setContent(initialContent);
        setHasChanges(false);
    }, [initialContent]);

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        setHasChanges(newContent !== initialContent);
    };

    const handleSave = () => {
        onSave(content);
        setHasChanges(false);
        onClose();
    };

    const handleClose = () => {
        if (hasChanges) {
            const shouldClose = window.confirm(
                "You have unsaved changes. Are you sure you want to close without saving?"
            );
            if (!shouldClose) return;
        }
        setContent(initialContent);
        setHasChanges(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="flex max-h-[60vh] max-w-4xl flex-col border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>{title}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-auto">
                    <TipTapEditor
                        content={content}
                        onChange={handleContentChange}
                    />
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
