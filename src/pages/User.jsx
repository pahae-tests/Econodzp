import React, { useState, useEffect } from 'react';
import { ChevronDown, Users, Heart, X, Check, Loader2, Plus } from 'lucide-react';
import { verifyAuth } from "../middlewares/auth";
import { useRouter } from 'next/router';
import Popup from "@/components/Popup"

const EditableUserProfile = ({ session }) => {
    const [showWarning, setShowWarning] = useState(false);
    const router = useRouter();
    const { id } = router.query;
    const [scrollY, setScrollY] = useState(0);
    const [showLabels, setShowLabels] = useState(false);
    const [showAddLabel, setShowAddLabel] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [following, setFollowing] = useState(false);
    const [userProfile, setUserProfile] = useState({
        _id: '',
        img: '',
        firstname: '',
        lastname: '',
        bio: '',
        sex: 'male',
        status: '',
        pointsLevel: 0,
        labels: [],
        follows: [],
        following: []
    });
    const [userPosts, setUserPosts] = useState([]);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (id)
            fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/users/getOne?id=${id}`);
            const data = await response.json();
            if (data.success) {
                setUserProfile({
                    _id: data.user._id,
                    img: data.user.img || '/user.jpg',
                    firstname: data.user.firstname || '',
                    lastname: data.user.lastname || '',
                    bio: data.user.bio || '',
                    sex: data.user.sex || 'male',
                    status: data.user.status || '',
                    pointsLevel: data.user.pointsLevel || 0,
                    labels: data.user.labels || [],
                    follows: data.user.follows || [],
                    following: data.user.following || []
                });

                const postsData = data.user.posts?.map(post => ({
                    _id: post._id,
                    content: post.title || '',
                    image: post.img || '/user.jpg',
                    timestamp: formatTimestamp(post.createdAt),
                    likes: Math.floor(Math.random() * 300) + 50,
                    comments: Math.floor(Math.random() * 50) + 5
                })) || [];

                const isFollowing = (data.user.follows || []).some(u => u.user?.toString() === session._id);
                setFollowing(isFollowing);
            } else {
                console.error('فشل في جلب ملف التعريف:', data.message);
            }
        } catch (error) {
            console.error('خطأ في جلب ملف التعريف:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'منذ بعض الوقت';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        if (diffInHours < 1) return 'منذ أقل من ساعة';
        if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `منذ ${diffInDays} يوم`;
    };

    const updateUserProfile = async (updateData) => {
        try {
            setUpdating(true);
            const response = await fetch('/api/users/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    _id: userProfile._id,
                    ...updateData
                })
            });
            const data = await response.json();
            if (data.success) {
                setUserProfile(prev => ({
                    ...prev,
                    ...updateData
                }));
                return true;
            } else {
                console.error('فشل في تحديث الملف الشخصي:', data.message);
                return false;
            }
        } catch (error) {
            console.error('خطأ في تحديث الملف الشخصي:', error);
            return false;
        } finally {
            setUpdating(false);
        }
    };

    const getSexSymbol = (sex) => {
        switch (sex) {
            case 'male': return '♂️';
            case 'female': return '♀️';
            default: return '♂️';
        }
    };

    const handleAddLabel = async () => {
        if (!newLabel.trim()) return;
        const updatedLabels = [...userProfile.labels, newLabel.trim()];
        const success = await updateUserProfile({ labels: updatedLabels });
        if (success) {
            setNewLabel('');
            setShowAddLabel(false);
        }
    };

    const handleFollow = async () => {
        if (!session || !userProfile._id) return;
        try {
            setUpdating(true);
            const response = await fetch('/api/users/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    followerId: session._id,
                    followingId: userProfile._id
                }),
            });
            const data = await response.json();
            if (data.success) {
                setUserProfile(prev => ({
                    ...prev,
                    follows: data.isFollowing
                        ? [...prev.follows, session._id]
                        : prev.follows.filter(id => id !== session._id)
                }));
                setFollowing(prev => !prev);
                return data.isFollowing;
            } else {
                console.error('فشل في تحديث حالة المتابعة:', data.message);
                alert(data.message || 'خطأ في تحديث حالة المتابعة');
                return false;
            }
        } catch (error) {
            console.error('خطأ في تحديث حالة المتابعة:', error);
            alert('حدث خطأ ما');
            return false;
        } finally {
            setUpdating(false);
        }
    };

    const getChatLink = () => {
        let id1 = session._id, id2 = userProfile._id;
        return `/Chat?room=${id1 < id2 ? id1 + id2 : id2 + id1}&userID=${id2}`;
    }

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center" dir="rtl">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <p className="text-white">جاري تحميل الملف الشخصي...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full" dir="rtl">
            {/* Profile Header */}
            <div className="mb-8 bg-black backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl">
                <div className="p-8">
                    {/* Profile Image and Basic Info */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 relative group">
                                <img
                                    src={userProfile.img || '/user.jpg'}
                                    alt={`${userProfile.firstname} ${userProfile.lastname}`}
                                    className="w-full h-full rounded-full object-cover border-2 border-black"
                                />
                            </div>
                            <div className="bg-gradient-to-tr from-pink-500/60 via-purple-500 to-cyan-500 text-white font-semibold w-fit backdrop-blur-3xl rounded-3xl px-2 py-1 shadow-2xl -translate-x-22 -translate-y-32">
                                {userProfile.pointsLevel} 🔥
                            </div>
                            {/* Status Badge */}
                            {userProfile.status && (
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-xs text-white whitespace-nowrap group">
                                    <div className="flex items-center gap-2">
                                        <span>{userProfile.status}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-2 group">
                            <>
                                <h1 className="text-2xl font-bold text-white">
                                    {userProfile.firstname} {userProfile.lastname}
                                </h1>
                                <span className="text-2xl">{getSexSymbol(userProfile.sex)}</span>
                            </>
                        </div>
                        <div className="group relative w-full">
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-gray-100 leading-relaxed mb-4">{userProfile.bio || 'لا يوجد سيرة ذاتية متاحة'}</p>
                            </div>
                        </div>
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center bg-black rounded-2xl p-4 border border-gray-800">
                            <div className="text-2xl font-bold text-white">{userProfile.follows?.length || 0}</div>
                            <div className="text-sm text-gray-400">كيبغيوه</div>
                        </div>
                        <div className="text-center bg-black rounded-2xl p-4 border border-gray-800">
                            <div className="text-2xl font-bold text-white">{userProfile.following?.length || 0}</div>
                            <div className="text-sm text-gray-400">كيبغي</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-6">
                        <button onClick={handleFollow} className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-6 py-3 rounded-full font-bold text-white hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105">
                            {following ? "نفاصل" : "تصاحب"}
                        </button>
                        <button onClick={() => { if(session.sex !== userProfile.sex && session.sex === 'male') setShowWarning(true); else window.location.href = getChatLink(); }} className="flex-1 bg-gray-800 border border-gray-700 px-6 py-3 rounded-full font-bold text-white hover:bg-gray-700 transition-all duration-300">
                            ميساج
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div className="mb-6 mr-4">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>البوسطات</span>
                    <span className="text-gray-400 text-lg">({userPosts.length})</span>
                </h2>
            </div>

            {/* Posts Feed */}
            <div className="space-y-8">
                {userPosts.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        {session.sex === 'male' ? 'معمرها لاحت شي حاجة' : 'معمرو لاح شي حاجة'}
                    </div>
                ) : (
                    userPosts.map((post, index) => (
                        <div
                            key={post.id}
                            className="group relative bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 hover:border-gray-700/50"
                            style={{
                                transform: `translateY(${scrollY * 0.02 * index}px)`,
                            }}
                        >
                            {/* Post Header */}
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={userProfile.img || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face'}
                                        alt={`${userProfile.firstname} ${userProfile.lastname}`}
                                        className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-pink-500/50 transition-all duration-300"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-white">
                                                {userProfile.firstname} {userProfile.lastname}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-400">{post.timestamp}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Post Content */}
                            <div className="px-6 pb-4">
                                <p className="text-gray-100 leading-relaxed text-lg">{post.content}</p>
                            </div>
                            {/* Post Image */}
                            <div className="relative group/media">
                                <img
                                    src={post.image}
                                    alt="محتوى المنشور"
                                    className="w-full aspect-square object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Label Modal */}
            {showAddLabel && (
                <div className='w-full h-full fixed top-0 left-0 flex justify-center items-center backdrop-blur-md cursor-pointer z-50' onClick={() => setShowAddLabel(false)}>
                    <div className='flex flex-col justify-around items-center gap-6 bg-black/60 backdrop-blur-3xl rounded-3xl w-[90%] md:w-1/3 py-6 cursor-default' onClick={(e) => e.stopPropagation()}>
                        <span className='text-white font-bold'>وسم جديد</span>
                        <input
                            type="text"
                            placeholder='اكتب شيء ما...'
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className='rounded-2xl border-2 border-purple-400 px-3 py-1 active:border-0'
                        />
                        <div className="flex gap-6 w-full justify-center">
                            <button
                                className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl text-white font-semibold px-4 py-2"
                                onClick={handleAddLabel}
                                disabled={updating}
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة'}
                            </button>
                            <button className="bg-gray-800 rounded-3xl text-white font-semibold px-4 py-2" onClick={() => setShowAddLabel(false)}>إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            <Popup
                redirectLink={getChatLink}
                showPopup={showWarning}
                setShowPopup={setShowWarning}
            />
        </div>
    );
};

export default EditableUserProfile;

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
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                img: user.img,
                lvl: user.lvl,
                email: user.email,
                sex: user.sex,
                birth: user.birth,
                createdAt: user.createdAt,
            }
        },
    };
}