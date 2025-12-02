import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import VideoPlayer from '../components/VideoPlayer';
import { db, functions } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Play, CheckCircle, Clock, ChevronRight, ChevronDown } from 'lucide-react';

const Lesson = () => {
    const { courseId, lessonId } = useParams();
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});
    const playerRef = useRef(null);

    useEffect(() => {
        const fetchCourseAndLesson = async () => {
            try {
                const docRef = doc(db, "courses", courseId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const courseData = docSnap.data();
                    setCourse(courseData);

                    // Initialize expanded modules (expand all by default or just the current one)
                    const initialExpanded = {};
                    courseData.modules?.forEach(m => initialExpanded[m.id] = true);
                    setExpandedModules(initialExpanded);

                    // Find current lesson
                    let foundLesson = null;
                    if (courseData.modules) {
                        for (const module of courseData.modules) {
                            const lesson = module.lessons?.find(l => l.id === lessonId);
                            if (lesson) {
                                foundLesson = lesson;
                                break;
                            }
                        }
                    }

                    // If no lessonId provided or not found, default to first lesson of first module
                    if (!foundLesson && courseData.modules?.length > 0 && courseData.modules[0].lessons?.length > 0) {
                        foundLesson = courseData.modules[0].lessons[0];
                    }

                    setCurrentLesson(foundLesson);
                } else {
                    console.error("Course not found");
                }
            } catch (error) {
                console.error("Error fetching course:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseAndLesson();
    }, [courseId, lessonId]);

    const handleComplete = async () => {
        try {
            setIsCompleted(true);
            const addCourseCompleted = httpsCallable(functions, 'addCourseCompleted');
            await addCourseCompleted({ courseId, lessonId: currentLesson?.id });
            console.log('Progress saved');
        } catch (error) {
            console.error('Error saving progress:', error);
            setIsCompleted(false);
        }
    };

    const handleTimestampClick = (time) => {
        if (playerRef.current) {
            playerRef.current.jumpToTime(time);
        }
    };

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                </div>
            </MainLayout>
        );
    }

    if (!course || !currentLesson) {
        return (
            <MainLayout>
                <div className="text-center py-10">
                    <h2 className="text-2xl font-bold mb-2">Lesson not found</h2>
                    <p className="text-gray-400">The requested lesson could not be loaded.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar: Course Content (Playlist) */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-secondary rounded-lg border border-gray-700 min-h-[calc(100vh-120px)]">
                    <div className="p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
                        <h3 className="font-bold text-lg">Conteúdo do Curso</h3>
                        <p className="text-xs text-gray-400 mt-1">{course.title}</p>
                    </div>

                    <div className="p-2 space-y-2">
                        {course.modules?.map((module) => (
                            <div key={module.id} className="rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full p-3 bg-gray-800/50 hover:bg-gray-800 flex items-center justify-between text-left transition"
                                >
                                    <span className="font-medium text-sm text-gray-200">{module.title}</span>
                                    {expandedModules[module.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>

                                {expandedModules[module.id] && (
                                    <div className="bg-primary/30 divide-y divide-gray-800">
                                        {module.lessons?.map((lesson) => (
                                            <a
                                                key={lesson.id}
                                                href={`/course/${courseId}/lesson/${lesson.id}`}
                                                className={`w-full p-3 pl-4 flex items-center space-x-3 hover:bg-white/5 transition text-left ${lesson.id === currentLesson.id ? 'bg-accent/10 border-l-2 border-accent' : ''
                                                    }`}
                                            >
                                                {isCompleted && lesson.id === currentLesson.id ? (
                                                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <Play size={14} className={`flex-shrink-0 ${lesson.id === currentLesson.id ? 'text-accent' : 'text-gray-500'}`} />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm truncate ${lesson.id === currentLesson.id ? 'text-accent font-medium' : 'text-gray-400'}`}>
                                                        {lesson.title}
                                                    </p>
                                                    <span className="text-xs text-gray-600">{lesson.duration || '00:00'}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area: Video + Timestamps */}
                <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                        <p className="text-gray-400 text-sm">{course.title}</p>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6">
                        {/* Video Player Column */}
                        <div className="flex-1">
                            <VideoPlayer
                                ref={playerRef}
                                videoUrl={currentLesson.videoUrl}
                                onComplete={handleComplete}
                                isCompleted={isCompleted}
                            />

                            <div className="mt-6 bg-secondary p-6 rounded-lg">
                                <h3 className="font-bold text-lg mb-2">Sobre esta aula</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">{currentLesson.description}</p>
                            </div>
                        </div>

                        {/* Timestamps Column (Aligned with Video) */}
                        {currentLesson.timestamps && currentLesson.timestamps.length > 0 && (
                            <div className="w-full xl:w-72 flex-shrink-0">
                                <div className="bg-secondary rounded-lg overflow-hidden border border-gray-700 h-fit">
                                    <div className="p-4 bg-gray-800 border-b border-gray-700">
                                        <h3 className="font-bold text-md flex items-center space-x-2">
                                            <Clock size={18} className="text-accent" />
                                            <span>Conteúdo da Aula</span>
                                        </h3>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {currentLesson.timestamps.map((ts, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleTimestampClick(ts.time)}
                                                className="w-full p-3 rounded hover:bg-white/5 transition text-left group flex items-start space-x-3"
                                            >
                                                <span className="text-xs font-mono bg-primary px-2 py-1 rounded text-accent group-hover:bg-accent group-hover:text-white transition">
                                                    {formatTime(ts.time)}
                                                </span>
                                                <span className="text-sm text-gray-300 group-hover:text-white transition pt-0.5">
                                                    {ts.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Lesson;
