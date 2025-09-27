

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  videoId: string;
  className?: string;
  isAuthenticated?: boolean;
  onPreviewEnd?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  className,
  isAuthenticated = false,
  onPreviewEnd
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 20, y: 20 });
  const [currentTime, setCurrentTime] = useState(0);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get user email
  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'user@streamflix.com';
    setUserEmail(email);
  }, []);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Watermark animation
  useEffect(() => {
    if (!isAuthenticated) return;

    let animationFrame: number;
    const startTime = Date.now();

    const moveWatermark = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const centerX = 40;
      const centerY = 40;
      const radiusX = 30;
      const radiusY = 25;
      const x = centerX + Math.sin(elapsed * 0.1) * radiusX;
      const y = centerY + Math.cos(elapsed * 0.08) * radiusY;
      setWatermarkPosition({ x, y });
      animationFrame = requestAnimationFrame(moveWatermark);
    };
    moveWatermark();

    return () => cancelAnimationFrame(animationFrame);
  }, [isAuthenticated]);

  // Update currentTime
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isAuthenticated) return;
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isAuthenticated]);

  // Auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth-token');
    if (token) return token;
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    if (authCookie) return authCookie.split('=')[1];
    return null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const token = getAuthToken();

    if (!token && isAuthenticated) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }

    // HLS.js
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: process.env.NODE_ENV === 'development',
        xhrSetup: (xhr, url) => {
          xhr.withCredentials = true;
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('Content-Type', 'application/json');
        },
      });
      hlsRef.current = hls;

      const playlistUrl = `/api/stream/playlist.m3u8?videoId=${videoId}`;
      hls.loadSource(playlistUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setLoading(false);
        setError(null);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          setError('Video playback error.');
          hls.destroy();
        }
        setLoading(false);
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari)
      video.src = `/api/stream/playlist.m3u8?videoId=${videoId}`;
      video.addEventListener('loadedmetadata', () => setLoading(false));
      video.addEventListener('error', () => {
        setError('Failed to load video');
        setLoading(false);
      });
    } else {
      setError('HLS not supported in this browser');
      setLoading(false);
    }

    // 10-sec preview for guests
    if (!isAuthenticated) {
      const handlePreviewEnd = () => {
        if (video.currentTime >= 10) {
          video.pause();
          video.currentTime = 10;
          if (onPreviewEnd) onPreviewEnd();
        }
      };
      video.addEventListener('timeupdate', handlePreviewEnd);
      return () => {
        video.removeEventListener('timeupdate', handlePreviewEnd);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoId, isAuthenticated, onPreviewEnd]);

  // Create watermark element
  const createWatermarkElement = () => {
    const el = document.createElement('div');
    el.style.cssText = `
      position: absolute;
      left: ${watermarkPosition.x}%;
      top: ${watermarkPosition.y}%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 999999;
      user-select: none;
      background: rgba(0,0,0,0.3);
      backdrop-filter: blur(4px);
      color: rgba(255,255,255,0.8);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 500;
      border: 1px solid rgba(255,255,255,0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    el.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span style="opacity:0.8;">${userEmail}</span>
        <span style="opacity:0.8;">${formatTime(currentTime)}</span>
      </div>
    `;
    return el;
  };

  // Fullscreen watermark
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const video = videoRef.current;
    if (!video) return;

    let watermarkEl: HTMLElement | null = null;
    let animFrame: number;

    const updateWatermark = () => {
      if (watermarkEl && isFullscreen) {
        watermarkEl.style.left = `${watermarkPosition.x}%`;
        watermarkEl.style.top = `${watermarkPosition.y}%`;
        watermarkEl.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:2px;">
            <span style="opacity:0.8;">${userEmail}</span>
            <span style="opacity:0.8;">${formatTime(currentTime)}</span>
          </div>
        `;
      }
      animFrame = requestAnimationFrame(updateWatermark);
    };

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (watermarkEl) watermarkEl.remove();
      watermarkEl = null;
      if (isNowFullscreen) {
        watermarkEl = createWatermarkElement();
        video.appendChild(watermarkEl);
        updateWatermark();
      } else {
        if (animFrame) cancelAnimationFrame(animFrame);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      if (watermarkEl) watermarkEl.remove();
      if (animFrame) cancelAnimationFrame(animFrame);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isAuthenticated, loading, watermarkPosition, currentTime, userEmail]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-400 mb-2">⚠️ Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        playsInline
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>

      {/* Watermark overlay (normal mode) */}
      {isAuthenticated && !loading && !isFullscreen && (
        <div
          className="absolute pointer-events-none z-20 select-none"
          style={{
            left: `${watermarkPosition.x}%`,
            top: `${watermarkPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="bg-black/30 backdrop-blur-sm text-white/80 px-3 py-1 rounded-lg text-xs font-medium border border-white/10">
            <div className="flex flex-col space-y-0.5">
              <span className="text-[10px] opacity-80">{userEmail}</span>
              <span className="text-[10px] opacity-80">{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Guest overlay after 10s */}
      {!isAuthenticated && currentTime >= 10 && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-center p-4 z-30">
          <p>Sign in to watch the full video.</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;


