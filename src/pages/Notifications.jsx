import React, { useState, useEffect } from 'react';
import { Heart, HeartHandshake, HeartCrack, UserPlus } from 'lucide-react';
import { useRouter } from 'next/router';
import { verifyAuth } from "../middlewares/auth";

const Notifications = ({ session }) => {
    const router = useRouter();
    const [scrollY, setScrollY] = useState(0);
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/notifications/getUser?userId=${session._id}`);
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.notifications);
                } else {
                    setError(data.message || 'فشل في تحميل الإشعارات');
                }
            } catch (err) {
                console.error('خطأ في جلب الإشعارات:', err);
                setError('خطأ في تحميل الإشعارات');
            } finally {
                setIsLoading(false);
            }
        };
        if (session?._id) {
            fetchNotifications();
        }
    }, [session?._id]);

    const getNotificationText = (type, user) => {
        switch (type) {
            case 'follow':
                return `${user.firstname} ${user.lastname} تصاحب${session.sex === 'male' ? 'ت' : ''} معاك ❤️`;
            case 'unfollow':
                return `${user.firstname} ${user.lastname} تفارق${session.sex === 'male' ? 'ت' : ''} معاك 💔`;
            case 'coupleup':
                return `${user.firstname} ${user.lastname} تصاحب${session.sex === 'male' ? 'ت' : ''} معاك ❤️`;
            case 'breakup':
                return `${user.firstname} ${user.lastname} تفارق${session.sex === 'male' ? 'ت' : ''} معاك 💔`;
            default:
                return '';
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'follow':
                return <HeartHandshake className="w-5 h-5 text-pink-500" />;
            case 'unfollow':
                return <HeartCrack className="w-5 h-5 text-red-500" />;
            case 'coupleup':
                return <HeartHandshake className="w-5 h-5 text-pink-500" />;
            case 'breakup':
                return <HeartCrack className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        return notification.type === filter;
    });

    const getFilterCount = (type) => {
        if (type === 'all') return notifications.length;
        return notifications.filter(n => n.type === type).length;
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.seen) {
                await fetch('/api/notifications/setSeen', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        notificationId: notification._id
                    }),
                });
                setNotifications(prev =>
                    prev.map(n =>
                        n._id === notification._id ? { ...n, seen: true } : n
                    )
                );
            }
            router.push(`/User?id=${notification.user._id}`);
        } catch (error) {
            console.error('خطأ في وضع علامة قراءة على الإشعار:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center" dir="rtl">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center text-red-500" dir="rtl">
                <p className="mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="w-full" dir="rtl">
            {/* Header */}
            <div className="mb-8 bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl">
                <div className="p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">الإشعارات</h1>
                        <p className="text-gray-400">
                            {filteredNotifications.filter(n => !n.seen).length} إشعارات جديدة
                        </p>
                    </div>
                    {/* Filter Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`text-center rounded-2xl p-4 border transition-all duration-300 ${filter === 'all'
                                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 border-transparent text-white font-bold'
                                : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
                                }`}
                        >
                            <div className="text-lg font-bold">{getFilterCount('all')}</div>
                            <div className="text-sm">الكل</div>
                        </button>
                        <button
                            onClick={() => setFilter('follow')}
                            className={`text-center rounded-2xl p-4 border transition-all duration-300 ${filter === 'follow'
                                ? 'bg-gradient-to-r from-pink-400 to-pink-600 border-transparent text-white font-bold'
                                : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
                                }`}
                        >
                            <div className="text-lg font-bold">{getFilterCount('follow')}</div>
                            <div className="text-sm">حب</div>
                        </button>
                        <button
                            onClick={() => setFilter('unfollow')}
                            className={`text-center rounded-2xl p-4 border transition-all duration-300 ${filter === 'unfollow'
                                ? 'bg-gradient-to-r from-red-400 to-red-600 border-transparent text-white font-bold'
                                : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
                                }`}
                        >
                            <div className="text-lg font-bold">{getFilterCount('unfollow')}</div>
                            <div className="text-sm">انفصالات</div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="mb-6 mr-4">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>
                        {filter === 'all' ? 'كل الإشعارات' :
                            filter === 'follow' ? 'إشعارات الحب' :
                                'إشعارات الانفصال'}
                    </span>
                    <span className="text-gray-400 text-lg">({filteredNotifications.length})</span>
                </h2>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.map((notification, index) => (
                    <div
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className="group relative bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 hover:border-gray-700/50 cursor-pointer hover:scale-[1.02]"
                        style={{
                            transform: `translateY(${scrollY * 0.01 * index}px)`,
                        }}
                    >
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4 flex-1">
                                {/* User Image with Gradient Border */}
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500">
                                        <img
                                            src={notification.user.img}
                                            alt={`${notification.user.firstname} ${notification.user.lastname}`}
                                            className="w-full h-full rounded-full object-cover border-2 border-black"
                                        />
                                    </div>
                                    {/* Notification Icon */}
                                    <div className="absolute -bottom-1 -left-1 bg-gray-900 rounded-full p-2 border-2 border-gray-800">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium text-lg leading-relaxed">
                                        {getNotificationText(notification.type, notification.user)}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">{notification.timestamp}</p>
                                </div>
                            </div>
                            {/* Unread Dot */}
                            <div className="flex items-center gap-4">
                                <div className="text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                {!notification.seen && (
                                    <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full animate-pulse"></div>
                                )}
                            </div>
                        </div>
                        {/* Hover Gradient Effect */}
                        <div className="absolute inset-0 bg-gradient-to-l from-pink-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredNotifications.length === 0 && (
                <div className="text-center py-16 bg-gray-950/50 backdrop-blur-xl rounded-3xl border border-gray-800/50">
                    <div className="text-gray-400 text-xl mb-2">لا توجد إشعارات</div>
                    <p className="text-gray-500">
                        {filter === 'all' ? 'لا توجد إشعارات حالياً' :
                            filter === 'follow' ? 'لا توجد إشعارات حب' :
                                'لا توجد إشعارات انفصال'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Notifications;

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
                sex: user.sex,
            }
        },
    };
}