import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Award, Clock, Book, CheckCircle, Play } from 'lucide-react';
import { db, auth } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const Dashboard = () => {
    const [stats, setStats] = useState({
        coursesInProgress: 0,
        completedLessons: 0,
        hoursWatched: 0
    });
    const [continueWatching, setContinueWatching] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.currentUser) return;

            try {
                // 1. Fetch all courses
                const coursesSnapshot = await getDocs(collection(db, "courses"));
                const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 2. Fetch user progress for each course
                let totalCompletedLessons = 0;
                let totalSecondsWatched = 0;
                let coursesStarted = 0;
                let lastActiveCourse = null;

                for (const course of courses) {
                    const progressRef = doc(db, "users", auth.currentUser.uid, "progress", course.id);
                    const progressSnap = await getDoc(progressRef);

                    if (progressSnap.exists()) {
                        const progressData = progressSnap.data();
                        const completed = progressData.completedLessons || [];

                        if (completed.length > 0) {
                            coursesStarted++;
                            totalCompletedLessons += completed.length;

                            // Calculate duration of completed lessons
                            course.modules?.forEach(module => {
                                module.lessons?.forEach(lesson => {
                                    if (completed.includes(lesson.id)) {
                                        totalSecondsWatched += parseFloat(lesson.duration || 0);
                                    }
                                });
                            });

                            // Determine if this is a candidate for "Continue Watching"
                            // For simplicity, pick the first course with progress but not fully completed
                            // Or just the first course with progress.
                            // Ideally we'd have a "lastAccessed" timestamp.
                            if (!lastActiveCourse) {
                                // Find the first uncompleted lesson
                                let nextLesson = null;
                                let foundUncompleted = false;

                                for (const module of course.modules || []) {
                                    for (const lesson of module.lessons || []) {
                                        if (!completed.includes(lesson.id)) {
                                            nextLesson = lesson;
                                            foundUncompleted = true;
                                            break;
                                        }
                                    }
                                    if (foundUncompleted) break;
                                }

                                if (nextLesson) {
                                    const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
                                    const progressPercent = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0;

                                    lastActiveCourse = {
                                        courseId: course.id,
                                        courseTitle: course.title,
                                        lessonId: nextLesson.id,
                                        lessonTitle: nextLesson.title,
                                        moduleTitle: course.modules.find(m => m.lessons.some(l => l.id === nextLesson.id))?.title,
                                        progress: progressPercent
                                    };
                                }
                            }
                        }
                    }
                }

                setStats({
                    coursesInProgress: coursesStarted,
                    completedLessons: totalCompletedLessons,
                    hoursWatched: (totalSecondsWatched / 3600).toFixed(1)
                });
                setContinueWatching(lastActiveCourse);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <h1 className="text-3xl font-bold mb-8">Meu Painel</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-secondary p-6 rounded-lg flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-500">
                        <Book size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Cursos em Andamento</p>
                        <p className="text-2xl font-bold">{stats.coursesInProgress}</p>
                    </div>
                </div>

                <div className="bg-secondary p-6 rounded-lg flex items-center space-x-4">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-500">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Aulas Concluídas</p>
                        <p className="text-2xl font-bold">{stats.completedLessons}</p>
                    </div>
                </div>

                <div className="bg-secondary p-6 rounded-lg flex items-center space-x-4">
                    <div className="p-3 bg-purple-500/20 rounded-full text-purple-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Horas Assistidas</p>
                        <p className="text-2xl font-bold">{stats.hoursWatched}h</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Continuar Assistindo</h2>
            {continueWatching ? (
                <div className="bg-secondary rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg">{continueWatching.courseTitle}</h3>
                            <p className="text-sm text-gray-400">{continueWatching.moduleTitle}: {continueWatching.lessonTitle}</p>
                        </div>
                        <Link
                            to={`/course/${continueWatching.courseId}/lesson/${continueWatching.lessonId}`}
                            className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition flex items-center space-x-2"
                        >
                            <Play size={16} />
                            <span>Continuar</span>
                        </Link>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-accent h-2.5 rounded-full" style={{ width: `${continueWatching.progress}%` }}></div>
                    </div>
                    <p className="text-right text-xs text-gray-400 mt-2">{continueWatching.progress}% Concluído</p>
                </div>
            ) : (
                <div className="bg-secondary rounded-lg p-8 text-center text-gray-400">
                    <p>Você ainda não iniciou nenhum curso.</p>
                    <Link to="/" className="text-accent hover:underline mt-2 inline-block">Explorar Cursos</Link>
                </div>
            )}
        </MainLayout>
    );
};

export default Dashboard;
