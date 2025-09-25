import React, { useState, useEffect } from 'react';
import { verifyAuth } from "../middlewares/auth";
import Stories from '@/components/Stories';

const Index = ({ session }) => {
  const [scrollY, setScrollY] = useState(0);
  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsResponse = await fetch('/api/posts/getAll');
        if (!postsResponse.ok) throw new Error('فشل في جلب المنشورات');
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);

        const peopleResponse = await fetch('/api/users/getSome');
        if (!peopleResponse.ok) throw new Error('فشل في جلب المستخدمين');
        const peopleData = await peopleResponse.json();
        setPeople(peopleData.users || []);
      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getName = (n1, n2) => {
    let name = `${n1} ${n2}`;
    return name.length > 16 ? name.slice(0, 13) + "..." : name;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500" dir="rtl">
        خطأ: {error}
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-2xl mx-auto px-4 py-6 flex flex-col" dir="rtl">
      <Stories people={people} session={session} />

      {/* تغذية المنشورات */}
      <div className="space-y-8">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="group relative bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 hover:border-gray-700/50"
            style={{
              transform: `translateY(${scrollY * 0.02 * index}px)`,
            }}
          >
            {/* رأس المنشور */}
            <div className="flex items-center justify-between p-6">
              <div className="absolute top-4 right-2 bg-gradient-to-tl from-pink-500/60 via-purple-500 to-cyan-500 text-white text-sm w-fit backdrop-blur-3xl rounded-3xl px-1 py-0 shadow-2xl">
                {post.user.pointsLevel || 0} 🔥
              </div>
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.href = `/User?id=${post.user._id}`}>
                <div className="flex flex-row-reverse items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <h3 className="font-bold text-lg text-white">
                        {getName(post.user.firstName, post.user.lastName)}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400">{post.timestamp}</p>
                  </div>
                  <img
                    src={post.user.img}
                    alt={`${post.user.firstName} ${post.user.lastName}`}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-pink-500/50 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* محتوى المنشور */}
            <div className="px-6 pb-4 text-right">
              <p className="text-gray-100 leading-relaxed text-lg">{post.content}</p>
            </div>

            {/* صورة المنشور */}
            {post.img &&
              <div className="relative group/media">
                <img
                  src={post.img}
                  alt="محتوى المنشور"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity"></div>
              </div>
            }

            {/* زر "رسالة" تحت الصورة */}
            {post.user._id !== session._id &&
              <div className="p-6">
                <button
                  onClick={() => { window.location.href = `/User?id=${post.user._id}` }}
                  className="w-full bg-gradient-to-l from-pink-500 via-purple-500 to-cyan-500 px-6 py-3 rounded-full font-bold text-white hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 text-sm"
                >
                  اححح قصدي اححح
                </button>
              </div>
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;

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
