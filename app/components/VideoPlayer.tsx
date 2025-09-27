


// import React, { useEffect, useRef, useState } from 'react';
// import Hls from 'hls.js';

// interface VideoPlayerProps {
//   videoId: string;
//   className?: string;
// }

// const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, className }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const hlsRef = useRef<Hls | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Function to get auth token (adjust based on your auth implementation)
//   const getAuthToken = () => {
//     // Option 1: From localStorage
//     const token = localStorage.getItem('authToken') || localStorage.getItem('auth-token');
//     if (token) return token;

//     // Option 2: From cookies
//     const cookies = document.cookie.split(';');
//     const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
//     if (authCookie) {
//       return authCookie.split('=')[1];
//     }

//     return null;
//   };

//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const token = getAuthToken();
//     if (!token) {
//       setError('Authentication required. Please log in.');
//       setLoading(false);
//       return;
//     }

//     if (Hls.isSupported()) {
//       const hls = new Hls({
//         debug: process.env.NODE_ENV === 'development',
//         xhrSetup: function(xhr, url) {
//           console.log('Setting up XHR for:', url);
          
//           // Always send credentials (cookies)
//           xhr.withCredentials = true;
          
//           // Send Authorization header
//           xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          
//           // Additional headers if needed
//           xhr.setRequestHeader('Content-Type', 'application/json');
//         },
//         // Retry configuration
//         manifestLoadingTimeOut: 10000,
//         manifestLoadingMaxRetry: 2,
//         levelLoadingTimeOut: 10000,
//         levelLoadingMaxRetry: 2,
//         fragLoadingTimeOut: 20000,
//         fragLoadingMaxRetry: 3,
//       });

//       hlsRef.current = hls;

//       // Error handling
//       hls.on(Hls.Events.ERROR, (event, data) => {
//         console.error('HLS.js error details:', {
//           type: data.type,
//           details: data.details,
//           fatal: data.fatal,
//           url: data.url,
//           response: data.response,
//           networkDetails: data.networkDetails,
//           error: data.error
//         });
        
//         if (data.fatal) {
//           switch (data.type) {
//             case Hls.ErrorTypes.NETWORK_ERROR:
//               if (data.response?.code === 401) {
//                 setError('Authentication failed. Please log in again.');
//               } else if (data.response?.code === 404) {
//                 setError(`Resource not found: ${data.url}`);
//               } else {
//                 setError(`Network error (${data.response?.code || 'unknown'}): ${data.details}`);
//               }
//               break;
//             case Hls.ErrorTypes.MEDIA_ERROR:
//               console.log('Attempting to recover from media error');
//               setError('Media error occurred, attempting recovery...');
//               hls.recoverMediaError();
//               return; // Don't set loading to false yet
//             default:
//               setError(`Fatal error (${data.type}): ${data.details}`);
//               hls.destroy();
//               break;
//           }
//         } else {
//           console.warn('Non-fatal HLS error:', data.details);
//         }
//         setLoading(false);
//       });

//       // Success events
//       hls.on(Hls.Events.MANIFEST_LOADED, () => {
//         console.log('Manifest loaded successfully');
//         setLoading(false);
//         setError(null);
//       });

//       hls.on(Hls.Events.LEVEL_LOADED, () => {
//         console.log('Level loaded');
//       });

//       // Load the playlist
//       const playlistUrl = `/api/stream/playlist.m3u8?videoId=${videoId}`;
//       console.log('Loading playlist:', playlistUrl);
      
//       // Test playlist accessibility first
//       fetch(playlistUrl, {
//         credentials: 'include',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         }
//       })
//       .then(response => {
//         console.log('Playlist response status:', response.status);
//         return response.text();
//       })
//       .then(text => {
//         console.log('Playlist content preview:', text.substring(0, 200));
//       })
//       .catch(err => {
//         console.error('Playlist test failed:', err);
//       });
      
//       hls.loadSource(playlistUrl);
//       hls.attachMedia(video);

//       // Auto-play when ready
//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         console.log('Manifest parsed, ready to play');
//         video.play().catch(e => {
//           console.log('Autoplay prevented:', e);
//           // Autoplay was prevented, user needs to interact first
//         });
//       });

//     } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
//       // Native HLS support (Safari)
//       const playlistUrl = `/api/stream/playlist.m3u8?videoId=${videoId}`;
      
//       // For Safari, we need to handle auth differently
//       fetch(playlistUrl, {
//         credentials: 'include',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         }
//       })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP ${response.status}`);
//         }
//         return response.blob();
//       })
//       .then(blob => {
//         const url = URL.createObjectURL(blob);
//         video.src = url;
//         video.addEventListener('loadedmetadata', () => {
//           setLoading(false);
//           setError(null);
//         });
//         video.addEventListener('error', () => {
//           setError('Error loading video');
//           setLoading(false);
//         });
//       })
//       .catch(err => {
//         console.error('Error loading video:', err);
//         setError('Failed to load video');
//         setLoading(false);
//       });

//     } else {
//       setError('HLS is not supported in this browser');
//       setLoading(false);
//     }

//     // Cleanup
//     return () => {
//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }
//     };
//   }, [videoId]);

//   if (error) {
//     return (
//       <div className={`flex items-center justify-center bg-gray-900 text-white p-8 ${className}`}>
//         <div className="text-center">
//           <p className="text-red-400 mb-2">⚠️ Error</p>
//           <p>{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`relative ${className}`}>
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
//             <p>Loading video...</p>
//           </div>
//         </div>
//       )}
//       <video
//         ref={videoRef}
//         controls
//         className="w-full h-full"
//         playsInline
//         preload="metadata"
//       >
//         Your browser does not support the video tag.
//       </video>
//     </div>
//   );
// };

// export default VideoPlayer;



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

  // Function to get auth token (adjust based on your auth implementation)
  const getAuthToken = () => {
    // Option 1: From localStorage
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth-token');
    if (token) return token;

    // Option 2: From cookies
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    if (authCookie) {
      return authCookie.split('=')[1];
    }

    return null;
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
          
          // Always send credentials (cookies)
          xhr.withCredentials = true;
          
          // Send Authorization header if available
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
          
          // Additional headers if needed
          xhr.setRequestHeader('Content-Type', 'application/json');
        },
        // Retry configuration
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
              return; // Don't set loading to false yet
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
          // Autoplay was prevented, user needs to interact first
        });
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      const playlistUrl = `/api/stream/playlist.m3u8?videoId=${videoId}`;
      
      // For Safari, we need to handle auth differently
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

    // SIMPLE 10-SECOND RESTRICTION FOR NON-AUTHENTICATED USERS
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
    </div>
  );
};

export default VideoPlayer;