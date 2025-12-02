import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { CheckCircle } from 'lucide-react';

const VideoPlayer = forwardRef(({ videoUrl, onComplete, isCompleted }, ref) => {
    const videoRef = useRef(null);

    useImperativeHandle(ref, () => ({
        jumpToTime: (time) => {
            if (videoRef.current) {
                videoRef.current.currentTime = time;
                videoRef.current.play();
            }
        }
    }));

    return (
        <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="flex justify-between items-center bg-secondary p-4 rounded-lg">
                <div>
                    <h3 className="font-medium text-lg">Lesson Actions</h3>
                    <p className="text-sm text-gray-400">Track your progress</p>
                </div>

                <button
                    onClick={onComplete}
                    disabled={isCompleted}
                    className={`flex items-center space-x-2 px-4 py-2 rounded font-medium transition ${isCompleted
                            ? 'bg-green-500/20 text-green-500 cursor-default'
                            : 'bg-accent hover:bg-blue-600 text-white'
                        }`}
                >
                    <CheckCircle size={20} />
                    <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
                </button>
            </div>
        </div>
    );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
