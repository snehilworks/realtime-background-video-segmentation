"use client";

import React, { useState, useRef, useCallback } from 'react';
import { 
  Video, 
  Square, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Clock,
  HardDrive,
  Share2
} from 'lucide-react';

interface RecordingStudioProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
}

const RecordingStudio: React.FC<RecordingStudioProps> = ({ canvasRef, isStreaming }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<Array<{
    id: string;
    name: string;
    duration: number;
    size: string;
    timestamp: Date;
    thumbnail: string;
  }>>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      const stream = canvasRef.current.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const newRecording = {
          id: Date.now().toString(),
          name: `Recording_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`,
          duration: recordingTime,
          size: formatFileSize(blob.size),
          timestamp: new Date(),
          thumbnail: url
        };
        
        setRecordings(prev => [newRecording, ...prev]);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [canvasRef, recordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadRecording = (recording: typeof recordings[0]) => {
    const link = document.createElement('a');
    link.href = recording.thumbnail;
    link.download = `${recording.name}.webm`;
    link.click();
  };

  const shareRecording = async (recording: typeof recordings[0]) => {
    if (navigator.share) {
      try {
        const file = new File([recordedChunksRef.current[0]], `${recording.name}.webm`, {
          type: 'video/webm'
        });
        await navigator.share({
          title: recording.name,
          text: 'Check out my AI background replacement recording!',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center space-x-2 mb-6">
        <Video className="w-5 h-5 text-red-400" />
        <h3 className="text-xl font-semibold">Recording Studio</h3>
        {isRecording && (
          <div className="ml-auto flex items-center space-x-2 text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">REC</span>
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center space-x-3">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={!isStreaming}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            )}
          </div>
          
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        {/* Recording Settings */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
            <span className="text-slate-300">Quality</span>
            <select className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white">
              <option value="1080p">1080p HD</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p SD</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
            <span className="text-slate-300">Format</span>
            <select className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white">
              <option value="webm">WebM</option>
              <option value="mp4">MP4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span>Recent Recordings</span>
          </h4>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recordings.map((recording) => (
              <div key={recording.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="w-12 h-8 bg-slate-600 rounded flex items-center justify-center">
                  <Play className="w-4 h-4 text-slate-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {recording.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatTime(recording.duration)} • {recording.size} • {recording.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadRecording(recording)}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                  </button>
                  
                  <button
                    onClick={() => shareRecording(recording)}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4 text-green-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Info */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Storage Used</span>
          <span className="text-white font-mono">
            {recordings.reduce((total, r) => total + parseFloat(r.size), 0).toFixed(1)} MB
          </span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((recordings.length / 10) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default RecordingStudio;