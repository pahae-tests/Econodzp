import React, { useState, useEffect } from 'react';
import { Search, Send } from 'lucide-react';
import { verifyAuth } from "../middlewares/auth";

const Messages = ({ session }) => {
  const [scrollY, setScrollY] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [screenWidth, setScreenWidth] = useState(0);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // استرجاع المحادثات عند التحميل
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/msgs/getChats?userId=${session._id}`);
        const data = await response.json();
        if (data.success) {
          setChats(data.chats);
        } else {
          setError(data.message || 'فشل في تحميل المحادثات');
        }
      } catch (err) {
        console.error('خطأ في جلب المحادثات:', err);
        setError('خطأ في تحميل المحادثات');
      } finally {
        setIsLoading(false);
      }
    };
    if (session?._id) {
      fetchChats();
    }
  }, [session?._id]);

  const filteredChats = chats.filter(chat =>
    `${chat.firstname} ${chat.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6" dir="rtl">
        <div className="mb-8 bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">الرسائل</h1>
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="بحث باسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full pr-12 pl-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all text-right"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6" dir="rtl">
        <div className="mb-8 bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">الرسائل</h1>
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="بحث باسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full pr-12 pl-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all text-right"
              />
            </div>
          </div>
        </div>
        <div className="text-center py-12 bg-gray-950/50 backdrop-blur-xl rounded-3xl border border-gray-800/50 shadow-2xl">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6" dir="rtl">
      {/* رأس الصفحة مع البحث */}
      <div
        className="mb-8 bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl"
        style={{
          transform: `translateY(${scrollY * 0.02}px)`,
        }}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-4">الرسائل</h1>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث باسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-full pr-12 pl-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all text-right"
            />
          </div>
        </div>
      </div>

      {/* قائمة الرسائل */}
      <div className="space-y-4">
        {filteredChats.length === 0 ? (
          <div
            className="text-center py-12 bg-gray-950/50 backdrop-blur-xl rounded-3xl border border-gray-800/50 shadow-2xl"
            style={{
              transform: `translateY(${scrollY * 0.02}px)`,
            }}
          >
            {searchTerm ? (
              <p className="text-gray-400">لم يتم العثور على رسائل لـ "{searchTerm}"</p>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-gray-400 mb-2">لا توجد محادثات حتى الآن</p>
                <p className="text-gray-500 text-sm">ابدأ محادثة جديدة مع صديق</p>
              </div>
            )}
          </div>
        ) : (
          filteredChats.map((chat, index) => (
            <div
              key={chat._id}
              onClick={() => window.location.href = `/Chat?room=${chat._id < session._id ? chat._id + session._id : session._id + chat._id}&userID=${chat._id}`}
              className="group cursor-pointer bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 hover:border-gray-700/50 hover:scale-[1.02]"
              style={{
                transform: `translateY(${scrollY * 0.02 * index}px)`,
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-14 h-14">
                      <img
                        src={chat.img || '/user.jpg'}
                        alt={`${chat.firstname} ${chat.lastname}`}
                        className="w-full h-full rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-pink-500/50 transition-all duration-300"
                      />
                      {!chat.seen && (
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full border-2 border-gray-950"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-cyan-500 transition-all duration-300">
                          {chat.firstname} {chat.lastname}
                        </h3>
                        <span className="text-xs text-gray-400">{new Date(chat.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <p className={`text-sm mt-1 truncate ${chat.seen ? 'text-gray-400' : 'text-gray-100 font-medium'} transition-colors`}>
                        {chat.seen ? "انقر للدردشة" : "رسالة جديدة 🔥"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* مؤشر التحويم */}
              <div className="h-1 w-0 group-hover:w-full bg-gradient-to-l from-pink-500 via-purple-500 to-cyan-500 transition-all duration-500"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;

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
        _id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        img: user.img,
        email: user.email,
      }
    },
  };
}