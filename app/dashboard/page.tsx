// // app/dashboard/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import VideoPlayer from '../components/VideoPlayer';

// export default function DashboardPage() {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchUser();
//   }, []);

// const fetchUser = async () => {
//   try {
//     const response = await fetch('/api/auth/me', {
//       method: 'GET',
//       headers: {
//         // Optional: send token manually if needed
//         // 'Authorization': `Bearer ${getCookie('auth-token')}`
//       },
//       credentials: 'include', // <--- important to send cookies
//     });

//     if (response.ok) {
//       const userData = await response.json();
//       setUser(userData);
//     } else {
//       console.error('Auth failed', response.status);
//     }
//   } catch (error) {
//     console.error('Failed to fetch user:', error);
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleLogout = () => {
//     document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//     window.location.href = '/login';
//   };

//   if (loading) {
//     return <div className="p-8 text-center">Loading...</div>;
//   }

//   if (!user) {
//     window.location.href = '/login';
//     return null;
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-8">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
//         <h1 className="text-2xl font-bold ">Secure Video Dashboard</h1>
//         <div className="flex items-center">
//           <span className="mr-4">Welcome, {user.email}</span>
//           <button
//             onClick={handleLogout}
//             className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Security Features */}
//       <div className="bg-gray-100 p-6 rounded-lg mb-8">
//         <h3 className="text-lg font-semibold mb-2">🔐 Security Features</h3>
//         <ul className="list-disc list-inside space-y-1 text-gray-700">
//           <li>AES-128 HLS Encryption</li>
//           <li>Signed Key URLs with JWT</li>
//           <li>Time-based Key Expiry</li>
//           <li>User Authentication Required</li>
//           <li>Secure Key Delivery</li>
//         </ul>
//       </div>

//       {/* Protected Video */}
//       <div className="bg-white p-8 rounded-lg shadow">
//         <h2 className="text-xl font-semibold mb-4 text-black
//         ">Protected Video Content</h2>
//         <VideoPlayer userId={user.id} />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "../components/VideoPlayer";

interface Video {
  id: number;
  title: string;
  thumbnail: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sample video list (replace with real data)
  const videos: Video[] = [
    { id: 1, title: "Demo Video 1", thumbnail: "/videos/video-1.png" },
    { id: 2, title: "Demo Video 2", thumbnail: "/videos/video-2.png" },
    { id: 3, title: "Demo Video 3", thumbnail: "/videos/video-3.png" },
    { id: 4, title: "Demo Video 4", thumbnail: "/videos/video-4.png" },
  ];

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error("Auth failed", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie =
      "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/login";
  };

  if (loading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-md py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-bold text-white">SecureStream</div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300 font-medium">Hi, {user.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Video Cards Grid */}
      <main className="max-w-7xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-white mb-6">
          Recommended Videos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="cursor-pointer group rounded-lg overflow-hidden shadow-lg bg-gray-800 hover:shadow-2xl transition"
              onClick={() => router.push(`/video/${video.id}`)}
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transform transition"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gray-900 bg-opacity-70 p-3 rounded-full shadow-lg group-hover:bg-opacity-90 text-2xl font-bold text-white">
                    ▶
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-100">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
