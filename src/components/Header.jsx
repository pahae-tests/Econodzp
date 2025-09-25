import React from 'react'
import { Send, User } from 'lucide-react';
import Link from 'next/link';

const Header = ({ image }) => {
  return (
    <div dir="rtl" className="lg:hidden fixed top-0 w-full bg-black/80 backdrop-blur-2xl border-b border-gray-800/50 p-3 z-40">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <Link href="/Messages" className="relative">
            <Send size={28} className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer" />
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
          </Link>
          <Link href="/Profile" className="relative w-8 h-8 rounded-full overflow-hidden">
            <img src={image} className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer" />
          </Link>
        </div>

        <Link href="/" className="text-2xl font-black bg-gradient-to-l from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
          EconoTSA7IP
        </Link>
      </div>
    </div>
  )
}

export default Header;