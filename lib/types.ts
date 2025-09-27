// lib/types.ts - Complete Video interface and all component props

export interface Video {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  rating: number;
  genre: string;
  description: string;
  uploadDate: string;
  resolution?: string; // Optional field for video resolution
  fileSize?: number; // Optional field for file size in MB
  views?: number; // Optional field for view count
}

// Component prop interfaces
export interface VideoPlayerProps {
  videoId: string;
  className?: string;
}

export interface LoginFormProps {
  onLogin: (token: string) => void;
}

export interface NavigationProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export interface VideoCardProps {
  video: Video;
  isAuthenticated: boolean;
  onVideoClick: (video: Video) => void;
}

export interface VideoPlayerModalProps {
  video: Video;
  isAuthenticated: boolean;
  onClose: () => void;
}

export interface LoginModalProps {
  onLogin: (token: string) => void;
  onClose: () => void;
}