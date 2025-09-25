import React, { useState, useEffect } from 'react';
import { ChevronDown, Users, Heart, Edit2, Trash2, X, Check, Loader2, LogOut } from 'lucide-react';
import { verifyAuth } from "../middlewares/auth";
import Link from 'next/link';

const EditableUserProfile = ({ session }) => {
    const [scrollY, setScrollY] = useState(0);
    const [showLabels, setShowLabels] = useState(false);
    const [showAddLabel, setShowAddLabel] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [editMode, setEditMode] = useState({
        name: false,
        bio: false,
        status: false,
        image: false
    });
    const [tempValues, setTempValues] = useState({});
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
        if (session._id)
            fetchUserProfile();
    }, [session._id]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/users/getOne?id=${session._id}`);
            const data = await response.json();
            if (data.success) {
                setUserProfile({
                    _id: data.user._id,
                    img: data.user.img,
                    firstname: data.user.firstname || '',
                    lastname: data.user.lastname || '',
                    bio: data.user.bio || '',
                    sex: data.user.sex || 'female',
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
                setUserPosts(postsData);
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
                    id: userProfile._id,
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

    const startEdit = (field, currentValue = '') => {
        setEditMode(prev => ({ ...prev, [field]: true }));
        if (field === 'name') {
            setTempValues({
                firstname: userProfile.firstname,
                lastname: userProfile.lastname
            });
        } else {
            setTempValues({ [field]: currentValue });
        }
    };

    const cancelEdit = (field) => {
        setEditMode(prev => ({ ...prev, [field]: false }));
        setTempValues({});
    };

    const saveEdit = async (field) => {
        if (field === 'image' && tempValues.imageFile) {
            setUpdating(true);
            const formData = new FormData();
            formData.append('image', tempValues.imageFile);
            formData.append('userId', userProfile._id);
            try {
                const res = await fetch('/api/users/uploadImage', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    setUserProfile(prev => ({ ...prev, img: data.imageUrl }));
                    setEditMode(prev => ({ ...prev, image: false }));
                    setTempValues({});
                } else {
                    console.error(data.message);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setUpdating(false);
            }
            return;
        }
        let updateData = {};
        if (field === 'name') {
            updateData = {
                firstname: tempValues.firstname,
                lastname: tempValues.lastname
            };
        } else if (field === 'image') {
            updateData = { img: tempValues.image };
        } else {
            updateData = { [field]: tempValues[field] };
        }
        const success = await updateUserProfile(updateData);
        if (success) {
            setEditMode(prev => ({ ...prev, [field]: false }));
            setTempValues({});
        }
    };

    const deletePost = async (postId) => {
        if(!confirm("متأكد ؟")) return;
        try {
            const response = await fetch('/api/posts/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: postId,
                    userId: session._id
                })
            });
            const data = await response.json();
            if (data.success) {
                setUserPosts(prev => prev.filter(post => post.id !== postId));
            } else {
                console.error('فشل في حذف المنشور:', data.message);
            }
        } catch (error) {
            console.error('خطأ في حذف المنشور:', error);
        }
    };

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

    const handleLogout = () => fetch("/api/_auth/logout").then(res => res.json()).then(data => { if (data.status === 200) window.location.reload(); }).catch(err => alert(err));

    return (
        <div className="w-full" dir="rtl">
            {updating && (
                <div className="fixed top-4 left-4 bg-purple-500 text-white px-4 py-2 rounded-full flex items-center gap-2 z-50">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري التحديث...
                </div>
            )}

            {/* رأس الملف الشخصي */}
            <div className="mb-8 bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl">
                <div className="p-8">
                    <div onClick={handleLogout} className="flex gap-2 w-fit px-3 py-2 mb-4 bg-gradient-to-b from-red-700 to-red-800 border-2 border-black hover:border-white transition-all duration-200 cursor-pointer rounded-3xl shadow-2xl">
                        <LogOut />تسجيل الخروج
                    </div>

                    {/* صورة الملف الشخصي والمعلومات الأساسية */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 relative group">
                                <img
                                    src={userProfile.img || 'user.jpg'}
                                    alt={`${userProfile.firstname} ${userProfile.lastname}`}
                                    className="w-full h-full rounded-full object-cover border-2 border-black"
                                />
                                <button
                                    onClick={() => startEdit('image', userProfile.img)}
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Edit2 className="w-6 h-6 text-white" />
                                </button>
                            </div>
                            <div className="bg-gradient-to-tr from-pink-500/60 via-purple-500 to-cyan-500 text-white font-semibold w-fit backdrop-blur-3xl rounded-3xl px-2 py-1 shadow-2xl -translate-x-22 -translate-y-32">
                                {userProfile.pointsLevel} 🔥
                            </div>

                            {/* شارة الحالة */}
                            {true && (
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-xs text-white whitespace-nowrap group">
                                    {editMode.status ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={tempValues.status || ''}
                                                onChange={(e) => setTempValues(prev => ({ ...prev, status: e.target.value }))}
                                                className="bg-gray-700 text-white text-xs px-2 py-1 rounded w-32"
                                                autoFocus
                                            />
                                            <button onClick={() => saveEdit('status')} className="text-green-400 hover:text-green-300">
                                                <Check className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => cancelEdit('status')} className="text-red-400 hover:text-red-300">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>{userProfile.status}</span>
                                            <button
                                                onClick={() => startEdit('status', userProfile.status)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit2 className="w-3 h-3 text-gray-400" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-2 group">
                            {editMode.name ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempValues.firstname || ''}
                                        onChange={(e) => setTempValues(prev => ({ ...prev, firstname: e.target.value }))}
                                        className="bg-gray-700 text-white text-2xl font-bold px-2 py-1 rounded w-24"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        value={tempValues.lastname || ''}
                                        onChange={(e) => setTempValues(prev => ({ ...prev, lastname: e.target.value }))}
                                        className="bg-gray-700 text-white text-2xl font-bold px-2 py-1 rounded w-32"
                                    />
                                    <button onClick={() => saveEdit('name')} className="text-green-400 hover:text-green-300">
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => cancelEdit('name')} className="text-red-400 hover:text-red-300">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-row-reverse justify-center items-center gap-2 translate-x-6">
                                    <h1 className="text-2xl font-bold text-white">
                                        {userProfile.firstname} {userProfile.lastname}
                                    </h1>
                                    <span className="text-2xl">{getSexSymbol(userProfile.sex)}</span>
                                    <button
                                        onClick={() => startEdit('name')}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="group relative w-full">
                            {editMode.bio ? (
                                <div className="flex flex-col items-center gap-2">
                                    <textarea
                                        value={tempValues.bio || ''}
                                        onChange={(e) => setTempValues(prev => ({ ...prev, bio: e.target.value }))}
                                        className="bg-gray-700 text-white px-3 py-2 rounded-lg w-full text-center resize-none"
                                        rows="3"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => saveEdit('bio')} className="text-green-400 hover:text-green-300">
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => cancelEdit('bio')} className="text-red-400 hover:text-red-300">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-row-reverse justify-center items-center gap-2 translate-x-4">
                                    <p className="text-gray-100 leading-relaxed mb-4">{userProfile.bio || 'لا يوجد سيرة ذاتية'}</p>
                                    <button
                                        onClick={() => startEdit('bio', userProfile.bio)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* شبكة الإحصائيات */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
                            <div className="text-2xl font-bold text-white">{userProfile.follows?.length || 0}</div>
                            <div className="text-sm text-gray-400">كيبغيوه</div>
                        </div>
                        <div className="text-center bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
                            <div className="text-2xl font-bold text-white">{userProfile.following?.length || 0}</div>
                            <div className="text-sm text-gray-400">كيبغي</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* قسم المنشورات */}
            <div className="mb-6 mr-4">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>بوسطاتي الحامضين</span>
                    <span className="text-gray-400 text-lg">({userPosts.length})</span>
                </h2>
            </div>

            {/* تغذية المنشورات */}
            <div className="space-y-8">
                {userPosts.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 z-40">
                        <p>باقي ما لحتي والو فاشل فاشل</p>
                        <Link href="/Add" className='underline text-pink-500 cursor-pointer'>كليكي هنا باش تلوح</Link>
                    </div>
                ) : (
                    userPosts.map((post, index) => (
                        <div
                            key={post._id}
                            className="group relative bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 hover:border-gray-700/50"
                            style={{
                                transform: `translateY(${scrollY * 0.02 * index}px)`,
                            }}
                        >
                            {/* زر الحذف */}
                            <button
                                onClick={() => deletePost(post._id)}
                                className="absolute top-4 left-4 z-10 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-2 hover:scale-110 transition-all duration-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            {/* رأس المنشور */}
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={userProfile.img || '/user.jpg'}
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

                            {/* محتوى المنشور */}
                            <div className="px-6 pb-4">
                                <p className="text-gray-100 leading-relaxed text-lg">{post.content}</p>
                            </div>

                            {/* صورة المنشور */}
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

            {/* نافذة إضافة علامة */}
            {showAddLabel && (
                <div className='w-full h-full fixed top-0 right-0 flex justify-center items-center backdrop-blur-md cursor-pointer z-50' onClick={() => setShowAddLabel(false)}>
                    <div className='flex flex-col justify-around items-center gap-6 bg-black/60 backdrop-blur-3xl rounded-3xl w-[90%] md:w-1/3 py-6 cursor-default' onClick={(e) => e.stopPropagation()}>
                        <span className='text-white font-bold'>علامة جديدة</span>
                        <input
                            type="text"
                            placeholder='اكتب شيئًا...'
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

            {/* نافذة تعديل الصورة */}
            {editMode.image && (
                <div className='w-full h-full fixed top-0 right-0 flex justify-center items-center backdrop-blur-md cursor-pointer z-50' onClick={() => cancelEdit('image')}>
                    <div className='flex flex-col justify-around items-center gap-6 bg-black/60 backdrop-blur-3xl rounded-3xl w-[90%] md:w-1/2 py-6 cursor-default' onClick={(e) => e.stopPropagation()}>
                        <span className='text-white font-bold'>تغيير صورة الملف الشخصي</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setTempValues(prev => ({ ...prev, imageFile: e.target.files[0] }))}
                            className='rounded-2xl border-2 border-purple-400 px-3 py-1 w-1/2 max-w-md'
                        />
                        {tempValues.imageFile && (
                            <div className="w-32 h-32 rounded-full overflow-hidden">
                                <img src={URL.createObjectURL(tempValues.imageFile)} alt="معاينة" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="flex gap-6 w-full justify-center">
                            <button
                                className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl text-white font-semibold px-4 py-2"
                                onClick={() => saveEdit('image')}
                                disabled={updating}
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                            </button>
                            <button className="bg-gray-800 rounded-3xl text-white font-semibold px-4 py-2" onClick={() => cancelEdit('image')}>إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
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