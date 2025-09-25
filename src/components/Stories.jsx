import React from 'react'

const Stories = ({ people, session }) => {
    const getName = (person) => {
        let name = `${person.firstname} ${person.lastname}`;
        return name.length > 12 ? name.slice(0, 9) + "..." : name;
    }
    
    return (
        <div className='z-50'>
            {/* Stories Section */}
            <div className="overflow-x-auto">
                <div className="flex gap-4 pb-4 overflow-x-scroll">
                    {people.filter(prsn => prsn._id !== session._id).map((person) => (
                        <div key={person._id} className="flex-shrink-0 text-center cursor-pointer group" onClick={() => window.location.href = `/User?id=${user._id}`}>
                            <div className={`w-20 h-20 rounded-full p-0.5 ${person.hasNew ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500' : 'bg-gray-700'} hover:scale-105 transition-all duration-300`}>
                                <img
                                    src={person.img || '/user.jpg'}
                                    className="w-full h-full rounded-full object-cover border-2 border-black"
                                />
                            </div>
                            <p className="text-xs mt-2 text-gray-400 group-hover:text-white transition-colors truncate w-20">
                                {getName(person)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Get a relationship */}
            <div className="w-full flex justify-center items-center">
                <button
                    className="cursor-pointer w-full md:w-1/2 lg:w-1/3 mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-6 py-3 rounded-full font-bold text-white hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 text-sm"
                    onClick={() => window.location.href = "/Love"}
                >
                    ورك هنا باش تصاحب !
                </button>
            </div>
        </div>
    )
}

export default Stories;