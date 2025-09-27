


// // data/video.ts - Dynamic video data that fetches real metadata

// import { Video } from '../../lib/types';
// import { getVideos } from '../../lib/videoScanner';

// // Cache for video data to avoid repeated file system scans
// let cachedVideos: Video[] | null = null;
// let lastScanTime = 0;
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// // Function to get videos with caching
// export async function getRealVideos(): Promise<Video[]> {
//   const now = Date.now();
  
//   // Return cached data if it's still fresh
//   if (cachedVideos && (now - lastScanTime) < CACHE_DURATION) {
//     return cachedVideos;
//   }
  
//   try {
//     // Scan filesystem for video metadata
//     const scannedVideos = await getVideos();
    
//     // Update cache
//     cachedVideos = scannedVideos;
//     lastScanTime = now;
    
//     console.log(`Scanned ${scannedVideos.length} videos from filesystem`);
//     return scannedVideos;
    
//   } catch (error) {
//     console.error('Error scanning videos:', error);
    
//     // Return cached data if available, otherwise return fallback
//     if (cachedVideos) {
//       return cachedVideos;
//     }
    
//     // Fallback to basic structure if scanning fails
//     return getFallbackVideos();
//   }
// }

// // Fallback videos in case scanning fails
// function getFallbackVideos(): Video[] {
//   return [
//     {
//       id: 1,
//       title: "Video 1",
//       duration: "Loading...",
//       thumbnail: "/videos/video-1.png",
//       rating: 0,
//       genre: "Unknown",
//       description: "Video metadata loading...",
//       uploadDate: new Date().toISOString().split('T')[0]
//     },
//     {
//       id: 2,
//       title: "Video 2", 
//       duration: "Loading...",
//       thumbnail: "/videos/video-2.png",
//       rating: 0,
//       genre: "Unknown",
//       description: "Video metadata loading...",
//       uploadDate: new Date().toISOString().split('T')[0]
//     }
//   ];
// }

// // For immediate use (synchronous) - returns cached data or fallback
// export const realVideos: Video[] = getFallbackVideos();

// // Function to refresh video data
// export async function refreshVideoData(): Promise<Video[]> {
//   cachedVideos = null; // Clear cache
//   return await getRealVideos();
// }

// data/video.ts - Client-side video data fetching (FIXED)

import { Video } from '../../lib/types';

// Cache for video data
let cachedVideos: Video[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to fetch videos from API
export async function getRealVideos(): Promise<Video[]> {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (cachedVideos && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('Returning cached video data');
    return cachedVideos;
  }
  
  try {
    console.log('Fetching video metadata from API...');
    const response = await fetch('/api/videos/metadata');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data); // Debug log
    
    if (data.success && data.videos && Array.isArray(data.videos)) {
      cachedVideos = data.videos;
      lastFetchTime = now;
      console.log(`✅ Loaded ${data.videos.length} videos from API`);
      
      // Log each video's duration for debugging
      data.videos.forEach((video: Video, index: number) => {
        console.log(`Video ${index + 1}: ${video.title} - Duration: ${video.duration}`);
      });
      
      return data.videos;
    } else {
      console.error('❌ API returned invalid data structure:', data);
      throw new Error(data.error || 'Invalid API response structure');
    }
    
  } catch (error) {
    console.error('❌ Error fetching video data:', error);
    
    // Return cached data if available
    if (cachedVideos) {
      console.log('⚠️ Using cached data due to fetch error');
      return cachedVideos;
    }
    
    // Return fallback data if no cache available
    console.log('⚠️ Using fallback data due to API error');
    return getFallbackVideos();
  }
}

// Fallback videos in case API fails (improved with loading states)
function getFallbackVideos(): Video[] {
  console.log('📋 Using fallback video data');
  return [
    {
      id: 1,
      title: "Video 1",
      duration: "Loading...", // Changed from "Unknown" to "Loading..."
      thumbnail: "/videos/video-1.png",
      rating: 0,
      genre: "Video",
      description: "Video metadata loading...",
      uploadDate: new Date().toISOString().split('T')[0]
    },
    {
      id: 2,
      title: "Video 2", 
      duration: "Loading...", // Changed from "Unknown" to "Loading..."
      thumbnail: "/videos/video-2.png",
      rating: 0,
      genre: "Video",
      description: "Video metadata loading...",
      uploadDate: new Date().toISOString().split('T')[0]
    }
  ];
}

// Function to refresh video data (clears cache)
export async function refreshVideoData(): Promise<Video[]> {
  console.log('🔄 Refreshing video data...');
  cachedVideos = null;
  lastFetchTime = 0;
  return await getRealVideos();
}

// IMPORTANT: Don't export fallback data immediately
// Instead, export a function that tries to get real data first
export async function getVideos(): Promise<Video[]> {
  try {
    return await getRealVideos();
  } catch (error) {
    console.error('Failed to get videos:', error);
    return getFallbackVideos();
  }
}

// For components that need immediate data (will show "Loading..." then update)
export const initialVideos: Video[] = getFallbackVideos();