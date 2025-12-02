import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { db, storage } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Save, ArrowLeft, Upload, Clock } from 'lucide-react';

const LessonEditor = () => {
    const { courseId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    const isNew = lessonId === 'new';
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [timestamps, setTimestamps] = useState([]);
    const [duration, setDuration] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!isNew) {
            const fetchLesson = async () => {
                const docRef = doc(db, "courses", courseId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const courseData = docSnap.data();
                    const module = courseData.modules.find(m => m.id === moduleId);
                    const lesson = module?.lessons.find(l => l.id === lessonId);
                    if (lesson) {
                        setTitle(lesson.title);
                        setDescription(lesson.description || '');
                        setVideoUrl(lesson.videoUrl);
                        setTimestamps(lesson.timestamps || []);
                        setDuration(lesson.duration || 0);
                    }
                }
            };
            fetchLesson();
        }
    }, [courseId, moduleId, lessonId, isNew]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const storageRef = ref(storage, `videos/${courseId}/${moduleId}/${Date.now()}_${file.name}`);
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
                setVideoUrl(downloadURL);
                setIsUploading(false);
            }
        );
    };

    const addTimestamp = () => {
        if (videoRef.current) {
            const time = Math.floor(videoRef.current.currentTime);
            const label = prompt("Enter label for this timestamp (e.g., 'Introduction'):");
            if (label) {
                setTimestamps([...timestamps, { time, label }].sort((a, b) => a.time - b.time));
            }
        }
    };

    const removeTimestamp = (index) => {
        setTimestamps(timestamps.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            const docRef = doc(db, "courses", courseId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return;

            const courseData = docSnap.data();
            const modules = courseData.modules || [];
            const moduleIndex = modules.findIndex(m => m.id === moduleId);

            if (moduleIndex === -1) return;

            const newLesson = {
                id: isNew ? Date.now().toString() : lessonId,
                title,
                description,
                videoUrl,
                timestamps,
                duration: duration // Store duration in seconds
            };

            if (isNew) {
                modules[moduleIndex].lessons = [...(modules[moduleIndex].lessons || []), newLesson];
            } else {
                const lessonIndex = modules[moduleIndex].lessons.findIndex(l => l.id === lessonId);
                if (lessonIndex !== -1) {
                    modules[moduleIndex].lessons[lessonIndex] = newLesson;
                }
            }

            // Recalculate course stats
            const modulesCount = modules.length;
            const totalDuration = modules.reduce((acc, module) => {
                return acc + (module.lessons || []).reduce((lAcc, lesson) => {
                    return lAcc + (parseFloat(lesson.duration) || 0);
                }, 0);
            }, 0);

            await setDoc(docRef, {
                modules,
                modulesCount,
                duration: totalDuration,
                updatedAt: new Date()
            }, { merge: true });
            alert('Lesson saved!');
            navigate(`/admin/course/${courseId}`);
        } catch (error) {
            console.error("Error saving lesson:", error);
            alert('Error saving lesson');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <MainLayout>
            <div className="mb-6">
                <Link to={`/admin/course/${courseId}`} className="text-gray-400 hover:text-white flex items-center space-x-2 mb-4">
                    <ArrowLeft size={16} />
                    <span>Back to Course</span>
                </Link>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{isNew ? 'New Lesson' : 'Edit Lesson'}</h1>
                    <button
                        onClick={handleSave}
                        className="bg-accent hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center space-x-2"
                    >
                        <Save size={20} />
                        <span>Save Lesson</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-secondary p-6 rounded-lg space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Lesson Title</label>
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
                                rows={3}
                                className="w-full bg-primary border border-gray-700 rounded p-2 focus:border-accent focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-secondary p-6 rounded-lg">
                        <h3 className="font-bold mb-4">Video Source</h3>

                        {!videoUrl ? (
                            <div
                                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-accent cursor-pointer transition"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={48} className="mx-auto text-gray-500 mb-2" />
                                <p className="text-gray-400">Click to upload video</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="video/*"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    controls
                                    className="w-full rounded bg-black"
                                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                                />
                                <button
                                    onClick={() => setVideoUrl('')}
                                    className="text-sm text-red-400 hover:text-red-300"
                                >
                                    Remove Video
                                </button>
                            </div>
                        )}

                        {isUploading && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Uploading...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-accent h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-secondary p-6 rounded-lg h-fit">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Timestamps</h3>
                        <button
                            onClick={addTimestamp}
                            disabled={!videoUrl}
                            className="text-sm bg-primary hover:bg-gray-900 px-3 py-1 rounded flex items-center space-x-1 disabled:opacity-50"
                        >
                            <Clock size={14} />
                            <span>Add Current Time</span>
                        </button>
                    </div>

                    <div className="space-y-2">
                        {timestamps.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No timestamps added.</p>
                        ) : (
                            timestamps.map((ts, index) => (
                                <div key={index} className="flex justify-between items-center bg-primary p-2 rounded">
                                    <div className="flex items-center space-x-3">
                                        <span className="font-mono text-accent text-sm">{formatTime(ts.time)}</span>
                                        <span>{ts.label}</span>
                                    </div>
                                    <button
                                        onClick={() => removeTimestamp(index)}
                                        className="text-gray-500 hover:text-red-400"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default LessonEditor;
