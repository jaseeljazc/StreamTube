

import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, Star, User, Search, Menu, X } from 'lucide-react';
import { VideoPlayerModalProps } from '@/lib/types';
import VideoPlayer from "./VideoPlayer"

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, isAuthenticated, onClose }) => {
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewTimeLeft, setPreviewTimeLeft] = useState<number>(10);
  const [previewEnded, setPreviewEnded] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated && showPreview) {
      const timer = setInterval(() => {
        setPreviewTimeLeft(prev => {
          if (prev <= 1) {
            setPreviewEnded(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isAuthenticated, showPreview]);

  const handlePlayClick = (): void => {
    if (!isAuthenticated) {
      setShowPreview(true);
    }
  };

  // Handle when video reaches 10 seconds
  const handlePreviewEnd = (): void => {
    setPreviewEnded(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">{video.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="p-6">
          <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
            {isAuthenticated || showPreview ? (
              <>
                {/* SIMPLE: Just pass isAuthenticated and onPreviewEnd */}
                <VideoPlayer
                  videoId={video.id.toString()} 
                  className="w-full h-full rounded-lg"
                  isAuthenticated={isAuthenticated}
                  onPreviewEnd={handlePreviewEnd}
                />
                
                {/* Preview Timer Overlay */}
                {!isAuthenticated && showPreview && !previewEnded && (
                  <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-20 border border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">Preview: {previewTimeLeft}s remaining</span>
                    </div>
                  </div>
                )}

                {/* Preview Ended Overlay */}
                {!isAuthenticated && previewEnded && (
                  <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
                    <div className="text-center text-white p-8 max-w-md">
                      <div className="mb-6">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Preview Ended</h3>
                        <p className="text-lg text-gray-300 mb-6">
                          Login to continue watching "{video.title}" and access our full library of premium content.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <button 
                          onClick={onClose}
                          className="w-full bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Login to Continue Watching
                        </button>
                        <button 
                          onClick={onClose}
                          className="w-full border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Browse More Videos
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Thumbnail with Play Button */}
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <button
                    onClick={handlePlayClick}
                    className="bg-white text-gray-900 hover:bg-gray-100 rounded-full p-6 shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <Play className="h-12 w-12 text-gray-900 ml-1" fill="currentColor" />
                  </button>
                </div>

                {/* Not Authenticated Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                  <div className="text-center text-white">
                    <p className="text-lg mb-3">
                      🔒 Login to watch the full video
                    </p>
                    <p className="text-sm text-gray-300">
                      Click play for a 10-second preview
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Video Info */}
          <div className="mt-6 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <span>{video.rating}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-300" />
                <span className="text-gray-300">{video.duration}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-sm">{video.genre}</span>
            </div>
            
            <div className="text-gray-300 text-sm">
              {isAuthenticated ? (
                <p>✅ You have full access to this video</p>
              ) : (
                <p>🔒 Login required for full video access</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal