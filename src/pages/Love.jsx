import React, { useState, useEffect } from 'react';
import { Heart, Users, Sparkles } from 'lucide-react';
import { useRouter } from 'next/router';
import { verifyAuth } from "../middlewares/auth";

const Love = ({ session }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentDisplayUser, setCurrentDisplayUser] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [femaleUsers, setFemaleUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`/api/users/getSex?sex=${session.sex}`);
                if (!response.ok) {
                    throw new Error('فشل في جلب المستخدمين');
                }
                const data = await response.json();
                setFemaleUsers(data.users || []);
            } catch (err) {
                console.error('خطأ في جلب المستخدمين:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const startDraw = () => {
        if (femaleUsers.length === 0) return;
        setIsDrawing(true);
        setShowResult(false);
        setSelectedUser(null);
        let drawInterval;
        let currentIndex = 0;

        drawInterval = setInterval(() => {
            setCurrentDisplayUser(femaleUsers[currentIndex % femaleUsers.length]);
            currentIndex++;
        }, 50);

        setTimeout(() => {
            clearInterval(drawInterval);
            const randomUser = femaleUsers[Math.floor(Math.random() * femaleUsers.length)];
            setSelectedUser(randomUser);
            setCurrentDisplayUser(randomUser);
            setIsDrawing(false);

            setTimeout(() => {
                setShowResult(true);
            }, 500);
        }, 4000);
    };

    const goToChat = () => {
        if (selectedUser) {
            router.push(`/User?id=${selectedUser._id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" dir="rtl">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-red-500 p-4" dir="rtl">
                <p className="mb-4">خطأ أثناء تحميل المستخدمين</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    if (femaleUsers.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 p-4" dir="rtl">
                <p className="mb-4 text-center">لا يوجد مستخدمين متاحين حاليًا</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                    العودة إلى الصفحة الرئيسية
                </button>
            </div>
        );
    }

    const displayUser = isDrawing ? currentDisplayUser : selectedUser;

    return (
        <div className="min-h-screen p-4" dir="rtl">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8 pt-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Heart className="w-8 h-8 text-pink-500" />
                        <h1 className="text-3xl font-bold text-white">تصاحب ب بوطونة وحدة</h1>
                        <Heart className="w-8 h-8 text-pink-500" />
                    </div>
                    <p className="text-gray-400 text-lg">
                        {session.sex === 'male' ? 'لقى عشيرتك دابا !' : 'لقاي عشيرك دابا !'} ✨
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl mb-8">
                    {!isDrawing && !selectedUser ? (
                        // الحالة الأولية
                        <div className="p-8 text-center">
                            <div className="mb-8">
                                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-16 h-16 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    واجد{session.sex === 'female' && "ة"} أجمي ؟
                                </h2>
                                <p className="text-gray-400 mb-8">
                                    انقر على الزر للقاء {session.sex === 'male' ? 'شريكتك' : 'شريكك'} المستقبل بين {session.sex === 'male' ? 'المستخدمات' : 'المستخدمين'} الرائعين لدينا!
                                </p>
                            </div>

                            <button
                                onClick={startDraw}
                                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-8 py-4 rounded-full font-bold text-white text-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                            >
                                <Heart className="w-6 h-6" />
                                سير عالله
                                <Heart className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        // حالة عرض المستخدم
                        <div className="p-8">
                            {/* عرض الملف الشخصي */}
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="relative">
                                    {displayUser && (
                                        <>
                                            <div className={`w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 transition-all duration-300 ${isDrawing ? 'animate-pulse scale-110' : 'scale-100'}`}>
                                                <img
                                                    src={displayUser.img}
                                                    alt={`${displayUser.firstName} ${displayUser.lastName}`}
                                                    className="w-full h-full rounded-full object-cover border-2 border-black"
                                                />
                                            </div>
                                            <div className="bg-gradient-to-tr from-pink-500/60 via-purple-500 to-cyan-500 text-white font-semibold w-fit backdrop-blur-3xl rounded-3xl px-2 py-1 shadow-2xl -translate-x-22 -translate-y-30">
                                                {displayUser.pointsLevel} 🔥
                                            </div>
                                        </>
                                    )}
                                </div>
                                {displayUser && (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h1 className={`text-2xl font-bold text-white transition-all duration-300 ${isDrawing ? 'blur-sm' : 'blur-none'}`}>
                                                {displayUser.firstName} {displayUser.lastName}
                                            </h1>
                                            <span className="text-2xl">♀️</span>
                                        </div>
                                        <p className="text-gray-400 mb-2">{displayUser.age} سنة</p>
                                        <p className={`text-gray-100 leading-relaxed mb-4 transition-all duration-300 ${isDrawing ? 'blur-sm' : 'blur-none'}`}>
                                            {displayUser.bio}
                                        </p>
                                        {/* الوسوم */}
                                        <div className={`flex flex-wrap gap-2 justify-center mb-6 transition-all duration-300 ${isDrawing ? 'blur-sm' : 'blur-none'}`}>
                                            {displayUser.labels.map((label, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-500/30 text-white px-3 py-1 rounded-full text-sm"
                                                >
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* رسائل الحالة */}
                            {isDrawing && (
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-500/30 rounded-full px-6 py-3">
                                        <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                                        <span className="text-white font-medium">جاري البحث...</span>
                                        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            )}

                            {showResult && selectedUser && (
                                <div className="text-center mb-6">
                                    <div className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border-2 border-pink-500/50 rounded-3xl p-6 mb-6">
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
                                            <span className="text-2xl">🎉</span>
                                            <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white mb-2">
                                            مبروك!
                                        </h2>
                                        <p className="text-gray-100 text-lg">
                                            تصاحبتي مع <span className="font-bold text-pink-400">{selectedUser.firstName} {selectedUser.lastName}</span> 💕 بزز من{session.sex === 'female' ? 'و' : 'ها'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={goToChat}
                                        className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-8 py-4 rounded-full font-bold text-white text-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                                    >
                                        <Users className="w-5 h-5" />
                                        اححح قصدي برافو
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isDrawing && !selectedUser && (
                    <div className="text-center text-gray-500 text-sm">
                        <p>💫 الحب ينتظرك في مكان ما 💫</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Love;

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