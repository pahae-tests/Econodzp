import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { verifyAuth } from "../middlewares/auth";

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // إدارة تغييرات الإدخال
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // إرسال النموذج
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/_auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'فشل تسجيل الدخول');
            }
            window.location.href = '/';
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            alert(error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
            setIsLoading(false);
        }
    };

    // التحقق من صحة النموذج
    const isFormValid = () => {
        return formData.email.trim() && formData.password.trim();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4" dir="rtl">
            <div className="w-full max-w-md">
                {/* رأس الصفحة */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        مرحبا بيك !
                    </h1>
                    <p className="text-gray-400">
                        دير تسجيل الدخول اجمي
                    </p>
                </div>

                {/* نموذج تسجيل الدخول */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl p-8"
                >
                    <div className="space-y-6">
                        {/* حقل البريد الإلكتروني */}
                        <div className="space-y-1">
                            <label className="text-sm text-gray-300 font-medium">الايمايل</label>
                            <input
                                type="email"
                                placeholder="بريدك@الإلكتروني.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors text-right"
                            />
                        </div>

                        {/* حقل كلمة المرور */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-gray-300 font-medium">مودباص</label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors text-right"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* زر تسجيل الدخول */}
                        <button
                            type="submit"
                            disabled={!isFormValid() || isLoading}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${isFormValid() && !isLoading
                                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-pink-500/25 hover:scale-[1.01]'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    اطط...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    سير عالله
                                </>
                            )}
                        </button>

                        {/* الفاصل */}
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px bg-gray-700 flex-1"></div>
                            <span className="text-gray-400 text-sm">أو</span>
                            <div className="h-px bg-gray-700 flex-1"></div>
                        </div>

                        {/* رابط التسجيل */}
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                معندكش كونط ؟
                                <a
                                    href="/Register"
                                    className="text-purple-400 hover:text-purple-300 mr-1 font-medium transition-colors"
                                >
                                    قاد واحد بزربة
                                </a>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

export async function getServerSideProps({ req, res }) {
    const user = verifyAuth(req, res);
    if (user) return {
        redirect: {
            destination: "/",
            permanent: false,
        },
    };
    else return {
        props: { session: null },
    };
}