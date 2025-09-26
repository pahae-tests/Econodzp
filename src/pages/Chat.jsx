import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, Home, PlusSquare, Users, User, Menu, MoreHorizontal, Play } from 'lucide-react';
import { useRouter } from 'next/router';
import { verifyAuth } from "../middlewares/auth";
import Pusher from "pusher-js";

const Room = ({ session }) => {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const router = useRouter();
    const { room, userID } = router.query;

    useEffect(() => {
        if (!room || !session?._id) return;
        fetch(`/api/msgs/setSeen?sessionId=${session._id}&room=${room}`), [session._id, room]
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        });
        const channel = pusher.subscribe(`room-${room}`);
        channel.bind('new-message', (data) => {
            setMessages((prev) => [...prev, data]);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [room, session?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!room || !session?._id || !userID) return;
        fetchChat();
    }, [room, session?._id]);

    const fetchChat = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/msgs/getChat?room=${room}&userId=${userID}`);
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                setMessages(data.messages || []);
                console.log(data.user)
            } else {
                setError(data.message || 'فشل تحميل الدردشة');
            }
        } catch (err) {
            console.error('خطأ في تحميل الدردشة:', err);
            setError('خطأ في تحميل الدردشة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !session?._id || !room) return;
        try {
            const response = await fetch('/api/msgs/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room,
                    userId: session._id,
                    content: newMessage
                }),
            });
            const data = await response.json();
            if (data.success) {
                setNewMessage('');
            } else {
                console.error('فشل إرسال الرسالة:', data.message);
            }
        } catch (error) {
            console.error('خطأ في إرسال الرسالة:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6 h-screen flex items-center justify-center" dir="rtl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6 h-screen flex flex-col items-center justify-center text-center" dir="rtl">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6 h-screen flex items-center justify-center" dir="rtl">
                <p className="text-gray-400">المستخدم غير موجود</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 h-screen flex flex-col" dir="rtl">
            {/* رأس المحادثة */}
            <div className="bg-gray-950/50 backdrop-blur-xl rounded-3xl px-6 sticky top-0 z-10 border border-gray-800/50 shadow-2xl">
                <div className="flex items-center justify-between py-4 flex-row-reverse">
                    <div className="flex items-center gap-4 flex-row-reverse">
                        <button
                            onClick={() => window.history.back()}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ←
                        </button>
                        <img
                            onClick={() => window.location.href = `/User?id=${user._id}`}
                            src={user.img || '/user.jpg'}
                            alt={`${user.firstname} ${user.lastname}`}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700 cursor-pointer"
                        />
                        <div onClick={() => window.location.href = `/User?id=${user._id}`} className='cursor-pointer text-left'>
                            <h3 className="font-bold text-white">
                                {user.firstname} {user.lastname}
                            </h3>
                            <p className="text-sm text-gray-400">{user.lastActive}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* منطقة الرسائل */}
            <div className="flex-grow p-6 bg-gray-950/50 backdrop-blur-xl rounded-3xl border border-gray-800/50 shadow-2xl overflow-y-auto my-4">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center">
                            <MessageCircle className="w-16 h-16 text-gray-500 mb-4" />
                            <p className="text-gray-400 text-center">ابدأ المحادثة</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={msg.id || index}
                                className={`flex ${msg.sender === session._id ? "justify-start" : "justify-end"}`}
                            >
                                <div
                                    className={`${msg.sender === session._id
                                        ? "bg-gradient-to-l from-pink-500 via-purple-500 to-cyan-500"
                                        : "bg-gray-800"
                                        } rounded-2xl rounded-tl-none px-4 py-2 max-w-xs text-right`}
                                >
                                    <p className="text-white text-sm">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${msg.sender === session._id ? "text-left text-gray-200" : "text-right text-gray-400"}`}>
                                        {msg.timestamp}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* حقل إرسال الرسالة */}
            <div className='w-full flex justify-center items-center'>
            <div className="bg-gray-950/50 backdrop-blur-xl rounded-3xl border border-gray-800/50 shadow-2xl px-3 py-2 w-full">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 flex-row-reverse">
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-2 rounded-full transition-all duration-300 ${newMessage.trim()
                            ? 'bg-gradient-to-l from-pink-500 via-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-pink-500/25 hover:scale-105'
                            : 'bg-gray-700 cursor-not-allowed'}`}
                    >
                        <Send className={`w-5 h-5 ${newMessage.trim() ? 'text-white' : 'text-gray-500'}`} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك..."
                        className="flex-1 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all text-right"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage(e);
                            }
                        }}
                    />
                </form>
            </div>
            </div>
        </div>
    );
};

export default Room;

export async function getServerSideProps({ req, res }) {
    const user = verifyAuth(req, res);
    if (!user) {
        return {
            redirect: {
                destination: "/Login",
                permanent: false,
            },
        };
    }
    return {
        props: {
            session: {
                _id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                img: user.img,
                email: user.email,
            }
        },
    };

}
