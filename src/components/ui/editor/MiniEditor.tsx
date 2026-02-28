import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface MiniEditorProps {
    value?: string
    onChange?: (html: string) => void
    placeholder?: string
}

const MiniEditor = ({ value = "", onChange, placeholder }: MiniEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[120px] p-4 cursor-text bg-background text-foreground",
                    "prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0"
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
        <div className="group border border-border rounded-xl overflow-hidden bg-background focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:border-teal-500/20 transition-all duration-200">
            {/* Mini Toolbar */}
            <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-muted/30">
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
                <div className="mx-1.5 w-px h-4 bg-slate-200 self-center" />
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
            </div>

            {/* Content Area */}
            <EditorContent editor={editor} />
        </div>
    )
}

const ToolbarButton = ({ onClick, active, icon: Icon, tooltip }: any) => (
    <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }}
        className={cn(
            "h-8 w-8 p-0 rounded-lg hover:bg-background hover:text-teal-600 transition-colors duration-200",
            active ? "bg-background text-teal-600 shadow-sm border border-border" : "text-slate-500"
        )}
        title={tooltip}
    >
        <Icon className="h-4 w-4" />
    </Button>
)

export default MiniEditor
