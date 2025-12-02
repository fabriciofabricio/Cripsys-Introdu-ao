import React, { useEffect, useState } from 'react';
import CourseList from '../components/CourseList';
import MainLayout from '../layouts/MainLayout';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "courses"));
                const coursesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
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
