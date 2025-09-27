// lib/videoScanner.ts - Dynamic video metadata extraction


"use server";
import fs from 'fs';
import path from 'path';
import { Video } from './types';

interface VideoMetadata {
  duration: number; // in seconds
  title: string;
  fileSize: number; // in bytes
}

// Function to parse M3U8 playlist and extract total duration
function parseM3U8Duration(m3u8Content: string): number {
  const lines = m3u8Content.split('\n');
  let totalDuration = 0;
  
  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      // Extract duration from #EXTINF:10.0, format
      const durationMatch = line.match(/#EXTINF:([0-9.]+)/);
      if (durationMatch) {
        totalDuration += parseFloat(durationMatch[1]);
      }
    }
  }
  
  return Math.round(totalDuration);
}

// Function to format seconds to readable duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
  } else {
    return `${remainingSeconds}s`;
  }
}

// Function to extract title from filename
function extractTitle(filename: string): string {
  return filename
    .replace(/\.(mp4|avi|mkv|mov)$/i, '') // Remove video extensions
    .replace(/video-(\d+)/i, 'Video $1') // Convert "video-1" to "Video 1"
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/-/g, ' ') // Replace dashes with spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
}

// Function to get video metadata from filesystem
async function getVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  const videosDir = path.join(process.cwd(), 'public', 'videos');
  const videoDir = path.join(videosDir, `video-${videoId}`);
  const playlistPath = path.join(videoDir, 'output.m3u8');
  const mp4Path = path.join(videosDir, `video-${videoId}.mp4`);
  
  try {
    let duration = 0;
    let fileSize = 0;
    let title = `Video ${videoId}`;
    
    // Try to get duration from M3U8 playlist
    if (fs.existsSync(playlistPath)) {
      const playlistContent = fs.readFileSync(playlistPath, 'utf8');
      duration = parseM3U8Duration(playlistContent);
    }
    
    // Try to get file info from MP4
    if (fs.existsSync(mp4Path)) {
      const stats = fs.statSync(mp4Path);
      fileSize = stats.size;
      
      // Extract title from filename
      const filename = path.basename(mp4Path);
      title = extractTitle(filename);
    }
    
    return {
      duration,
      title,
      fileSize
    };
    
  } catch (error) {
    console.error(`Error reading video metadata for video-${videoId}:`, error);
    return null;
  }
}

// Function to scan all videos and generate dynamic video data
export async function scanAndGenerateVideos(): Promise<Video[]> {
  const videosDir = path.join(process.cwd(), 'public', 'videos');
  const videos: Video[] = [];
  
  try {
    if (!fs.existsSync(videosDir)) {
      console.error('Videos directory does not exist:', videosDir);
      return [];
    }
    
    // Find all video directories (video-1, video-2, etc.)
    const items = fs.readdirSync(videosDir, { withFileTypes: true });
    const videoFolders = items
      .filter(item => item.isDirectory() && item.name.match(/^video-\d+$/))
      .map(item => item.name)
      .sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
        return aNum - bNum;
      });
    
    console.log('Found video folders:', videoFolders);
    
    // Generate video data for each folder
    for (const folderName of videoFolders) {
      const videoId = folderName.replace('video-', '');
      const metadata = await getVideoMetadata(videoId);
      
      if (metadata) {
        const video: Video = {
          id: parseInt(videoId),
          title: metadata.title,
          duration: formatDuration(metadata.duration),
          thumbnail: `/videos/video-${videoId}.png`, // Assuming PNG thumbnails
          rating: 8.0, // Default rating - you can customize this
          genre: 'Unknown', // Default genre - you can customize this
          description: `${metadata.title} - Duration: ${formatDuration(metadata.duration)}`,
          uploadDate: new Date().toISOString().split('T')[0] // Current date as default
        };
        
        videos.push(video);
      }
    }
    
    return videos;
    
  } catch (error) {
    console.error('Error scanning videos directory:', error);
    return [];
  }
}

// Export a function to get videos (can be used in API routes or components)
export async function getVideos(): Promise<Video[]> {
  return await scanAndGenerateVideos();
}