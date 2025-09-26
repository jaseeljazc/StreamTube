// app/video/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
// import VideoPlayer from '@/components/VideoPlayer';
import VideoPlayer from '@/app/components/VideoPlayer';

export default function VideoPage() {
  const params = useParams();
  const videoId = Number(params.id);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Secure Video {videoId}</h1>
      <VideoPlayer videoId={videoId} autoPlay />
    </div>
  );
}
