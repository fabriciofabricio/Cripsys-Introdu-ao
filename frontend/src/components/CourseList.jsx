import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock } from 'lucide-react';

const CourseList = ({ courses }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
                <Link
                    key={course.id}
                    to={`/course/${course.id}`}
                    className="bg-secondary rounded-lg overflow-hidden hover:transform hover:scale-105 transition duration-300 shadow-lg group"
                >
                    <div className="h-48 bg-gray-700 relative">
                        {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <PlayCircle size={48} className="text-gray-600 group-hover:text-accent transition" />
                            </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{course.duration || '1h 30m'}</span>
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition">{course.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>

                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                            <span>{course.modulesCount || 5} Modules</span>
                            <span>{course.level || 'Beginner'}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default CourseList;
