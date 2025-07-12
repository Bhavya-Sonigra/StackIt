'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '../../components/RichTextEditor';
import { X, Plus } from 'lucide-react';
import { api } from '../../utils/api';

export default function AskQuestion() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await api('/auth/me');
            setUser(userData.user);
        } catch (error) {
            router.push('/login');
        }
    };

    const handleTitleChange = (e) => {
        setFormData({
            ...formData,
            title: e.target.value
        });
    };

    const handleDescriptionChange = (content) => {
        setFormData({
            ...formData,
            description: content
        });
    };

    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tag]
            });
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.title.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }

        if (!formData.description.trim()) {
            setError('Description is required');
            setLoading(false);
            return;
        }

        if (formData.tags.length === 0) {
            setError('At least one tag is required');
            setLoading(false);
            return;
        }

        try {
            const data = await api('/questions', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            router.push(`/questions/${data._id}`);
        } catch (error) {
            setError(error.message || 'Failed to create question');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
            <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-xl border border-purple-100">
                <h1 className="text-3xl font-bold text-center text-purple-700 mb-8 drop-shadow">Ask a Question</h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-pink-100 border border-pink-300 text-pink-700 px-4 py-3 rounded-md text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-purple-700 mb-1">Title</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="block w-full px-4 py-2 border border-purple-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-white text-gray-900"
                            placeholder="Enter your question title"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-purple-700 mb-1">Description</label>
                        <RichTextEditor content={formData.description} onChange={handleDescriptionChange} />
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-purple-700 mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold text-xs flex items-center gap-1">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-white hover:text-pink-200">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            id="tags"
                            name="tags"
                            type="text"
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagInputKeyDown}
                            className="block w-full px-4 py-2 border border-purple-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-white text-gray-900"
                            placeholder="Add tags (press Enter or comma)"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-lg font-bold text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg hover:from-pink-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Posting...' : 'Post Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}