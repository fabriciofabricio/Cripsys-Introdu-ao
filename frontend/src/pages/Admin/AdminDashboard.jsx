import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Plus, Edit, Trash } from 'lucide-react';

const AdminDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

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
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Link
                    to="/admin/course/new"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center space-x-2 transition"
                >
                    <Plus size={20} />
                    <span>Create Course</span>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading courses...</div>
            ) : (
                <div className="bg-secondary rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Modules</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                        No courses found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-white/5 transition">
                                        <td className="px-6 py-4 font-medium">{course.title}</td>
                                        <td className="px-6 py-4">{course.modules?.length || 0}</td>
                                        <td className="px-6 py-4 flex space-x-3">
                                            <Link
                                                to={`/admin/course/${course.id}`}
                                                className="text-blue-400 hover:text-blue-300"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button className="text-red-400 hover:text-red-300" title="Delete">
                                                <Trash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </MainLayout>
    );
};

export default AdminDashboard;
