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

  // Get user email (you can modify this based on your auth system)
  useEffect(() => {
    // This could come from your auth context, localStorage, or API
    const email = localStorage.getItem('userEmail') || 'user@streamflix.com';
    setUserEmail(email);
  }, []);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Continuously moving watermark effect
  useEffect(() => {
    if (!isAuthenticated) return;

    let animationFrame: number;
    let startTime = Date.now();

    const moveWatermark = () => {
      const elapsed = (Date.now() - startTime) / 1000; // Time in seconds
      
      // Create smooth circular/orbital movement
      const centerX = 40; // Center at 40% of width
      const centerY = 40; // Center at 40% of height
      const radiusX = 30; // Horizontal movement range
      const radiusY = 25; // Vertical movement range
      
      // Use sine and cosine for smooth circular motion
      const x = centerX + Math.sin(elapsed * 0.1) * radiusX; // Slow horizontal movement
      const y = centerY + Math.cos(elapsed * 0.08) * radiusY; // Slightly different speed for vertical
      
      setWatermarkPosition({ x, y });
      
      animationFrame = requestAnimationFrame(moveWatermark);
    };

    moveWatermark();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isAuthenticated]);

  // Update current time for watermark
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isAuthenticated) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isAuthenticated]);

  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth-token');
    if (token) return token;

    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    if (authCookie) {
      return authCookie.split('=')[1];
    }

    return null;
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const token = getAuthToken();
    
    // Only require token for authenticated users
    if (!token && isAuthenticated) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: process.env.NODE_ENV === 'development',
        xhrSetup: function(xhr, url) {
          console.log('Setting up XHR for:', url);
          
          xhr.withCredentials = true;
          
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
          
          xhr.setRequestHeader('Content-Type', 'application/json');
        },
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 2,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 3,
      });

      hlsRef.current = hls;

      // Error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS.js error details:', {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          url: data.url,
          response: data.response,
          networkDetails: data.networkDetails,
          error: data.error
        });
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (data.response?.code === 401) {
                setError('Authentication failed. Please log in again.');
              } else if (data.response?.code === 404) {
                setError(`Resource not found: ${data.url}`);
              } else {
                setError(`Network error (${data.response?.code || 'unknown'}): ${data.details}`);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Attempting to recover from media error');
              setError('Media error occurred, attempting recovery...');
              hls.recoverMediaError();
              return;
            default:
              setError(`Fatal error (${data.type}): ${data.details}`);
              hls.destroy();
              break;
          }
        } else {
          console.warn('Non-fatal HLS error:', data.details);
        }
        setLoading(false);
      });

      // Success events
      hls.on(Hls.Events.MANIFEST_LOADED, () => {
        console.log('Manifest loaded successfully');
        setLoading(false);
        setError(null);
      });

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        console.log('Level loaded');
      });

      // Load the playlist
      const playlistUrl = `/api/stream/playlist.m3u8?videoId=${videoId}`;
      console.log('Loading playlist:', playlistUrl);
      
      // Test playlist accessibility first
      fetch(playlistUrl, {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {}
      })
      .then(response => {
        console.log('Playlist response status:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Playlist content preview:', text.substring(0, 200));
      })
      .catch(err => {
        console.error('Playlist test failed:', err);
      });
      
      hls.loadSource(playlistUrl);
      hls.attachMedia(video);

      // Auto-play when ready
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('Manifest parsed, ready to play');
        video.play().catch(e => {
          console.log('Autoplay prevented:', e);
        });
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      const playlistUrl = `/api/stream/playlist.m3u8?videoId=${videoId}`;
      
      fetch(playlistUrl, {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {}
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          setLoading(false);
          setError(null);
        });
        video.addEventListener('error', () => {
          setError('Error loading video');
          setLoading(false);
        });
      })
      .catch(err => {
        console.error('Error loading video:', err);
        setError('Failed to load video');
        setLoading(false);
      });

    } else {
      setError('HLS is not supported in this browser');
      setLoading(false);
    }

    // 10-second restriction for non-authenticated users
    const handleTimeUpdate = () => {
      if (!isAuthenticated && video.currentTime >= 10) {
        video.pause();
        if (onPreviewEnd) {
          onPreviewEnd();
        }
      }
    };

    if (!isAuthenticated) {
      video.addEventListener('timeupdate', handleTimeUpdate);
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video && !isAuthenticated) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [videoId, isAuthenticated]);

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

  // Create watermark element that can be appended to fullscreen video
  const createWatermarkElement = () => {
    const watermark = document.createElement('div');
    watermark.id = 'video-watermark';
    watermark.style.cssText = `
      position: absolute;
      left: ${watermarkPosition.x}%;
      top: ${watermarkPosition.y}%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 999999;
      user-select: none;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
      color: rgba(255, 255, 255, 0.8);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    watermark.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span style="opacity: 0.8;">${userEmail}</span>
        <span style="opacity: 0.8;">${formatTime(currentTime)}</span>
      </div>
    `;
    
    return watermark;
  };

  // Handle fullscreen watermark injection
  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const video = videoRef.current;
    if (!video) return;

    let watermarkElement: HTMLElement | null = null;
    let animationFrame: number;

    const updateWatermark = () => {
      if (watermarkElement && isFullscreen) {
        watermarkElement.style.left = `${watermarkPosition.x}%`;
        watermarkElement.style.top = `${watermarkPosition.y}%`;
        watermarkElement.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="opacity: 0.8;">${userEmail}</span>
            <span style="opacity: 0.8;">${formatTime(currentTime)}</span>
          </div>
        `;
      }
      animationFrame = requestAnimationFrame(updateWatermark);
    };

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      // Remove existing watermark
      if (watermarkElement) {
        watermarkElement.remove();
        watermarkElement = null;
      }

      if (isNowFullscreen) {
        // Add watermark to fullscreen video
        watermarkElement = createWatermarkElement();
        video.appendChild(watermarkElement);
        updateWatermark();
      } else {
        // Cancel animation when exiting fullscreen
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      if (watermarkElement) {
        watermarkElement.remove();
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isAuthenticated, loading, watermarkPosition, currentTime, userEmail]);

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

      {/* Watermark Overlay - Only for normal mode */}
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

      {/* Anti-tampering overlay (invisible but detectable) */}
      {isAuthenticated && !loading && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, transparent 10px, transparent 20px),
              radial-gradient(circle at 80% 70%, transparent 10px, transparent 20px)
            `,
            opacity: 0.01 // Almost invisible but detectable
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;


