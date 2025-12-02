import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Save, Plus, ArrowLeft, Video } from 'lucide-react';

const CourseEditor = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const isNew = courseId === 'new';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(!isNew);

    useEffect(() => {
        if (!isNew) {
            const fetchCourse = async () => {
                const docRef = doc(db, "courses", courseId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    setDescription(data.description);
                    setModules(data.modules || []);
                }
                setLoading(false);
            };
            fetchCourse();
        }
    }, [courseId, isNew]);

    const handleSave = async () => {
        try {
            const id = isNew ? title.toLowerCase().replace(/\s+/g, '-') : courseId;
            const courseData = {
                title,
                description,
                modules,
                updatedAt: new Date()
            };

            await setDoc(doc(db, "courses", id), courseData, { merge: true });
            if (isNew) navigate(`/admin/course/${id}`);
            alert('Course saved successfully!');
        } catch (error) {
            console.error("Error saving course:", error);
            alert('Error saving course');
        }
    };

    const addModule = () => {
        const title = prompt("Enter module title:");
        if (title) {
            const newModule = {
                id: Date.now().toString(),
                title,
                lessons: []
            };
            setModules([...modules, newModule]);
        }
    };

    if (loading) return <MainLayout>Loading...</MainLayout>;

    return (
        <MainLayout>
            <div className="mb-6">
                <Link to="/admin" className="text-gray-400 hover:text-white flex items-center space-x-2 mb-4">
                    <ArrowLeft size={16} />
                    <span>Back to Dashboard</span>
                </Link>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{isNew ? 'Create Course' : 'Edit Course'}</h1>
                    <button
                        onClick={handleSave}
                        className="bg-accent hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center space-x-2"
                    >
                        <Save size={20} />
                        <span>Save Course</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-secondary p-6 rounded-lg space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Course Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-primary border border-gray-700 rounded p-2 focus:border-accent focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-primary border border-gray-700 rounded p-2 focus:border-accent focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Modules</h2>
                            <button
                                onClick={addModule}
                                className="text-accent hover:text-blue-400 flex items-center space-x-1"
                            >
                                <Plus size={16} />
                                <span>Add Module</span>
                            </button>
                        </div>

                        {modules.map((module, mIndex) => (
                            <div key={module.id} className="bg-secondary rounded-lg overflow-hidden">
                                <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="font-medium">{module.title}</h3>
                                    <Link
                                        to={!isNew ? `/admin/lesson/${courseId}/${module.id}/new` : '#'}
                                        onClick={isNew ? () => alert('Please save the course first') : undefined}
                                        className="text-sm bg-primary hover:bg-gray-900 px-3 py-1 rounded flex items-center space-x-1"
                                    >
                                        <Plus size={14} />
                                        <span>Add Lesson</span>
                                    </Link>
                                </div>
                                <div className="p-4 space-y-2">
                                    {module.lessons && module.lessons.length > 0 ? (
                                        module.lessons.map((lesson) => (
                                            <Link
                                                key={lesson.id}
                                                to={`/admin/lesson/${courseId}/${module.id}/${lesson.id}`}
                                                className="block p-3 bg-primary/50 hover:bg-primary rounded flex items-center justify-between group"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Video size={16} className="text-gray-500" />
                                                    <span>{lesson.title}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 group-hover:text-accent">Edit</span>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No lessons yet.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default CourseEditor;
