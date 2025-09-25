'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import VideoPlayer from '../../components/VideoPlayer';

export default function VideoPage() {
  const params = useParams();
  const videoId = Number(params.id);
  const [playVideo, setPlayVideo] = useState(false);

  const videoData = {
    title: `Demo Video ${videoId}`,
    thumbnail: `/videos/video-${videoId}.png`, // Replace with your thumbnail
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Video Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{videoData.title}</h1>

        {/* Video Thumbnail / Player */}
        <div className="relative w-full rounded-lg overflow-hidden shadow-lg">
          {!playVideo ? (
            <div
              className="relative cursor-pointer"
              onClick={() => setPlayVideo(true)}
            >
              <img
                src={videoData.thumbnail}
                alt={videoData.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white bg-opacity-70 p-4 rounded-full text-3xl font-bold text-gray-800">
                  ▶
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-auto">
              {/* Pass autoPlay prop */}
              <VideoPlayer userId={videoId} autoPlay />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
