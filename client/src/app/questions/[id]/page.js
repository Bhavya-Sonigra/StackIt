'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '../../../components/RichTextEditor';
import {
    ArrowUp,
    ArrowDown,
    Check,
    MessageSquare,
    Eye,
    Calendar,
    User,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { api } from '../../../utils/api';

export default function QuestionDetail() {
    const params = useParams();
    const router = useRouter();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answerContent, setAnswerContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuestion();
        checkAuth();
    }, [params.id]);

    const fetchQuestion = async () => {
        try {
            const data = await api(`/questions/${params.id}`);
            setQuestion(data);
            setAnswers(data.answers || []);
        } catch (error) {
            console.error('Error fetching question:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAuth = async () => {
        try {
            const data = await api('/auth/me');
            setUser(data);
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/login');
        }
    };

    const handleVote = async (type, contentId, contentType) => {
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            const endpoint = contentType === 'question'
                ? `/questions/${contentId}/${type}`
                : `/answers/${contentId}/${type}`;

            await api(endpoint, {
                method: 'POST'
            });
            
            fetchQuestion(); // Refresh to get updated votes
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleAcceptAnswer = async (answerId) => {
        if (!user) return;

        try {
            await api(`/questions/${params.id}/accept`, {
                method: 'PUT',
                body: JSON.stringify({ answerId })
            });
            
            fetchQuestion(); // Refresh to get updated status
        } catch (error) {
            console.error('Error accepting answer:', error);
        }
    };

    const submitAnswer = async (e) => {
        e.preventDefault();
        if (!answerContent.trim()) return;

        try {
            setSubmitting(true);
            await api('/answers', {
                method: 'POST',
                body: JSON.stringify({ 
                    questionId: params.id, 
                    description: answerContent 
                }),
            });
            setAnswerContent('');
            fetchQuestion(); // Refresh the question to get the new answer
        } catch (error) {
            setError(error.message || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderVoteButtons = (content, contentType) => {
        const voteCount = content.votes || 0;

        return (
            <div className="flex flex-col items-center space-y-1">
                <button
                    onClick={() => handleVote('upvote', content._id, contentType)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Upvote"
                >
                    <ArrowUp className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium">{voteCount}</span>
                <button
                    onClick={() => handleVote('downvote', content._id, contentType)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Downvote"
                >
                    <ArrowDown className="h-4 w-4" />
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Question not found</h1>
                    <Link href="/" className="text-blue-600 hover:text-blue-500">
                        Back to questions
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Question */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-purple-200">
                    <div className="flex gap-6">
                        {renderVoteButtons(question, 'question')}

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                                {question.title}
                            </h1>

                            <div
                                className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none mb-6"
                                dangerouslySetInnerHTML={{ __html: question.description }}
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <User className="h-4 w-4" />
                                        <span>{question.authorId.name || question.authorId.username}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(question.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Eye className="h-4 w-4" />
                                        <span>{question.views} views</span>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    {question.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answers */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {answers.length} Answer{answers.length !== 1 ? 's' : ''}
                    </h2>

                    {answers.map((answer) => (
                        <div key={answer._id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
                            <div className="flex gap-4">
                                {renderVoteButtons(answer, 'answer')}

                                <div className="flex-1">
                                    <div
                                        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none mb-4"
                                        dangerouslySetInnerHTML={{ __html: answer.description }}
                                    />

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <User className="h-4 w-4" />
                                                <span>{answer.authorId.name || answer.authorId.username}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(answer.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {answer.isAccepted && (
                                                <span className="flex items-center space-x-1 text-green-600 font-medium">
                                                    <Check className="h-4 w-4" />
                                                    <span>Accepted</span>
                                                </span>
                                            )}

                                            {user && question.authorId._id === user.id && !answer.isAccepted && (
                                                <button
                                                    onClick={() => handleAcceptAnswer(answer._id)}
                                                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    <span>Accept</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Answer Form */}
                {user ? (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Your Answer
                        </h3>

                        <form onSubmit={submitAnswer}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                                    {error}
                                </div>
                            )}

                            <RichTextEditor
                                content={answerContent}
                                onChange={setAnswerContent}
                                placeholder="Write your answer here..."
                            />

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !answerContent.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Posting...' : 'Post Answer'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <p className="text-gray-600 mb-4">
                            Please log in to answer this question
                        </p>
                        <Link
                            href="/login"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Log In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}