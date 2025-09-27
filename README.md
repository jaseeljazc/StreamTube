# StreamTube - Secure Video Streaming

A Next.js video streaming platform with AES-128 encryption and JWT authentication.

##  Quick Setup

### 1. Install
```bash
git clone <your-repo-url>
cd streamtube
npm install
```

### 2. Environment
Create `.env.local`:
```
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 3. Create Directories
```bash
mkdir -p public/videos
```

### 4. Generate Encryption Key
```bash
# Create encryption key
openssl rand -hex 16 > enc.key

# Create key info file
echo "http://localhost:3000/api/key/enc.keys" > enc.keyinfo
echo $(pwd)/enc.key >> enc.keyinfo
echo "0123456789ABCDEF0123456789ABCDEF" >> enc.keyinfo
```

## 🎥 Video Processing

### Convert MP4 to encrypted HLS:
```bash
ffmpeg -i your-video.mp4 \
  -hls_time 10 \
  -hls_key_info_file enc.keyinfo \
  -hls_playlist_type vod \
  -hls_segment_filename "public/videos/video-1/segment%03d.ts" \
  -start_number 0 \
  public/videos/video-1/playlist.m3u8
```

### Quick batch processing:
```bash
# Place video files as public/videos/video-1.mp4, video-2.mp4, etc.
for i in {1..4}; do
  mkdir -p "public/videos/video-$i"
  ffmpeg -i "public/videos/video-$i.mp4" \
    -hls_time 10 \
    -hls_key_info_file enc.keyinfo \
    -hls_playlist_type vod \
    -hls_segment_filename "public/videos/video-$i/segment%03d.ts" \
    -start_number 0 \
    "public/videos/video-$i/playlist.m3u8"
done
```

##  Run Application

```bash
npm run dev
```

 **Visit:** `http://localhost:3000`

**Demo Login:**
-  Email: `user@example.com` 
-  Password: `password123`

##  Key Features

- ✅ **AES-128 encrypted video streams**
- ✅ **JWT authentication with cookies**
- ✅ **Dynamic watermarks (email + timestamp)**
- ✅ **10-second previews for guests**
- ✅ **Responsive modern UI**

## 🔐 Security Notes

### Production Setup:
1. Use strong JWT secret
2. Enable HTTPS
3. Set secure cookie flags:
```javascript
httpOnly: true,
secure: true, 
sameSite: 'strict'
```

### 📁 File Structure:
```
public/videos/
├── video-1/
│   ├── playlist.m3u8
│   └── segment000.ts, segment001.ts...
├── video-1.mp4 (original)
└── video-1.png (thumbnail)
```

##  Troubleshooting

- **Video won't play**: Check FFmpeg completed and segments exist
- **Auth issues**: Verify JWT_SECRET and clear browser storage
- **Missing watermark**: Check user is logged in

⚠️ **Never commit `enc.key` to version control!**
