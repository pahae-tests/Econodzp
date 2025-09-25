import React from 'react';
import { Heart, Home, Plus, Users, User, Bell, Send } from 'lucide-react';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();
  const elements = [
    { icon: Home, href: "/", label: "الرئيسية" },
    { icon: Heart, href: "/Love", label: "تصاحب" },
    { icon: Plus, href: "/Add", label: "بوسطي" },
    { icon: Users, href: "/Users", label: "بنادم" },
    { icon: User, href: "/Profile", label: "البروفيل" },
    { icon: Bell, href: "/Notifications", label: "الإشعارات" },
    { icon: Send, href: "/Messages", label: "الميساجات" },
  ];

  return (
    <div className="hidden lg:flex fixed right-0 top-0 bottom-0 w-20 bg-black/80 backdrop-blur-2xl p-3 z-50 flex-col gap-4 py-6">
      {elements.map((el, k) => {
        const isActive = router.pathname === el.href;
        const Icon = el.icon;
        return (
          <div
            key={k}
            className={`cursor-pointer hover:bg-gradient-to-l hover:from-pink-500/60 hover:to-purple-500/60 relative flex flex-col items-center justify-center w-fit p-2 rounded-lg transition-colors ${
              isActive ? "bg-gradient-to-l from-pink-500 to-purple-500" : "hover:bg-gray-800/30"
            }`}
            onClick={() => router.push(el.href)}
          >
            <Icon
              size={24}
              className={`${
                isActive ? "text-white" : "text-gray-400"
              }`}
            />
            {/* Tooltip ou texte miniaturisé (optionnel) */}
            <span className="absolute right-full mr-2 px-2 py-1 text-lg font-bold text-white bg-black/80 rounded-md whitespace-nowrap">
              {el.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;