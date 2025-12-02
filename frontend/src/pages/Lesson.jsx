import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import VideoPlayer from '../components/VideoPlayer';
import { functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { Play, CheckCircle } from 'lucide-react';

const Lesson = () => {
    const { courseId, lessonId } = useParams();
    const [isCompleted, setIsCompleted] = useState(false);

    // Mock data for the lesson structure
    const modules = [
        {
            id: 'm1',
            title: 'Módulo 1: Primeiros Passos',
            lessons: [
                { id: 'l1', title: 'Visão Geral do Sistema', duration: '10:00' },
                { id: 'l2', title: 'Configurando Perfil', duration: '05:30' },
            ]
        },
        {
            id: 'm2',
            title: 'Módulo 2: Operações Básicas',
            lessons: [
                { id: 'l3', title: 'Criando Projetos', duration: '15:20' },
            ]
        }
    ];

    const currentLesson = {
        title: 'Visão Geral do Sistema',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Sample video
        description: 'Nesta aula, vamos explorar a interface principal do Cripsys.'
    };

    const handleComplete = async () => {
        try {
            // Optimistic update
            setIsCompleted(true);

            const addCourseCompleted = httpsCallable(functions, 'addCourseCompleted');
            await addCourseCompleted({ courseId, lessonId: lessonId || 'l1' });

            console.log('Progress saved');
        } catch (error) {
            console.error('Error saving progress:', error);
            setIsCompleted(false); // Revert on error
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Video Area */}
                <div className="flex-1">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                        <p className="text-gray-400">Módulo 1 • Aula 1</p>
                    </div>

                    <VideoPlayer
                        videoUrl={currentLesson.videoUrl}
                        onComplete={handleComplete}
                        isCompleted={isCompleted}
                    />

                    <div className="mt-8 bg-secondary p-6 rounded-lg">
                        <h3 className="font-bold text-lg mb-2">Sobre esta aula</h3>
                        <p className="text-gray-300">{currentLesson.description}</p>
                    </div>
                </div>

                {/* Sidebar / Playlist */}
                <div className="w-full lg:w-80 space-y-4">
                    <h3 className="font-bold text-xl mb-4">Conteúdo do Curso</h3>

                    {modules.map((module) => (
                        <div key={module.id} className="bg-secondary rounded-lg overflow-hidden">
                            <div className="p-4 bg-gray-800 border-b border-gray-700">
                                <h4 className="font-medium text-gray-200">{module.title}</h4>
                            </div>
                            <div className="divide-y divide-gray-700">
                                {module.lessons.map((lesson) => (
                                    <button
                                        key={lesson.id}
                                        className={`w-full p-4 flex items-center space-x-3 hover:bg-white/5 transition text-left ${lesson.id === (lessonId || 'l1') ? 'bg-accent/10 border-l-4 border-accent' : ''
                                            }`}
                                    >
                                        {isCompleted && lesson.id === 'l1' ? (
                                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                        ) : (
                                            <Play size={16} className={`flex-shrink-0 ${lesson.id === (lessonId || 'l1') ? 'text-accent' : 'text-gray-500'}`} />
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${lesson.id === (lessonId || 'l1') ? 'text-accent' : 'text-gray-300'}`}>
                                                {lesson.title}
                                            </p>
                                            <span className="text-xs text-gray-500">{lesson.duration}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default Lesson;
