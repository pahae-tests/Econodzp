import React, { useState } from 'react';

const Popup = ({ redirectLink, showPopup, setShowPopup }) => {
    const [currentStep, setCurrentStep] = useState(1);

    // Fonction pour fermer le popup et reset l'étape
    const closePopup = () => {
        setShowPopup(false);
        setCurrentStep(1);
    };

    // Fonction pour aller à l'étape suivante
    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    // Fonction pour rediriger
    const handleRedirect = () => {
        closePopup();
        window.location.href = redirectLink();
    };

    // Fonction pour aller à l'étape précédente (optionnel)
    const previousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Si le popup ne doit pas être affiché, on retourne null
    if (!showPopup) return null;

    // Contenu pour chaque étape
    const getStepContent = () => {
        switch (currentStep) {
            case 1:
                return {
                    title: "تحذير ! دير النفس أجمي خليها هي لي تصيفط لك",
                    buttons: [
                        {
                            text: "صافي واخا",
                            action: closePopup,
                            style: "bg-gray-800 rounded-3xl text-white font-semibold px-6 py-3 hover:bg-gray-700 transition-all duration-300"
                        },
                        {
                            text: "عارف اش كندير متخافش",
                            action: nextStep,
                            style: "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl text-white font-semibold px-6 py-3 hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
                        }
                    ]
                };
            case 2:
                return {
                    title: "متأكد باغي تصغر براصك ؟؟؟",
                    buttons: [
                        {
                            text: "لا صافي كنتراجع",
                            action: closePopup,
                            style: "bg-gray-800 rounded-3xl text-white font-semibold px-6 py-3 hover:bg-gray-700 transition-all duration-300"
                        },
                        {
                            text: "تا حيد أصحبي",
                            action: nextStep,
                            style: "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl text-white font-semibold px-6 py-3 hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
                        }
                    ]
                };
            case 3:
                return {
                    title: "متأكد متأكد ؟",
                    buttons: [
                        {
                            text: "لا صافي نخرج",
                            action: closePopup,
                            style: "bg-gray-800 rounded-3xl text-white font-semibold px-6 py-3 hover:bg-gray-700 transition-all duration-300"
                        },
                        {
                            text: "حيد تقود أتبي",
                            action: handleRedirect,
                            style: "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl text-white font-semibold px-6 py-3 hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
                        }
                    ]
                };
            default:
                return null;
        }
    };

    const stepContent = getStepContent();

    if (!stepContent) return null;

    return (
        <div 
            className='w-full h-full fixed top-0 left-0 flex justify-center items-center backdrop-blur-md cursor-pointer z-50'
            onClick={closePopup}
        >
            <div 
                className='flex flex-col justify-around items-center gap-8 bg-black/60 backdrop-blur-3xl rounded-3xl w-[90%] md:w-1/2 lg:w-1/3 py-8 px-6 cursor-default border border-gray-800/50 shadow-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Indicateur d'étape */}
                <div className="flex gap-2 mb-4">
                    {[1, 2, 3].map((step) => (
                        <div
                            key={step}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                step === currentStep 
                                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500' 
                                    : step < currentStep 
                                        ? 'bg-gray-400' 
                                        : 'bg-gray-700'
                            }`}
                        />
                    ))}
                </div>

                {/* Titre principal */}
                <div className="text-center mb-6">
                    <span className='text-white font-bold text-xl md:text-2xl leading-relaxed text-center'>
                        {stepContent.title}
                    </span>
                </div>

                {/* Boutons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                    {stepContent.buttons.map((button, index) => (
                        <button
                            key={index}
                            className={button.style}
                            onClick={button.action}
                        >
                            {button.text}
                        </button>
                    ))}
                </div>

                {/* Bouton de fermeture en haut à droite (optionnel) */}
                <button
                    onClick={closePopup}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Popup;