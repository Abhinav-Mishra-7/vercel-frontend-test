// src/components/VideoPlayer.js

import { useState, useRef, useEffect } from 'react';
import {
    Play, Pause, Volume2, VolumeX, Maximize, Settings, FastForward, Film
} from 'lucide-react';

const VideoPlayer = ({ secureUrl, thumbnailUrl }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
    const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);

    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const progressRef = useRef(null);

    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => setProgress(video.currentTime);
        const setVideoDuration = () => setDuration(video.duration);

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', setVideoDuration);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', setVideoDuration);
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) videoRef.current.pause();
        else videoRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const newMutedState = !isMuted;
        videoRef.current.muted = newMutedState;
        setIsMuted(newMutedState);
        if (!newMutedState && volume === 0) setVolume(1);
    };

    const handleProgressSeek = (e) => {
        const seekTime = (e.nativeEvent.offsetX / progressRef.current.offsetWidth) * duration;
        videoRef.current.currentTime = seekTime;
        setProgress(seekTime);
    };

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "00:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            playerContainerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleSetPlaybackRate = (rate) => {
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
        setIsSpeedMenuOpen(false);
    };

    return (
        <div
            ref={playerContainerRef}
            className="relative w-full aspect-video bg-black group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                className="w-full h-full"
                src={secureUrl}
                poster={thumbnailUrl}
                onClick={togglePlay}
            />

            <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} bg-black/20`}
            >
                <button onClick={togglePlay} className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                    {isPlaying ? <Pause size={40} /> : <Play size={40} />}
                </button>
            </div>

            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Progress Bar */}
                <div
                    ref={progressRef}
                    onClick={handleProgressSeek}
                    className="w-full h-1.5 bg-white/20 cursor-pointer rounded-full mb-3"
                >
                    <div
                        className="h-full bg-gradient-to-r from-primary-from to-primary-to rounded-full"
                        style={{ width: `${(progress / duration) * 100}%` }}
                    ></div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay}>
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMute}>
                                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 accent-[var(--primary-from)]"
                            />
                        </div>
                        <div className="text-sm font-mono">
                            {formatTime(progress)} / {formatTime(duration)}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        {/* Playback Speed */}
                        <div className="flex items-center gap-2">
                           {playbackRate !== 1 && <span className="text-sm font-bold">{playbackRate}x</span>}
                            <button onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}>
                                <FastForward size={20} />
                            </button>
                        </div>
                         {isSpeedMenuOpen && (
                            <div className="absolute bottom-full right-10 mb-2 bg-black/80 backdrop-blur-md rounded-lg py-2 w-28">
                                {playbackRates.map(rate => (
                                    <button key={rate} onClick={() => handleSetPlaybackRate(rate)} className="w-full text-left px-4 py-1.5 hover:bg-white/10 text-sm">
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Quality Settings */}
                        <div className="flex items-center gap-2">
                             <button onClick={() => setIsQualityMenuOpen(!isQualityMenuOpen)}>
                                <Settings size={20} />
                            </button>
                        </div>
                        {isQualityMenuOpen && (
                            <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-md rounded-lg py-2 w-40">
                                <p className="px-4 py-1.5 text-sm text-muted-foreground">Quality</p>
                                <button className="w-full text-left px-4 py-1.5 hover:bg-white/10 text-sm">Auto (Not Implemented)</button>
                            </div>
                        )}

                        <button onClick={toggleFullScreen}>
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;