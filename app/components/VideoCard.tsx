// // Video Card Component



// import React, { useState, useEffect, useRef } from 'react';
// import { Play, Clock, Star, User, Search, Menu, X } from 'lucide-react';
// import { VideoCardProps } from '@/lib/types';
// const VideoCard: React.FC<VideoCardProps> = ({ video, isAuthenticated, onVideoClick }) => {
//   const [isHovered, setIsHovered] = useState<boolean>(false);

//   return (
//     <div 
//       className="group cursor-pointer transition-all duration-300 transform hover:scale-105"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={() => onVideoClick(video)}
//     >
//       <div className="relative bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
//         {/* Thumbnail */}
//         <div className="relative aspect-video">
//           <img 
//             src={video.thumbnail} 
//             alt={video.title}
//             className="w-full h-full object-cover"
//           />
          
//           {/* Overlay */}
//           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
//             <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
//               <div className="bg-red-600 rounded-full p-4 shadow-lg">
//                 <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
//               </div>
//             </div>
//           </div>

//           {/* Duration badge */}
//           <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded flex items-center space-x-1">
//             <Clock className="h-3 w-3" />
//             <span>{video.duration}</span>
//           </div>

//           {/* Premium badge for non-authenticated users */}
//           {!isAuthenticated && (
//             <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
//               PREVIEW ONLY
//             </div>
//           )}
//         </div>

//         {/* Video Info */}
//         <div className="p-4">
//           <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-red-400 transition-colors">
//             {video.title}
//           </h3>
          
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
//               <span className="text-gray-300 text-sm">{video.rating}</span>
//               <span className="text-gray-500 text-sm">• {video.genre}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoCard


// Enhanced Video Card Component with loading states

import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, Star, User, Search, Menu, X } from 'lucide-react';
import { VideoCardProps } from '@/lib/types';

const VideoCard: React.FC<VideoCardProps> = ({ video, isAuthenticated, onVideoClick }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Check if duration is still loading
  const isLoadingDuration = video.duration === 'Loading...' || video.duration === 'Unknown';
  
  // Format duration display
  const getDurationDisplay = () => {
    if (video.duration === 'Loading...') return '⏳';
    if (video.duration === 'Unknown') return '?';
    return video.duration;
  };

  // Get duration color based on status
  const getDurationStyle = () => {
    if (isLoadingDuration) {
      return 'bg-gray-600 bg-opacity-80 animate-pulse';
    }
    return 'bg-black bg-opacity-80';
  };

  return (
    <div 
      className="group cursor-pointer transition-all duration-300 transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onVideoClick(video)}
    >
      <div className="relative bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-700">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-400 border-t-white"></div>
            </div>
          )}
          
          {!imageError ? (
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🎬</div>
                <div className="text-sm">No thumbnail</div>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
            <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="bg-red-600 rounded-full p-4 shadow-lg hover:bg-red-700 transition-colors">
                <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Duration badge */}
          <div className={`absolute bottom-3 right-3 text-white text-sm px-2 py-1 rounded flex items-center space-x-1 transition-all duration-300 ${getDurationStyle()}`}>
            <Clock className="h-3 w-3" />
            <span className={isLoadingDuration ? 'font-mono' : ''}>
              {getDurationDisplay()}
            </span>
            {video.duration === 'Loading...' && (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-1"></div>
            )}
          </div>

          {/* Premium badge for non-authenticated users */}
          {!isAuthenticated && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
              PREVIEW ONLY
            </div>
          )}

          {/* Loading badge if data is still being fetched */}
          {isLoadingDuration && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded animate-pulse">
              Loading...
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-red-400 transition-colors line-clamp-2">
            {video.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <span className="text-gray-300 text-sm">
                {video.rating > 0 ? video.rating : '—'}
              </span>
              <span className="text-gray-500 text-sm">• {video.genre}</span>
            </div>
          </div>

          {/* Additional metadata */}
          {video.description && (
            <p className="text-gray-400 text-sm mt-2 line-clamp-2">
              {video.description}
            </p>
          )}
          
          {/* File size if available */}
          {video.fileSize && video.fileSize > 0 && (
            <div className="text-gray-500 text-xs mt-2">
              {video.fileSize}MB
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;