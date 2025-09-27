


import React, { useState } from 'react';
import { Play, Clock, Star, X } from 'lucide-react';
import { VideoPlayerModalProps } from '@/lib/types';
import VideoPlayer from "./VideoPlayer";

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, isAuthenticated, onClose }) => {
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
            {isAuthenticated ? (
              // Only authenticated users see the video
              <VideoPlayer
                videoId={video.id.toString()} 
                className="w-full h-full rounded-lg"
                isAuthenticated={isAuthenticated}
              />
            ) : (
              // Guest view (no play button)
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Login Required</h3>
                <p className="text-gray-300 mb-6">
                  You must log in to watch "{video.title}" and access our premium content.
                </p>
                <button 
                  onClick={onClose}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Login to Watch
                </button>
              </div>
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

export default VideoPlayerModal;
