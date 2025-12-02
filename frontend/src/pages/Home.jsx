import React, { useEffect, useState } from 'react';
import CourseList from '../components/CourseList';
import MainLayout from '../layouts/MainLayout';

const Home = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Mock data - in production this would come from Firestore
        setCourses([
            {
                id: 'intro-cripsys',
                title: 'Introdução ao Cripsys',
                description: 'Aprenda o básico do sistema Cripsys e como configurar sua conta.',
                thumbnail: null, // Placeholder will be used
                modulesCount: 4,
                duration: '2h 15m',
                level: 'Iniciante'
            },
            {
                id: 'advanced-features',
                title: 'Funcionalidades Avançadas',
                description: 'Domine as ferramentas avançadas de análise e relatórios.',
                thumbnail: null,
                modulesCount: 6,
                duration: '3h 45m',
                level: 'Avançado'
            }
        ]);
    }, []);

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Bem-vindo ao Cripsys Academy</h1>
                <p className="text-gray-400">Explore nossos cursos e domine a plataforma.</p>
            </div>

            <CourseList courses={courses} />
        </MainLayout>
    );
};

export default Home;
