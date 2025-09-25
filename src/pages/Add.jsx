import React, { useEffect, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { verifyAuth } from "../middlewares/auth";

const CreatePost = ({ session, setNotif }) => {
    const [postContent, setPostContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userProfile, setUserProfile] = useState({
        img: session.img || "/user.jpg",
        firstName: session.firstname,
        lastName: session.lastname,
        pointsLevel: session.lvl || 0
    });

    useEffect(() => {
        setUserProfile({
            img: session.img || "/user.jpg",
            firstName: session.firstname,
            lastName: session.lastname,
            pointsLevel: session.lvl || 0
        });
        console.log(userProfile)
    }, [session])

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setNotif({
            msg: 'تم نشر المنشور بنجاح',
            link: '/',
            shown: true,
        });
    };

    const handleSubmit = async () => {
        if (!isFormValid || isLoading) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("content", postContent);
            formData.append("userId", session._id);
            if (selectedImage) {
                formData.append("image", selectedImage);
            }
            const response = await fetch("/api/posts/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "فشل إنشاء المنشور");
            }
            setPostContent("");
            removeImage();
        } catch (error) {
            console.error("خطأ أثناء النشر:", error);
            alert(`خطأ: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = postContent.trim().length > 0;

    return (
        <div className="w-full min-h-screen p-6" dir="rtl">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">إنشاء منشور</h1>
                    <p className="text-gray-400">شارك لحظاتك مع مجتمعك</p>
                </div>

                {/* Create Post Form */}
                <div className="bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl">
                    <div>
                        {/* Author Header */}
                        <div className="flex items-center gap-4 p-6 border-b border-gray-800/50 flex-row-reverse">
                            <div className="relative">
                                <div className="bg-gradient-to-tl from-pink-500/60 via-purple-500 to-cyan-500 text-white font-semibold w-fit backdrop-blur-3xl rounded-2xl px-2 py-1 shadow-2xl text-xs absolute -top-2 -left-2 z-10">
                                    {userProfile.pointsLevel} 🔥
                                </div>
                                <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-tl from-pink-500 via-purple-500 to-cyan-500">
                                    <img
                                        src={userProfile.img}
                                        alt={`${userProfile.firstName} ${userProfile.lastName}`}
                                        className="w-full h-full rounded-full object-cover border-2 border-black"
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-lg text-white">
                                    {userProfile.firstName} {userProfile.lastName}
                                </h3>
                                <p className="text-sm text-gray-400">الآن</p>
                            </div>
                        </div>

                        {/* Content Input */}
                        <div className="p-6">
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="اش باغي تخرى هنا قصدي تبوسطي ؟"
                                className="w-full bg-transparent text-white placeholder-gray-400 text-lg leading-relaxed resize-none border-none outline-none min-h-[120px] text-right"
                                maxLength={500}
                            />
                            <div className="flex justify-between items-center mb-4 flex-row-reverse">
                                <span className="text-sm text-gray-400">
                                    {postContent.length}/500 حرف
                                </span>
                            </div>

                            {/* Image Upload Section */}
                            <div className="mb-6">
                                {!imagePreview ? (
                                    <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-gray-600 transition-colors">
                                        <input
                                            id="image-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="image-input"
                                            className="cursor-pointer flex flex-col items-center gap-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-tl from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                                                <Upload className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium mb-1">تصويرة</p>
                                                <p className="text-gray-400 text-sm">ورك باش تختار واش نبقاو نوريوك</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative rounded-2xl overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="معاينة"
                                            className="w-full max-h-96 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-4 left-4 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 flex-row-reverse">
                                <button
                                    onClick={() => { if (isFormValid && !isLoading) handleSubmit(); }}
                                    disabled={!isFormValid || isLoading}
                                    className={`flex-1 px-6 py-3 rounded-full font-bold text-white transition-all duration-300 hover:scale-105 ${isFormValid && !isLoading
                                        ? 'bg-gradient-to-l from-pink-500 via-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-pink-500/25'
                                        : 'bg-gray-700 cursor-not-allowed'
                                        }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            جاري النشر...
                                        </div>
                                    ) : (
                                        'سير عالله'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPostContent('');
                                        removeImage();
                                    }}
                                    className="flex-1 bg-gray-800 border border-gray-700 px-6 py-3 rounded-full font-bold text-white hover:bg-gray-700 transition-all duration-300"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;

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