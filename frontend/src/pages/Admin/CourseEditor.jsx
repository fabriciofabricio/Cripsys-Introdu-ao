import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { db, storage } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Save, Plus, ArrowLeft, Video, Upload, Image as ImageIcon } from 'lucide-react';

const CourseEditor = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const isNew = courseId === 'new';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(!isNew);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        if (!isNew) {
            const fetchCourse = async () => {
                const docRef = doc(db, "courses", courseId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    setDescription(data.description);
                    setThumbnail(data.thumbnail || '');
                    setModules(data.modules || []);
                }
                setLoading(false);
            };
            fetchCourse();
        }
    }, [courseId, isNew]);

    const handleThumbnailUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const storageRef = ref(storage, `thumbnails/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                setIsUploading(false);
                alert("Upload failed");
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setThumbnail(downloadURL);
                setIsUploading(false);
            }
        );
    };

    const handleSave = async () => {
        try {
            const id = isNew ? title.toLowerCase().replace(/\s+/g, '-') : courseId;

            // Calculate stats
            const modulesCount = modules.length;
            const totalDuration = modules.reduce((acc, module) => {
                return acc + (module.lessons || []).reduce((lAcc, lesson) => {
                    return lAcc + (parseFloat(lesson.duration) || 0);
                }, 0);
            }, 0);

            const courseData = {
                title,
                description,
                thumbnail,
                modules,
                modulesCount,
                duration: totalDuration, // Store total seconds
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
                    <div className="bg-secondary p-6 rounded-lg space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Thumbnail</label>
                            {!thumbnail ? (
                                <div
                                    className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-accent cursor-pointer transition"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageIcon size={32} className="mx-auto text-gray-500 mb-2" />
                                    <p className="text-gray-400 text-sm">Click to upload thumbnail</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleThumbnailUpload}
                                    />
                                </div>
                            ) : (
                                <div className="relative group">
                                    <img src={thumbnail} alt="Thumbnail" className="w-full h-48 object-cover rounded-lg" />
                                    <button
                                        onClick={() => setThumbnail('')}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                            {isUploading && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                                        <div
                                            className="bg-accent h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
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
