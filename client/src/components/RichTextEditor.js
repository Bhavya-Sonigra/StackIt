'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Emoji from '@tiptap/extension-emoji';
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon,
    Smile
} from 'lucide-react';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addEmoji = () => {
        const emoji = window.prompt('Enter emoji:');
        if (emoji) {
            editor.chain().focus().insertContent(emoji).run();
        }
    };

    return (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200 p-3 flex flex-wrap gap-1">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-lg hover:bg-purple-200 transition-colors ${editor.isActive('bold') ? 'bg-purple-200 text-purple-700' : 'text-purple-600'}`}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-lg hover:bg-purple-200 transition-colors ${editor.isActive('italic') ? 'bg-purple-200 text-purple-700' : 'text-purple-600'}`}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded-lg hover:bg-purple-200 transition-colors ${editor.isActive('strike') ? 'bg-purple-200 text-purple-700' : 'text-purple-600'}`}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-purple-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-lg hover:bg-purple-200 transition-colors ${editor.isActive('bulletList') ? 'bg-purple-200 text-purple-700' : 'text-purple-600'}`}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-lg hover:bg-purple-200 transition-colors ${editor.isActive('orderedList') ? 'bg-purple-200 text-purple-700' : 'text-purple-600'}`}
                title="Numbered List"
            >
                <ListOrdered className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-purple-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded-lg hover:bg-purple-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-purple-200 text-purple-700' : 'text-purple-600'}`}
                title="Align Left"
            >
                <AlignLeft className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded-lg hover:bg-purple-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-purple-200 text-purple-700' : 'text-purple-600'}`}
                title="Align Center"
            >
                <AlignCenter className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded-lg hover:bg-purple-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-purple-200 text-purple-700' : 'text-purple-600'}`}
                title="Align Right"
            >
                <AlignRight className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-purple-300 mx-1"></div>

            <button
                type="button"
                onClick={setLink}
                className={`p-2 rounded-lg hover:bg-purple-200 transition-colors ${editor.isActive('link') ? 'bg-purple-200 text-purple-700' : 'text-purple-600'}`}
                title="Add Link"
            >
                <LinkIcon className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={addImage}
                className="p-2 rounded-lg hover:bg-purple-200 transition-colors text-purple-600"
                title="Add Image"
            >
                <ImageIcon className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={addEmoji}
                className="p-2 rounded-lg hover:bg-purple-200 transition-colors text-purple-600"
                title="Add Emoji"
            >
                <Smile className="h-4 w-4" />
            </button>
        </div>
    );
};

export default function RichTextEditor({ content = '', onChange, placeholder = 'Start writing...' }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline'
                }
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded'
                }
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph']
            }),
            Emoji
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-em:text-gray-900 prose-code:text-gray-900 prose-pre:text-gray-900 prose-blockquote:text-gray-900 prose-li:text-gray-900 prose-ul:text-gray-900 prose-ol:text-gray-900',
                style: 'color: #111827 !important;'
            }
        }
    });

    return (
        <div className="border border-purple-200 rounded-xl overflow-hidden shadow-lg bg-white">
            <MenuBar editor={editor} />
            <EditorContent
                editor={editor}
                className="p-4 min-h-[200px] focus:outline-none bg-white text-gray-900 rounded-b-xl"
                placeholder={placeholder}
            />
        </div>
    );
} 