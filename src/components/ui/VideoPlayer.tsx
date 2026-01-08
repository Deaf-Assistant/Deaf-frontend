// components/ui/VideoPlayer.tsx
import { FC } from 'react';
import Image from 'next/image';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  autoLoop?: boolean;
}

const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, title, autoLoop = false }) => {
  // Check if the URL is a GIF
  const isGif = videoUrl.toLowerCase().endsWith('.gif');

  if (isGif) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={videoUrl}
          alt={title || 'GIF'}
          className="w-full h-full object-contain"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        className="w-full h-full object-contain"
        src={videoUrl}
        title={title}
        autoPlay={autoLoop}
        loop={autoLoop}
        muted={true}
        playsInline={true}
        controls={!autoLoop}
        preload="metadata"
      >
        <source src={videoUrl} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;