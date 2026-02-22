import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Image as ImageIcon,
    Undo,
    Redo,
    Code
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AdvancedEditorProps {
    value?: string
    onChange?: (html: string) => void
}

const AdvancedEditor = ({ value = "", onChange }: AdvancedEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-slate dark:prose-invert focus:outline-none max-w-none min-h-[400px] p-8 cursor-text bg-background text-foreground",
                    "prose-headings:text-foreground prose-p:text-muted-foreground prose-blockquote:border-teal-500"
                ),
            },
        },
    })

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    if (!editor) return null

    return (
        <div className="flex flex-col border border-border rounded-2xl overflow-hidden bg-background shadow-sm ring-1 ring-border/50">
            {/* Sticky Toolbar */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 border-b border-border bg-background/80 backdrop-blur-md">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    icon={Undo}
                    tooltip="Orqaga"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    icon={Redo}
                    tooltip="Oldinga"
                />

                <div className="mx-1 w-px h-6 bg-slate-100" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    icon={Heading1}
                    tooltip="Sarlavha 1"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    icon={Heading2}
                    tooltip="Sarlavha 2"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    icon={Heading3}
                    tooltip="Sarlavha 3"
                />

                <div className="mx-1 w-px h-6 bg-slate-100" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    icon={Bold}
                    tooltip="Qalin"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    icon={Italic}
                    tooltip="Kursiv"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive('code')}
                    icon={Code}
                    tooltip="Kod"
                />

                <div className="mx-1 w-px h-6 bg-slate-100" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    icon={List}
                    tooltip="Ro'yxat"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    icon={ListOrdered}
                    tooltip="Tartiblangan ro'yxat"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    icon={Quote}
                    tooltip="Iqtibos"
                />

                <div className="mx-1 w-px h-6 bg-slate-100" />

                <ToolbarButton
                    onClick={() => {
                        // Future image upload logic placeholder
                        const url = window.prompt('Rasm manzili (URL)')
                        if (url) {
                            // Image extension needs to be added to use setImage
                            alert("Rasm manzili: " + url + "\n(Image extension o'rnatilishi kerak)")
                        }
                    }}
                    icon={ImageIcon}
                    tooltip="Rasm qo'shish (Placeholder)"
                />
            </div>

            {/* Editor Content Area */}
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>

            {/* Footer Info */}
            <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>Tiptap Editor Engine</span>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span>Active</span>
                </div>
            </div>
        </div>
    )
}

const ToolbarButton = ({ onClick, active, icon: Icon, tooltip, disabled }: any) => (
    <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }}
        className={cn(
            "h-9 w-9 p-0 rounded-xl transition-all duration-200",
            active
                ? "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400 shadow-sm border border-teal-200/20"
                : "text-slate-500 hover:bg-muted hover:text-foreground"
        )}
        title={tooltip}
    >
        <Icon className="h-4 w-4" />
    </Button>
)

export default AdvancedEditor
