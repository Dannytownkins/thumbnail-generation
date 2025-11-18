import React, { useState, useRef } from 'react';
import { VideoFrame } from '../types';

interface VideoFrameExtractorProps {
  onFrameSelect: (frameDataUrl: string) => void;
  onClose: () => void;
}

const VideoFrameExtractor: React.FC<VideoFrameExtractorProps> = ({ onFrameSelect, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [frames, setFrames] = useState<VideoFrame[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const video = videoRef.current;
    if (!video) return;

    const url = URL.createObjectURL(file);
    video.src = url;
    video.load();
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    setFrames([]);
  };

  const captureFrame = (time: number): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const extractFrames = async (interval: number) => {
    const video = videoRef.current;
    if (!video) return;

    setIsExtracting(true);
    const duration = video.duration;
    const extractedFrames: VideoFrame[] = [];
    let index = 0;

    for (let time = 0; time < duration; time += interval) {
      video.currentTime = time;

      await new Promise<void>((resolve) => {
        video.onseeked = () => {
          const dataUrl = captureFrame(time);
          if (dataUrl) {
            extractedFrames.push({
              id: `frame-${index}`,
              dataUrl,
              timestamp: time,
              index,
            });
            index++;
          }
          resolve();
        };
      });
    }

    setFrames(extractedFrames);
    setIsExtracting(false);
  };

  const captureCurrentFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    const dataUrl = captureFrame(video.currentTime);
    if (dataUrl) {
      const newFrame: VideoFrame = {
        id: `frame-${Date.now()}`,
        dataUrl,
        timestamp: video.currentTime,
        index: frames.length,
      };
      setFrames([...frames, newFrame]);
      setSelectedFrame(dataUrl);
    }
  };

  const handleSelectFrame = (frame: VideoFrame) => {
    setSelectedFrame(frame.dataUrl);
  };

  const handleUseFrame = () => {
    if (selectedFrame) {
      onFrameSelect(selectedFrame);
      onClose();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex">
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Video Frame Extractor</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
          >
            Close
          </button>
        </div>

        {!videoLoaded ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-32 w-32 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Upload a Video</h3>
              <p className="text-slate-400 mb-6">
                Extract frames from your video footage to use as reference images
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-4 bg-gradient-to-r from-canam-orange to-red-600 text-white font-bold text-lg rounded-lg hover:from-canam-orange hover:to-red-700 transition-all shadow-lg"
              >
                📹 Choose Video File
              </button>
              <p className="text-xs text-slate-500 mt-4">Supports MP4, MOV, AVI, WebM</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
            {/* Video Player */}
            <div className="col-span-2 flex flex-col">
              <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 mb-4">
                <video
                  ref={videoRef}
                  controls
                  onLoadedMetadata={handleVideoLoaded}
                  className="w-full rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={captureCurrentFrame}
                  className="px-4 py-3 bg-gradient-to-r from-electric-blue to-cyan-600 text-white font-bold rounded-lg hover:from-electric-blue hover:to-cyan-700 transition-all"
                >
                  📸 Capture Current Frame
                </button>
                <button
                  onClick={() => extractFrames(1)}
                  disabled={isExtracting}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {isExtracting ? '⏳ Extracting...' : '⚡ Extract Every 1s'}
                </button>
                <button
                  onClick={() => extractFrames(2)}
                  disabled={isExtracting}
                  className="px-4 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50"
                >
                  Extract Every 2s
                </button>
                <button
                  onClick={() => extractFrames(5)}
                  disabled={isExtracting}
                  className="px-4 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50"
                >
                  Extract Every 5s
                </button>
              </div>
            </div>

            {/* Frames Gallery */}
            <div className="flex flex-col bg-slate-900 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Captured Frames ({frames.length})
                </h3>
                {frames.length > 0 && (
                  <button
                    onClick={() => setFrames([])}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {frames.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-slate-500">
                  <div>
                    <p className="font-medium">No frames captured yet</p>
                    <p className="text-xs mt-1">Use the buttons to extract frames</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {frames.map((frame) => (
                      <div
                        key={frame.id}
                        onClick={() => handleSelectFrame(frame)}
                        className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                          selectedFrame === frame.dataUrl
                            ? 'border-canam-orange ring-2 ring-canam-orange/50'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <img src={frame.dataUrl} alt={`Frame ${frame.index}`} className="w-full" />
                        <div className="bg-slate-800 px-2 py-1 text-xs text-slate-400">
                          {formatTime(frame.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleUseFrame}
                    disabled={!selectedFrame}
                    className="w-full px-4 py-3 bg-gradient-to-r from-canam-orange to-red-600 text-white font-bold rounded-lg hover:from-canam-orange hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✓ Use Selected Frame
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default VideoFrameExtractor;
