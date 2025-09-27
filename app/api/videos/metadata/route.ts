// app/api/videos/metadata/route.ts - Debug version with enhanced logging

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface VideoMetadata {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  rating: number;
  genre: string;
  description: string;
  uploadDate: string;
  fileSize?: number;
}

// Enhanced function to parse M3U8 playlist with better debugging
function parseM3U8Duration(m3u8Content: string): number {
  console.log('=== M3U8 PARSING DEBUG ===');
  console.log('Content length:', m3u8Content.length);
  console.log('First 1000 characters:', m3u8Content.substring(0, 1000));
  
  const lines = m3u8Content.split('\n');
  console.log('Total lines:', lines.length);
  
  // Show first 20 lines for debugging
  console.log('First 20 lines:');
  lines.slice(0, 20).forEach((line, index) => {
    console.log(`  ${index + 1}: "${line.trim()}"`);
  });
  
  let totalDuration = 0;
  let segmentCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      console.log(`\n--- Processing EXTINF line ${i + 1}: "${line}" ---`);
      
      // Try multiple regex patterns
      const patterns = [
        /#EXTINF:([0-9]*\.?[0-9]+),?.*$/, // Standard: #EXTINF:10.0,
        /#EXTINF:([0-9]*\.?[0-9]+)/, // Just the number part
        /#EXTINF:\s*([0-9]*\.?[0-9]+)/, // With whitespace
        /#EXTINF:([0-9]+\.?[0-9]*)/, // Integer first
      ];
      
      let segmentDuration = 0;
      for (let j = 0; j < patterns.length; j++) {
        const pattern = patterns[j];
        const match = line.match(pattern);
        console.log(`  Pattern ${j + 1} (${pattern.source}): ${match ? `MATCH: ${match[1]}` : 'NO MATCH'}`);
        
        if (match) {
          segmentDuration = parseFloat(match[1]);
          console.log(`  ✅ Extracted duration: ${segmentDuration}`);
          break;
        }
      }
      
      if (segmentDuration > 0) {
        totalDuration += segmentDuration;
        segmentCount++;
        console.log(`  ✅ Added segment ${segmentCount}: ${segmentDuration}s (total: ${totalDuration}s)`);
      } else {
        console.log(`  ❌ Could not parse duration from: "${line}"`);
        
        // Manual inspection
        console.log('  Manual character analysis:');
        for (let k = 0; k < Math.min(line.length, 20); k++) {
          console.log(`    ${k}: "${line[k]}" (code: ${line.charCodeAt(k)})`);
        }
      }
    }
  }
  
  console.log(`\n=== FINAL RESULT ===`);
  console.log(`Total duration: ${totalDuration}s from ${segmentCount} segments`);
  console.log('===================\n');
  
  return Math.round(totalDuration);
}

// Function to format seconds to readable duration
function formatDuration(seconds: number): string {
  if (seconds === 0) {
    return "Unknown";
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    // For hours: show hours and minutes (e.g., "1h 30m")
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    // For minutes: show minutes and seconds (e.g., "1m 5s")
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    // For less than a minute: show only seconds
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
function getVideoMetadata(videoId: string): VideoMetadata | null {
  const videosDir = path.join(process.cwd(), 'public', 'videos');
  const videoDir = path.join(videosDir, `video-${videoId}`);
  const playlistPath = path.join(videoDir, 'playlist.m3u8');
  const mp4Path = path.join(videosDir, `video-${videoId}.mp4`);
  const thumbnailPath = `/videos/video-${videoId}.png`;
  
  console.log(`\n🎬 === PROCESSING VIDEO ${videoId} ===`);
  console.log('📂 Video directory:', videoDir);
  console.log('📄 Playlist path:', playlistPath);
  console.log('🎥 MP4 path:', mp4Path);
  
  try {
    let duration = 0;
    let fileSize = 0;
    let title = `Video ${videoId}`;
    
    // Check what exists
    console.log('\n📋 File existence check:');
    console.log(`  Video dir exists: ${fs.existsSync(videoDir)}`);
    console.log(`  Playlist exists: ${fs.existsSync(playlistPath)}`);
    console.log(`  MP4 exists: ${fs.existsSync(mp4Path)}`);
    
    // Try to get duration from M3U8 playlist
    if (fs.existsSync(playlistPath)) {
      console.log('\n✅ Playlist file found, reading content...');
      const playlistContent = fs.readFileSync(playlistPath, 'utf8');
      duration = parseM3U8Duration(playlistContent);
      console.log(`📊 Final duration extracted: ${duration} seconds`);
    } else {
      console.log('\n❌ No playlist found at expected location');
      
      // Let's check what files actually exist in the video directory
      if (fs.existsSync(videoDir)) {
        const dirContents = fs.readdirSync(videoDir);
        console.log('📁 Files in video directory:', dirContents);
        
        // Try to find any .m3u8 file
        const m3u8Files = dirContents.filter(file => file.endsWith('.m3u8'));
        if (m3u8Files.length > 0) {
          console.log('🔍 Found M3U8 files:', m3u8Files);
          const altPlaylistPath = path.join(videoDir, m3u8Files[0]);
          console.log('📖 Trying alternative playlist:', altPlaylistPath);
          const playlistContent = fs.readFileSync(altPlaylistPath, 'utf8');
          duration = parseM3U8Duration(playlistContent);
        } else {
          console.log('❌ No M3U8 files found in directory');
        }
      } else {
        console.log('❌ Video directory does not exist');
      }
    }
    
    // Try to get file info from MP4
    if (fs.existsSync(mp4Path)) {
      const stats = fs.statSync(mp4Path);
      fileSize = Math.round(stats.size / (1024 * 1024)); // Convert to MB
      
      // Extract title from filename
      const filename = path.basename(mp4Path);
      title = extractTitle(filename);
      console.log(`✅ MP4 file found - title: ${title}, size: ${fileSize}MB`);
    } else {
      console.log('❌ No MP4 found');
    }
    
    // Check if thumbnail exists
    const fullThumbnailPath = path.join(process.cwd(), 'public', thumbnailPath.substring(1));
    const thumbnailExists = fs.existsSync(fullThumbnailPath);
    console.log(`${thumbnailExists ? '✅' : '❌'} Thumbnail: ${fullThumbnailPath}`);
    
    const result = {
      id: parseInt(videoId),
      title,
      duration: formatDuration(duration),
      thumbnail: thumbnailPath,
      rating: 8.0,
      genre: 'Video',
      description: duration > 0 ? `${title} - ${formatDuration(duration)}` : `${title} - Duration unknown`,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize
    };
    
    console.log('\n📊 FINAL RESULT FOR VIDEO', videoId, ':', result);
    console.log('🎬 ========================\n');
    return result;
    
  } catch (error) {
    console.error(`❌ Error reading video metadata for video-${videoId}:`, error);
    return null;
  }
}

// Function to scan all videos
function scanAllVideos(): VideoMetadata[] {
  const videosDir = path.join(process.cwd(), 'public', 'videos');
  const videos: VideoMetadata[] = [];
  
  try {
    if (!fs.existsSync(videosDir)) {
      console.error('Videos directory does not exist:', videosDir);
      return [];
    }
    
    console.log('\n🔍 SCANNING VIDEOS DIRECTORY:', videosDir);
    
    // Find all video directories (video-1, video-2, etc.)
    const items = fs.readdirSync(videosDir, { withFileTypes: true });
    console.log('📁 All items in videos directory:', items.map(item => `${item.name} (${item.isDirectory() ? 'dir' : 'file'})`));
    
    const videoFolders = items
      .filter(item => item.isDirectory() && item.name.match(/^video-\d+$/))
      .map(item => item.name)
      .sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
        return aNum - bNum;
      });
    
    console.log('🎯 Found video folders:', videoFolders);
    
    // Generate video data for each folder
    for (const folderName of videoFolders) {
      const videoId = folderName.replace('video-', '');
      const metadata = getVideoMetadata(videoId);
      
      if (metadata) {
        videos.push(metadata);
        console.log(`✅ Successfully processed video ${videoId}: ${metadata.title}, ${metadata.duration}`);
      } else {
        console.log(`❌ Failed to process video ${videoId}`);
      }
    }
    
    console.log(`\n🎉 SCAN COMPLETE: Found ${videos.length} videos`);
    return videos;
    
  } catch (error) {
    console.error('Error scanning videos directory:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('\n🚀 === VIDEO METADATA API CALLED ===');
    const videos = scanAllVideos();
    
    console.log(`📤 Returning ${videos.length} videos to client`);
    
    return NextResponse.json({ 
      success: true, 
      videos,
      count: videos.length 
    });
    
  } catch (error) {
    console.error('❌ Error in video metadata API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to scan videos',
      videos: []
    }, { status: 500 });
  }
}