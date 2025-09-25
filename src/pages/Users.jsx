import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { verifyAuth } from "../middlewares/auth";

const Users = ({ session }) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSex, setSelectedSex] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users/getAll');
                if (!response.ok) {
                    throw new Error('فشل في جلب المستخدمين');
                }
                const data = await response.json();
                setUsers(data.users.filter(u => u._id != session._id) || []);
                console.log(data.users)
            } catch (err) {
                console.error('خطأ في جلب المستخدمين:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const getSexSymbol = (sex) => {
        switch (sex) {
            case 'male': return '♂️';
            case 'female': return '♀️';
            default: return '⚧️';
        }
    };

    const truncateBio = (bio, maxLength = 40) => {
        if (!bio) return "لا يوجد سيرة ذاتية";
        if (bio.length <= maxLength) return bio;
        return bio.substring(0, maxLength) + '...';
    };

    const getLevelCategory = (points) => {
        if (!points) return 'beginner';
        if (points >= 4000) return 'expert';
        if (points >= 3000) return 'advanced';
        if (points >= 2000) return 'intermediate';
        return 'beginner';
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSex = selectedSex === 'all' || user.sex === selectedSex;
        const matchesLevel = selectedLevel === 'all' || getLevelCategory(user.pointsLevel) === selectedLevel;
        return matchesSearch && matchesSex && matchesLevel;
    });

    const handleUserClick = (userId) => {
        router.push(`/User?id=${userId}`);
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen p-4 flex items-center justify-center" dir="rtl">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-screen p-4 flex flex-col items-center justify-center text-red-500" dir="rtl">
                <p className="mb-4">حدث خطأ أثناء تحميل المستخدمين</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-4" dir="rtl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">بنادم</h1>
                <p className="text-gray-400">تفرج لك فهاذ الكمامر</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl">
                <div className="p-6">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="قلب على شيحد..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl pr-12 pl-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Filters Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-2xl px-4 py-3 text-white hover:border-gray-700 transition-colors"
                    >
                        <Filter className="w-5 h-5" />
                        <span>فيلترز</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-900/30 rounded-2xl border border-gray-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Sex Filter */}
                                <div>
                                    <label className="block text-white font-medium mb-2">الجنس</label>
                                    <select
                                        value={selectedSex}
                                        onChange={(e) => setSelectedSex(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="all">الكل</option>
                                        <option value="male">ذكر ♂️</option>
                                        <option value="female">أنثى ♀️</option>
                                    </select>
                                </div>

                                {/* Level Filter */}
                                <div>
                                    <label className="block text-white font-medium mb-2">المستوى</label>
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="all">كل المستويات</option>
                                        <option value="beginner">مبتدئ (0-1999)</option>
                                        <option value="intermediate">متوسط (2000-2999)</option>
                                        <option value="advanced">متقدم (3000-3999)</option>
                                        <option value="expert">خبير (4000+)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-6 mr-4">
                <p className="text-gray-400">
                    {filteredUsers.length} مستخدم{filteredUsers.length !== 1 ? 'ون' : ''} تم{filteredUsers.length !== 1 ? '' : 'ت'} العثور عليه{filteredUsers.length !== 1 ? 'م' : ''}
                </p>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((user) => (
                    <div
                        key={user._id}
                        onClick={() => handleUserClick(user._id)}
                        className="group cursor-pointer bg-gray-950/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 hover:border-gray-700/50 hover:scale-105"
                    >
                        {/* User Image with Status */}
                        <div className="relative">
                            <div className="bg-gradient-to-tl from-pink-500/60 via-purple-500 to-cyan-500 text-white font-semibold w-fit backdrop-blur-3xl rounded-2xl px-2 py-1 shadow-2xl absolute top-3 left-3 z-10 text-xs">
                                {user.pointsLevel} 🔥
                            </div>
                            <div className="w-full aspect-square p-4">
                                <div className="w-full h-full rounded-3xl p-1 bg-gradient-to-tl from-pink-500 via-purple-500 to-cyan-500">
                                    <img
                                        src={user.img || "/user.jpg"}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="w-full h-full rounded-2xl object-cover border-2 border-black"
                                    />
                                </div>
                            </div>
                            {/* Status Badge */}
                            {user.status && user.status.trim() && (
                                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-xs text-white whitespace-nowrap max-w-[90%] truncate">
                                    {user.status}
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="p-6 pt-8">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <h3 className="text-lg font-bold text-white text-center">
                                    {user.firstName} {user.lastName}
                                </h3>
                                <span className="text-xl">{getSexSymbol(user.sex)}</span>
                            </div>
                            <p className="text-gray-300 text-sm text-center leading-relaxed">
                                {truncateBio(user.bio)}
                            </p>
                        </div>

                        {/* Hover Effect Button */}
                        <div className="p-4 pt-0">
                            <button className="w-full bg-gradient-to-l from-pink-500 via-purple-500 to-cyan-500 px-4 py-2 rounded-full font-bold text-white md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-sm">
                                دخل للبروفيل
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <div className="text-center py-16">
                    <div className="bg-gray-950/50 backdrop-blur-xl rounded-3xl border border-gray-800/50 p-12 max-w-md mx-auto">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-white mb-2">ما لقينا لك والو</h3>
                        <p className="text-gray-400">حاول تبدل البحث</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;

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