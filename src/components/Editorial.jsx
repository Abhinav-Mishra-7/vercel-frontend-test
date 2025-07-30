import { Play , Pause , Volume2 , VolumeOff , Maximize , Minimize , Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ secureUrl , thumbnailUrl}) => {

    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const containerRef = useRef(null);

    let availableResolutions = ["360" , "480" , "720" , "1080"] ;

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Format time for display
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Event Handlers
    const togglePlayPause = () => {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === '0');
    };
    
    const toggleMute = () => {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleSpeedChange = (speed) => {
        videoRef.current.playbackRate = speed;
        setPlaybackSpeed(speed);
    };

    const handleProgressClick = (e) => {
        const progressRect = progressRef.current.getBoundingClientRect();
        const clickPosition = e.clientX - progressRect.left;
        const width = progressRect.width;
        const newTime = (clickPosition / width) * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full aspect-video bg-black group ">
            <video
                ref={videoRef}
                src={secureUrl}
                poster={thumbnailUrl}
                onClick={togglePlayPause}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full"
            />
            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar */}
                <progress
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="progress progress-error w-full h-1 cursor-pointer"
                    value={currentTime}
                    max={duration}
                ></progress>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between text-white mt-2">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlayPause} className="btn btn-ghost btn-sm">
                            {isPlaying ? <Pause /> : <Play />}
                        </button>
                        <div className="flex items-center gap-2">
                           <button onClick={toggleMute} className="btn btn-ghost btn-sm">
                               {isMuted || volume == 0 ? <Volume2 /> : <VolumeOff />}
                           </button>
                           <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="range range-xs w-20"
                            />
                        </div>
                        <span className="text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                         {/* Speed Control Dropdown */}
                        <div className="dropdown dropdown-top dropdown-end hover:cursor-pointer">
                            <label tabIndex={0} className="btn btn-ghost btn-sm">1X</label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-24">
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                                    <li key={speed}><a className={playbackSpeed === speed ? 'bg-primary' : ''} onClick={() => handleSpeedChange(speed)}>{speed}x</a></li>
                                ))}
                            </ul>
                        </div>
                         {/* Resolution Control Dropdown */}
                        <div className="dropdown dropdown-top dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-sm"><Settings /></label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-32">
                                 <li className="menu-title"><span>Quality</span></li>
                                {/* {availableResolutions.map(res => (
                                    <li key={res}><a className={currentResolution === res ? 'bg-primary' : ''}>{res}</a></li>
                                ))} */}
                                
                            </ul>
                        </div>
                        <button onClick={toggleFullscreen} className="btn btn-ghost btn-sm">
                            {isFullscreen ? <Minimize /> : <Maximize />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;