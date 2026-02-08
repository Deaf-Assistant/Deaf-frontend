import { FC, useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  autoLoop?: boolean;
  poster?: string;
}

const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, title, autoLoop = false, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoLoop);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(autoLoop); // Auto-loop usually requires mute
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Safety check: if videoUrl is missing, return null or placeholder
  if (!videoUrl) {
    return <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Video Source</div>;
  }

  const isGif = videoUrl.toLowerCase().endsWith('.gif');

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  // Update playback rate when state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events (browsers can exit fullscreen via ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

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
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        src={videoUrl}
        title={title}
        poster={poster}
        autoPlay={autoLoop}
        loop={autoLoop}
        muted={isMuted} // Controlled by state
        playsInline={true}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={videoUrl} />
        Your browser does not support the video tag.
      </video>

      {/* Big Play Button Overlay (when paused) */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white ml-1">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-2 px-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
      >
        {/* Progress Bar */}
        <div className="w-full mb-2 flex items-center gap-2 group/progress">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:w-4 hover:[&::-webkit-slider-thumb]:h-4 transition-all"
            style={{
              backgroundSize: `${(currentTime * 100) / duration}% 100%`,
              backgroundImage: 'linear-gradient(#3b82f6, #3b82f6)',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="hover:text-blue-400 transition">
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume relative">
              <button onClick={toggleMute} className="hover:text-blue-400 transition">
                {isMuted || volume === 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M5.85 3.5a.75.75 0 00-1.117-1 9.719 9.719 0 00-2.348 4.876.75.75 0 001.47.434 8.219 8.219 0 011.995-4.31zM9.75 5.25v13.5a.75.75 0 01-1.28.53L4.25 15H1.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 01.75-.75h2.75l4.22-4.28a.75.75 0 011.28.53zM14.25 4.5a.75.75 0 100 1.5.75.75 0 000-1.5zM17.25 4.5a.75.75 0 100 1.5.75.75 0 000-1.5z" />
                    <path d="M19.108 5.608a.75.75 0 010 1.06L17.56 8.25l1.547 1.582a.75.75 0 01-1.077 1.054L16.485 9.32l-1.548 1.566a.75.75 0 11-1.036-1.084l1.524-1.551-1.524-1.571a.75.75 0 111.058-1.066l1.526 1.576 1.547-1.576a.75.75 0 011.075 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                  </svg>
                )}
              </button>

              <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:w-4 hover:[&::-webkit-slider-thumb]:h-4"
                />
              </div>
            </div>

            {/* Time */}
            <div className="text-sm font-medium">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-gray-400">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Speed Control */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-sm font-bold hover:text-blue-400 transition min-w-[3rem]"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full mb-2 lg:right-0 left-1/2 lg:left-auto -translate-x-1/2 lg:translate-x-0 bg-black/90 backdrop-blur-md rounded-lg overflow-hidden shadow-xl border border-white/10 p-1 min-w-[120px]">
                  {speeds.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackRate(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/10 rounded ${playbackRate === speed ? 'text-blue-400 font-bold' : 'text-white'
                        }`}
                    >
                      {speed}x {playbackRate === speed && '✓'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-blue-400 transition">
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M3.75 3.75v4.5a.75.75 0 01-1.5 0v-4.5c0-.414.336-.75.75-.75h4.5a.75.75 0 010 1.5h-4.5zM3.75 20.25v-4.5a.75.75 0 011.5 0v4.5h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM20.25 3.75h-4.5a.75.75 0 010-1.5h4.5c.414 0 .75.336.75.75v4.5a.75.75 0 01-1.5 0v-4.5zM20.25 20.25h-4.5a.75.75 0 010-1.5h4.5v-4.5a.75.75 0 011.5 0v4.5c0 .414-.336.75-.75.75z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M3.75 3.75v4.5a.75.75 0 01-1.5 0v-4.5c0-.414.336-.75.75-.75h4.5a.75.75 0 010 1.5h-4.5zM3.75 16.5v4.5c0 .414.336.75.75.75h4.5a.75.75 0 010-1.5h-4.5v-4.5a.75.75 0 01-1.5 0zM16.5 3.75a.75.75 0 01.75-.75h4.5c.414 0 .75.336.75.75v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 01-.75-.75zM16.5 20.25a.75.75 0 010 1.5h-4.5a.75.75 0 010-1.5h4.5zM19.5 16.5a.75.75 0 01.75.75v3h.75a.75.75 0 01-1.5 0v-3.75z" clipRule="evenodd" />
                  <path d="M15 3.75a.75.75 0 01.75-.75h4.5c.414 0 .75.336.75.75v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 01-.75-.75z" />
                  {/* Simplifier icon for full screen */}
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;