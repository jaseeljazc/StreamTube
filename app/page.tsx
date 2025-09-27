


'use client';

import { getRealVideos, initialVideos } from './data/video';
import { Video } from '../lib/types';
import Navigation from './components/Navigation';
import React, { useState, useEffect } from 'react';
import VideoCard from './components/VideoCard';
import VideoPlayerModal from './components/VideoPlayerModel';
import LoginModal from './components/LoginModel';
import { Play, Star, Clock, TrendingUp, Film, Tv } from 'lucide-react';

export default function Home(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [videosLoading, setVideosLoading] = useState<boolean>(true);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  const categories = [
    { id: 'all', name: 'All Content', icon: Film },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'movies', name: 'Movies', icon: Film },
    { id: 'series', name: 'TV Series', icon: Tv }
  ];

  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(video => 
        activeCategory === 'trending' ? video.rating >= 4.5 :
        activeCategory === 'movies' ? video.genre === 'Action' || video.genre === 'Drama' :
        activeCategory === 'series' ? video.genre === 'Comedy' || video.genre === 'Thriller' :
        true
      );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading StreamTube...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <Navigation
        isAuthenticated={isAuthenticated}
        onLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/95 to-purple-950"></div>
        <div className="relative bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  
                  <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                    Your Gateway to
                    <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Premium Content
                    </span>
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                    Experience cinema-quality streaming with our extensive library of movies, 
                    series, and exclusive content. {!isAuthenticated ? 'Join thousands of satisfied viewers.' : 'Welcome back to unlimited entertainment.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {!isAuthenticated ? (
                    <>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Watching
                      </button>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="inline-flex items-center justify-center px-8 py-4 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        Learn More
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-4">
                      
                    </div>
                  )}
                </div>

              </div>

              {/* Right Content - Featured Video Preview */}
              <div className="relative">
                <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                  {videos.length > 0 ? (
                    <div className="relative h-full group cursor-pointer" onClick={() => handleVideoClick(videos[0])}>
                      <img 
                        src={videos[0].thumbnail} 
                        alt={videos[0].title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-xl font-semibold text-white mb-2">{videos[0].title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                            {videos[0].rating}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {videos[0].duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Film className="h-12 w-12 mx-auto mb-2" />
                        <p>Loading preview...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Navigation */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <h2 className="text-2xl font-bold text-white">Browse Content</h2>
              {!isAuthenticated && (
                <div className="hidden sm:flex items-center px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></div>
                  <span className="text-amber-400 text-xs font-medium">Preview Mode</span>
                </div>
              )}
            </div>
       
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg overflow-x-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center px-6 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error State */}
          {videosError && (
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-red-400 font-medium">Error Loading Content</h3>
              </div>
              <p className="text-red-300/80 text-sm mb-4">{videosError}</p>
              <button
                onClick={handleRefreshVideos}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {videosLoading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-700 border-t-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your content...</p>
            </div>
          )}

          {/* Video Grid - Updated for larger, centered cards */}
          {!videosLoading && filteredVideos.length > 0 && (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2  gap-8 max-w-xl">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    isAuthenticated={isAuthenticated}
                    onVideoClick={handleVideoClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!videosLoading && filteredVideos.length === 0 && !videosError && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Film className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Content Found</h3>
              <p className="text-gray-500 mb-6">No videos match the selected category.</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                View All Content
              </button>
            </div>
          )}
        </div>
      </section>

  

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