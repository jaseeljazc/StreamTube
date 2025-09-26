// // app/page.tsx - Main page with auth flow
// 'use client';

// import React, { useState, useEffect } from 'react';
// import VideoPlayer from '../app/components/VideoPlayer';
// import LoginForm from '../app/components/LoginForm';

// export default function Home() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check if user is already logged in
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       // Verify token is still valid
//       fetch('/api/stream/playlist.m3u8?videoId=1', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       })
//       .then(response => {
//         if (response.ok) {
//           setIsAuthenticated(true);
//         } else {
//           localStorage.removeItem('authToken');
//         }
//       })
//       .catch(() => {
//         localStorage.removeItem('authToken');
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const handleLogin = (token: string) => {
//     setIsAuthenticated(true);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('authToken');
//     document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     setIsAuthenticated(false);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="container mx-auto px-4 py-8">
//         {isAuthenticated ? (
//           <div>
//             <div className="flex justify-between items-center mb-8">
//               <h1 className="text-3xl font-bold">Secure Video Streaming</h1>
//               <button
//                 onClick={handleLogout}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//               >
//                 Logout
//               </button>
//             </div>
            
//             <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//               <VideoPlayer videoId="1" className="w-full h-96" />
//             </div>
//           </div>
//         ) : (
//           <div>
//             <h1 className="text-3xl font-bold text-center mb-8">Secure Video Streaming</h1>
//             <LoginForm onLogin={handleLogin} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// app/page.tsx - Enhanced Home Page
'use client';

import React, { useState, useEffect } from 'react';
import VideoPlayer from '../app/components/VideoPlayer';
import LoginForm from '../app/components/LoginForm';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/stream/playlist.m3u8?videoId=1', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(response => {
          if (response.ok) setIsAuthenticated(true);
          else localStorage.removeItem('authToken');
        })
        .catch(() => localStorage.removeItem('authToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token: string) => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-850 to-gray-900 text-white">
      {/* Header & Branding */}
      <header className="w-full py-6 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-600 shadow-xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-10 w-10 animate-pulse" />
            <span className="text-4xl font-bold tracking-wide">Streamify</span>
          </div>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow transition"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {isAuthenticated ? (
          <div>
            {/* Welcome + Featured */}
            <section className="mb-8">
              <h2 className="text-3xl font-extrabold mb-2">Welcome to Streamify 🎬</h2>
              <p className="mb-6 text-lg text-gray-300">Experience secure, high-definition streaming.</p>
              <div className="bg-gray-950/80 rounded-lg shadow-lg overflow-hidden flex flex-col items-center">
                <VideoPlayer videoId="1" className="w-full h-96" />
              </div>
            </section>

            {/* Recommendations */}
            <section className="mt-12">
              <h3 className="text-2xl font-semibold mb-4">Featured Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded hover:scale-105 transition shadow-lg p-4">
                  <img src="/thumbnails/video2.jpg" className="w-full h-48 object-cover rounded" alt="Video 2" />
                  <h4 className="mt-2 text-lg font-bold">Nature Wonders</h4>
                  <p className="text-sm text-gray-400">HD documentary journeys through Earth's beauty.</p>
                </div>
                <div className="bg-gray-900 rounded hover:scale-105 transition shadow-lg p-4">
                  <img src="/thumbnails/video3.jpg" className="w-full h-48 object-cover rounded" alt="Video 3" />
                  <h4 className="mt-2 text-lg font-bold">Science Unplugged</h4>
                  <p className="text-sm text-gray-400">Explore fascinating science facts and experiments.</p>
                </div>
                <div className="bg-gray-900 rounded hover:scale-105 transition shadow-lg p-4">
                  <img src="/thumbnails/video4.jpg" className="w-full h-48 object-cover rounded" alt="Video 4" />
                  <h4 className="mt-2 text-lg font-bold">Blockbuster Movie</h4>
                  <p className="text-sm text-gray-400">Enjoy the latest hit, streaming securely.</p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div>
            {/* Hero Section Unauthenticated */}
            <div className="flex flex-col items-center mt-16">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6 text-center">
                Welcome to Streamify
              </h1>
              <p className="text-lg text-gray-300 mb-10 text-center max-w-2xl">
                Stream your favorite content securely, with lightning-fast HD playback. Login to unlock personalized recommendations and exclusive videos.
              </p>
            </div>

            {/* Features Section */}
            <section className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-2">🔒</span>
                  <h3 className="text-xl font-bold">AES-128 HLS Encryption</h3>
                  <p className="text-gray-400">Industry-grade video protection for peace of mind.</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-2">⚡</span>
                  <h3 className="text-xl font-bold">Ultra HD & Fast Playback</h3>
                  <p className="text-gray-400">Enjoy seamless adaptive streaming anywhere, anytime.</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-2">🌎</span>
                  <h3 className="text-xl font-bold">Global Access</h3>
                  <p className="text-gray-400">Stream from every device, wherever you are.</p>
                </div>
              </div>
            </section>

            {/* Login Section */}
            <div className="bg-white/5 rounded-lg shadow-lg p-8 mx-auto max-w-lg">
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 mt-12 bg-gradient-to-r from-purple-800 via-blue-700 to-gray-800 shadow-inner">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <span className="text-gray-400">© {new Date().getFullYear()} Streamify. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
