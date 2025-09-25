import React from 'react'
import { Heart, Home, Plus, Users, User, Bell } from 'lucide-react';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const elements = [
    { icon: Heart, href: "/Love", isAdd: false },
    { icon: Users, href: "/Users", isAdd: false },
    { icon: Plus, href: "/Add", isAdd: true },
    { icon: Bell, href: "/Notifications", isAdd: false },
    { icon: Home, href: "/", isAdd: false },
  ];

  return (
    <div dir="rtl" className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-2xl border-t border-gray-800/50 p-3 z-50">
      <div className="flex justify-around items-center">
        {elements.map((el, k) => {
          if (el.isAdd) {
            return (
              <div
                key={k}
                className="cursor-pointer p-2 bg-gradient-to-l from-pink-500 to-purple-500 rounded-full hover:scale-110 duration-200 hover:rotate-180 hover:font-bold"
                onClick={() => router.push(el.href)}
              >
                <Plus size={24} className="text-white" />
              </div>
            );
          } else {
            const Icon = el.icon;
            return (
              <Icon
                key={k}
                size={28}
                className={`cursor-pointer ${router.pathname === el.href ? "text-pink-400" : "text-gray-400 hover:text-white transition-colors"}`}
                onClick={() => router.push(el.href)}
              />
            );
          }
        })}
      </div>
    </div>
  );
};


export default Navbar;
