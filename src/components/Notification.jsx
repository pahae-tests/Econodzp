import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Notification = ({ message, link, onClose, shown }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // مراقبة خاصية "shown"
  useEffect(() => {
    if (shown) {
      setIsVisible(true);
      setProgress(0);
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsVisible(false);
            setTimeout(() => onClose && onClose(), 300);
            return 100;
          }
          return prev + (100 / (2000 / 50)); // سرعة التعبئة
        });
      }, 100);
      return () => clearInterval(progressInterval);
    } else {
      setIsVisible(false);
    }
  }, [shown, onClose]);

  const handleClick = () => {
    if (link) {
      window.location.href = link;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose && onClose(), 300);
  };

  return (
    <div
      className={`
        fixed top-4 left-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}
      `}
      dir="rtl"
    >
      <div
        className={`
          group relative bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden
          border border-gray-800/50 shadow-2xl hover:shadow-pink-500/10
          transition-all duration-500 hover:border-gray-700/50 hover:scale-[1.02]
          ${link ? 'cursor-pointer' : ''}
        `}
        onClick={handleClick}
      >
        {/* زر الإغلاق */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-4 left-4 z-10 p-1 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>

        <div className="p-6 pl-12">
          <p className="text-white text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* شريط التقدم */}
        <div className="absolute bottom-0 right-0 w-full h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-l from-pink-500 to-purple-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* مؤشر التحويم */}
        <div className="h-1 w-0 group-hover:w-full bg-gradient-to-l from-pink-500 via-purple-500 to-cyan-500 transition-all duration-500 absolute top-0 right-0"></div>
      </div>
    </div>
  );
};

export default Notification;