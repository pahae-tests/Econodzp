import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const Register = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        birth: '',
        sex: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        firstname: '',
        lastname: '',
        email: '',
        birth: '',
        sex: '',
        password: ''
    });
    const [fadeClass, setFadeClass] = useState('opacity-100');
    const steps = [
        { title: 'المعلومات دياولك', fields: ['firstname', 'lastname'] },
        { title: 'معلومات الاتصال وتاريخ الميلاد', fields: ['email', 'birth'] },
        { title: 'الجنس', fields: ['sex'] },
        { title: 'مودباص', fields: ['password'] }
    ];

    // Les fonctions de validation restent identiques
    const validateField = (field, value) => {
        let error = '';
        switch (field) {
            case 'firstname':
            case 'lastname':
                if (!value.trim()) error = 'هذا الحقل مطلوب';
                else if (value.length < 2) error = 'الحد الأدنى 2 أحرف';
                else if (!/^[a-zA-ZàâäéèêëîïôöùûüÿçœÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇŒ\s-]+$/.test(value))
                    error = 'أحرف غير صالحة';
                break;
            case 'email':
                if (!value.trim()) error = 'هذا الحقل مطلوب';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    error = 'بريد إلكتروني غير صالح';
                break;
            case 'birth':
                if (!value) error = 'هذا الحقل مطلوب';
                else {
                    const birthDate = new Date(value);
                    const today = new Date();
                    const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
                    if (birthDate > minAgeDate) {
                        error = 'يجب أن يكون عمرك 13 سنة على الأقل';
                    }
                }
                break;
            case 'sex':
                if (!value) error = 'الرجاء اختيار خيار';
                break;
            case 'password':
                if (!value) error = 'هذا الحقل مطلوب';
                else if (value.length < 8) error = 'الحد الأدنى 8 أحرف';
                else if (!/[A-Z]/.test(value)) error = 'حرف كبير واحد على الأقل';
                else if (!/[a-z]/.test(value)) error = 'حرف صغير واحد على الأقل';
                else if (!/[0-9]/.test(value)) error = 'رقم واحد على الأقل';
                break;
            default:
                break;
        }
        return error;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const nextStep = () => {
        const currentFields = steps[currentStep].fields;
        let hasErrors = false;
        const newErrors = { ...errors };
        currentFields.forEach(field => {
            const error = validateField(field, formData[field]);
            newErrors[field] = error;
            if (error) hasErrors = true;
        });
        setErrors(newErrors);
        if (!hasErrors && currentStep < steps.length - 1) {
            setFadeClass('opacity-0');
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setFadeClass('opacity-100');
            }, 300);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setFadeClass('opacity-0');
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setFadeClass('opacity-100');
            }, 300);
        }
    };

    const handleSubmit = async () => {
        const allFields = Object.keys(formData);
        let hasErrors = false;
        const finalErrors = { ...errors };
        allFields.forEach(field => {
            const error = validateField(field, formData[field]);
            finalErrors[field] = error;
            if (error) hasErrors = true;
        });
        setErrors(finalErrors);
        if (!hasErrors) {
            try {
                const response = await fetch('/api/_auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'فشل في التسجيل');
                }
                setFormData({
                    firstname: '',
                    lastname: '',
                    email: '',
                    birth: '',
                    sex: '',
                    password: ''
                });
                window.location.href = "/";
            } catch (error) {
                console.error('خطأ أثناء التسجيل:', error);
                alert(`خطأ: ${error.message}`);
            }
        }
    };

    const canProceed = () => {
        const currentFields = steps[currentStep].fields;
        return currentFields.every(field => {
            const error = validateField(field, formData[field]);
            return !error && formData[field].toString().trim() !== '';
        });
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            المعلومات دياولك
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="سميتك"
                                    value={formData.firstname}
                                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.firstname ? 'border-red-500' : 'border-gray-700'
                                        } rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors text-right`}
                                />
                                {errors.firstname && (
                                    <p className="mt-1 text-sm text-red-400 text-right">{errors.firstname}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="كنيتك"
                                    value={formData.lastname}
                                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.lastname ? 'border-red-500' : 'border-gray-700'
                                        } rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors text-right`}
                                />
                                {errors.lastname && (
                                    <p className="mt-1 text-sm text-red-400 text-right">{errors.lastname}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            معلومات الاتصال وتاريخ الميلاد
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="الايمايل"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.email ? 'border-red-500' : 'border-gray-700'
                                        } rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors text-right`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-400 text-right">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="date"
                                    placeholder="تاريخ الميلاد"
                                    value={formData.birth}
                                    onChange={(e) => handleInputChange('birth', e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.birth ? 'border-red-500' : 'border-gray-700'
                                        } rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors text-right`}
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                                />
                                {errors.birth && (
                                    <p className="mt-1 text-sm text-red-400 text-right">{errors.birth}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            جنسك
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div
                                className={`relative aspect-square bg-gray-900/50 border-2 rounded-3xl cursor-pointer transition-all duration-500 hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/25 group ${formData.sex === 'female' ? 'border-pink-500 shadow-pink-500/25' : 'border-gray-700'
                                    } ${errors.sex ? 'border-red-500' : ''}`}
                                onClick={() => handleInputChange('sex', 'female')}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/20 group-hover:to-purple-500/20 transition-all duration-500"></div>
                                <div className="h-full flex flex-col items-center justify-center p-6">
                                    <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 group-hover:from-pink-500 group-hover:to-purple-500 flex items-center justify-center text-4xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                                        <img src="/mikasa.png" alt="" />
                                    </div>
                                    <span className="text-white font-semibold text-lg group-hover:text-pink-300 transition-colors translate-y-4">أنثى</span>
                                </div>
                            </div>
                            <div
                                className={`relative aspect-square bg-gray-900/50 border-2 rounded-3xl cursor-pointer transition-all duration-500 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/25 group ${formData.sex === 'male' ? 'border-blue-500 shadow-blue-500/25' : 'border-gray-700'
                                    } ${errors.sex ? 'border-red-500' : ''}`}
                                onClick={() => handleInputChange('sex', 'male')}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-500"></div>
                                <div className="h-full flex flex-col items-center justify-center p-6">
                                    <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 group-hover:from-blue-500 group-hover:to-cyan-500 flex items-center justify-center text-4xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                                        <img src="/levi.png" alt="" />
                                    </div>
                                    <span className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors translate-y-4">ذكر</span>
                                </div>
                            </div>
                        </div>
                        {errors.sex && (
                            <p className="mt-2 text-sm text-red-400 text-center">{errors.sex}</p>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            مودباص
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    placeholder="مودباص"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.password ? 'border-red-500' : 'border-gray-700'
                                        } rounded-2xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors text-right`}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-400 text-right">{errors.password}</p>
                                )}
                            </div>
                            <div className="text-sm text-gray-400 space-y-1 text-right">
                                <p>• الحد الأدنى 8 أحرف</p>
                                <p>• حرف كبير واحد على الأقل وحرف صغير واحد</p>
                                <p>• رقم واحد على الأقل</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4" dir="rtl">
            <div className="w-full max-w-md">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 text-sm">الخطوة {currentStep + 1} أصل من {steps.length}</span>
                        <span className="text-gray-400 text-sm">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
                {/* Main Form Container */}
                <div className="bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl p-8">
                    <div className={`transition-opacity duration-300 ${fadeClass}`}>
                        {renderStep()}
                    </div>
                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8">
                        <button
                            onClick={nextStep}
                            disabled={!canProceed() || currentStep === steps.length - 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${(!canProceed() || currentStep === steps.length - 1)
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-pink-500/25 hover:scale-105'
                                }`}
                        >
                            <span className="hidden md:block">زيد</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        {currentStep === steps.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!canProceed()}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${canProceed()
                                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-pink-500/25 hover:scale-105'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                سير عالله
                            </button>
                        ) : (
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${currentStep === 0
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
                                    }`}
                            >
                                <span className="hidden md:block">رجع لور</span>
                                <ChevronLeft className="font-semibold w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                {/* Footer */}
                <div className="text-center mt-6">
                    <div className="text-gray-400 text-sm">
                        ديجا عندك كونط ؟
                        <Link href="/Login" className="cursor-pointer hover:underline text-purple-400 hover:text-purple-300 mr-1 transition-colors">
                            تسجيل الدخول
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;