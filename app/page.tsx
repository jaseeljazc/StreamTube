'use client';

import { getRealVideos, initialVideos } from './data/video';
import { Video } from '../lib/types';
import Navigation from './components/Navigation';
import React, { useState, useEffect } from 'react';
import VideoCard from './components/VideoCard';
import VideoPlayerModal from './components/VideoPlayerModel';
import LoginModal from './components/LoginModel';

export default function Home(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [videosLoading, setVideosLoading] = useState<boolean>(true);
  const [videosError, setVideosError] = useState<string | null>(null);

  // Load video metadata
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setVideosLoading(true);
        setVideosError(null);
        const videoData = await getRealVideos();
        setVideos(videoData);
      } catch (error) {
        setVideosError(error instanceof Error ? error.message : 'Failed to load videos');
      } finally {
        setVideosLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/stream/playlist.m3u8?videoId=1', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authToken');
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token: string): void => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('authToken');
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuthenticated(false);
  };

  const handleVideoClick = (video: Video): void => setSelectedVideo(video);
  const handleCloseVideo = (): void => setSelectedVideo(null);

  const handleRefreshVideos = async () => {
    try {
      setVideosLoading(true);
      setVideosError(null);
      const videoData = await getRealVideos();
      setVideos(videoData);
    } catch (error) {
      setVideosError(error instanceof Error ? error.message : 'Failed to refresh videos');
    } finally {
      setVideosLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <Navigation
        isAuthenticated={isAuthenticated}
        onLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-red-600 to-purple-700 flex items-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to StreamFlix</h1>
          <p className="text-xl mb-8 max-w-2xl">
            Discover amazing movies and TV shows.{' '}
            {!isAuthenticated
              ? 'Login to unlock full access to our premium content.'
              : 'Enjoy unlimited streaming!'}
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Get Started
            </button>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Featured Videos</h2>
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <div className="text-yellow-400 text-sm">
                • Preview mode - Login for full access
              </div>
            )}
            <button
              onClick={handleRefreshVideos}
              disabled={videosLoading}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {videosLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {videosError && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">
            <p>Error loading videos: {videosError}</p>
            <button
              onClick={handleRefreshVideos}
              className="mt-2 bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {videosLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading video metadata...</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isAuthenticated={isAuthenticated}
              onVideoClick={handleVideoClick}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          isAuthenticated={isAuthenticated}
          onClose={handleCloseVideo}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
