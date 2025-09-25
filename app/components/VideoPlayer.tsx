// // app/components/VideoPlayer.tsx
// 'use client';

// import { useEffect, useRef, useState } from 'react';

// interface VideoPlayerProps {
//   userId: number;
// }

// export default function VideoPlayer({ userId }: VideoPlayerProps) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [error, setError] = useState<string>('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadVideo();
//   }, [userId]);

//   const loadVideo = async () => {
//     if (!videoRef.current) return;

//     try {
//       // Check if HLS is supported
//       if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
//         // Native HLS support (Safari)
//         videoRef.current.src = '/api/stream/playlist.m3u8';
//         setLoading(false);
//       } else if (typeof window !== 'undefined') {
//         // Use HLS.js for other browsers
//         const { default: Hls } = await import('hls.js');
        
//         if (Hls.isSupported()) {
//           const hls = new Hls({
//             xhrSetup: (xhr, url) => {
//               // Add authentication headers
//               const token = document.cookie
//                 .split('; ')
//                 .find(row => row.startsWith('auth-token='))
//                 ?.split('=')[1];
              
//               if (token) {
//                 xhr.setRequestHeader('Authorization', `Bearer ${token}`);
//               }
//             }
//           });

//           hls.loadSource('/api/stream/playlist.m3u8');
//           hls.attachMedia(videoRef.current);
          
//           hls.on(Hls.Events.MANIFEST_PARSED, () => {
//             setLoading(false);
//           });

//           hls.on(Hls.Events.ERROR, (event, data) => {
//             console.error('HLS Error:', data);
//             setError(`Playback error: ${data.details}`);
//             setLoading(false);
//           });

//           // Cleanup
//           return () => {
//             hls.destroy();
//           };
//         } else {
//           setError('HLS is not supported in this browser');
//           setLoading(false);
//         }
//       }
//     } catch (err) {
//       console.error('Video loading error:', err);
//       setError('Failed to load video player');
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ 
//         textAlign: 'center', 
//         padding: '2rem',
//         backgroundColor: '#f8f9fa',
//         borderRadius: '8px'
//       }}>
//         <div>Loading secure video player...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ 
//         textAlign: 'center', 
//         padding: '2rem',
//         backgroundColor: '#ffebee',
//         borderRadius: '8px',
//         color: '#d32f2f'
//       }}>
//         <div>{error}</div>
//         <button 
//           onClick={loadVideo}
//           style={{
//             marginTop: '1rem',
//             padding: '0.5rem 1rem',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <video
//         ref={videoRef}
//         controls
//         style={{
//           width: '100%',
//           maxWidth: '800px',
//           height: 'auto',
//           borderRadius: '8px'
//         }}
//         poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5OSIFN0cmVhbWluZyBWaWRlbyAo0JXQvdC60YXQuLLQvdC10L7QvVC40L7QvjwvdGV4dD48L3N2Zz4="
//       >
//         Your browser does not support the video tag.
//       </video>
      
//       <div style={{ 
//         marginTop: '1rem', 
//         fontSize: '0.9rem', 
//         color: '#666',
//         backgroundColor: '#f8f9fa',
//         padding: '1rem',
//         borderRadius: '4px'
//       }}>
//         <strong>Note:</strong> This is a demo with a placeholder video. In production, you would:
//         <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
//           <li>Use FFmpeg to create encrypted HLS segments</li>
//           <li>Store video files securely on your server or CDN</li>
//           <li>Implement proper key rotation and management</li>
//         </ul>
//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  userId: number;
  autoPlay?: boolean; // <-- new optional prop
}

export default function VideoPlayer({ userId, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {
        console.warn('Autoplay failed (browser policy)');
      });
    }
  }, [autoPlay]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full rounded-lg shadow-md"
      poster={`/videos/video-${userId}.png`}
    >
      <source src={`/videos/video-${userId}.mp4`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
