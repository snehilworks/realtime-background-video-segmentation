"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Camera,
  Upload,
  Settings,
  Download,
  Play,
  Square,
  Wifi,
  WifiOff,
  Activity,
  Cpu,
  Zap,
  Monitor,
  Cloud,
  Shield,
  Sparkles,
  BarChart3,
  Users,
  Star,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize,
  Minimize,
} from "lucide-react";

// Enhanced type definitions
interface BackgroundSettings {
  type: "blur" | "office" | "nature" | "space" | "beach" | "custom" | "gradient" | "abstract";
  blurAmount: number;
  solidColor: string;
  selectedBackground: string | null;
  quality: "high" | "medium" | "low";
  edgeSmoothing: number;
}

interface StreamState {
  isStreaming: boolean;
  isProcessing: boolean;
  fps: number;
  latency: number;
  quality: "4K" | "HD" | "SD";
  bitrate: number;
}

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectCount: number;
  serverVersion: string;
  serverLoad: number;
}

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  frameDrops: number;
  totalFrames: number;
  uptime: number;
}

const Home: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const animationFrameRef = useRef<number>();
  const fpsCounterRef = useRef<{ lastTime: number; frameCount: number }>({
    lastTime: 0,
    frameCount: 0,
  });
  const latencyRef = useRef<number>(0);
  const processingRef = useRef<boolean>(false);

  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    isProcessing: false,
    fps: 0,
    latency: 0,
    quality: "HD",
    bitrate: 0,
  });

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    reconnectCount: 0,
    serverVersion: "v2.1.0",
    serverLoad: 0,
  });

  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: "blur",
    blurAmount: 15,
    solidColor: "#6366f1",
    selectedBackground: null,
    quality: "high",
    edgeSmoothing: 85,
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 0,
    frameDrops: 0,
    totalFrames: 0,
    uptime: 0,
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sessionStats, setSessionStats] = useState({ startTime: Date.now(), processedFrames: 0 });

  // Enhanced logging function with categories
  const addLog = useCallback((message: string, category: "info" | "error" | "success" | "warning" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = { info: "ℹ️", error: "❌", success: "✅", warning: "⚠️" }[category];
    setLogs((prev) => [...prev.slice(-7), `${timestamp} ${emoji} ${message}`]);
    console.log(`[${category.toUpperCase()}] ${message}`);
  }, []);

  // Simulated performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        ...prev,
        cpuUsage: Math.random() * 30 + 20,
        memoryUsage: Math.random() * 40 + 30,
        networkLatency: Math.random() * 20 + 10,
        uptime: Date.now() - sessionStats.startTime,
      }));
      
      setConnectionState(prev => ({
        ...prev,
        serverLoad: Math.random() * 30 + 15,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionStats.startTime]);

  // Enhanced WebSocket connection with retry logic
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionState((prev) => ({ ...prev, isConnecting: true }));
    addLog("Establishing secure connection to AI inference engine...", "info");

    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      setConnectionState({
        isConnected: true,
        isConnecting: false,
        reconnectCount: 0,
        serverVersion: "v2.1.0",
        serverLoad: 0,
      });
      addLog("Connected to MediaPipe AI Engine", "success");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        addLog(`Message parsing failed: ${error}`, "error");
      }
    };

    ws.onclose = () => {
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }));
      addLog("Connection to AI engine lost", "warning");

      if (streamState.isStreaming) {
        setTimeout(() => {
          setConnectionState((prev) => ({
            ...prev,
            reconnectCount: prev.reconnectCount + 1,
          }));
          connectWebSocket();
        }, 3000);
      }
    };

    ws.onerror = () => {
      addLog("Failed to connect to AI backend (localhost:8000)", "error");
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }));
    };

    wsRef.current = ws;
  }, [addLog, streamState.isStreaming]);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case "processed_frame":
        if (canvasRef.current && data.data) {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (ctx && canvas) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            }
            processingRef.current = false;

            setSessionStats(prev => ({
              ...prev,
              processedFrames: prev.processedFrames + 1
            }));

            if (data.timestamp) {
              const latency = Date.now() - data.timestamp;
              latencyRef.current = latency;
              setStreamState((prev) => ({ ...prev, latency }));
            }
          };
          img.src = `data:image/jpeg;base64,${data.data}`;
        }
        break;

      case "background_changed":
        addLog(`Background switched to: ${data.background}`, "success");
        break;

      case "error":
        addLog(`AI Engine Error: ${data.message}`, "error");
        break;

      case "performance_update":
        setPerformanceMetrics(prev => ({ ...prev, ...data.metrics }));
        break;
    }
  }, [addLog]);

  const sendFrameToBackend = useCallback(() => {
    if (
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN ||
      !videoRef.current ||
      processingRef.current
    ) return;

    const video = videoRef.current;
    if (video.readyState !== 4) return;

    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) return;

      tempCtx.drawImage(video, 0, 0);
      const frameData = tempCanvas.toDataURL("image/jpeg", backgroundSettings.quality === "high" ? 0.9 : 0.7);

      processingRef.current = true;
      const message = {
        type: "frame",
        data: frameData.split(',')[1],
        timestamp: Date.now(),
        settings: {
          background: backgroundSettings.type,
          quality: backgroundSettings.quality,
          edgeSmoothing: backgroundSettings.edgeSmoothing,
        }
      };

      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      addLog(`Frame processing error: ${error}`, "error");
      processingRef.current = false;
    }
  }, [addLog, backgroundSettings]);

  const startProcessingLoop = useCallback(() => {
    const loop = () => {
      if (streamState.isStreaming && connectionState.isConnected) {
        sendFrameToBackend();

        const now = performance.now();
        fpsCounterRef.current.frameCount++;
        if (now - fpsCounterRef.current.lastTime >= 1000) {
          const fps = Math.round(
            (fpsCounterRef.current.frameCount * 1000) /
              (now - fpsCounterRef.current.lastTime)
          );
          setStreamState((prev) => ({ ...prev, fps, bitrate: fps * 2.5 }));
          fpsCounterRef.current.lastTime = now;
          fpsCounterRef.current.frameCount = 0;
        }
      }

      if (streamState.isStreaming) {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };
    loop();
  }, [streamState.isStreaming, connectionState.isConnected, sendFrameToBackend]);

  const startCamera = useCallback(async () => {
    try {
      addLog("Initializing high-definition camera stream...", "info");

      const constraints = {
        video: {
          width: streamState.quality === "4K" ? 3840 : streamState.quality === "HD" ? 1920 : 1280,
          height: streamState.quality === "4K" ? 2160 : streamState.quality === "HD" ? 1080 : 720,
          facingMode: "user",
          frameRate: 30,
        },
        audio: audioEnabled,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setStreamState((prev) => ({
          ...prev,
          isStreaming: true,
          isProcessing: true,
        }));

        // Clear canvas before starting new stream
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }

        connectWebSocket();
        fpsCounterRef.current = { lastTime: performance.now(), frameCount: 0 };
        setSessionStats({ startTime: Date.now(), processedFrames: 0 });
        
        addLog(`${streamState.quality} stream started successfully`, "success");
      }
    } catch (error) {
      addLog(`Camera initialization failed: ${error}`, "error");
    }
  }, [addLog, connectWebSocket, streamState.quality, audioEnabled]);

  const stopCamera = useCallback(() => {
    addLog("Stopping camera stream...", "info");

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    // Clear the canvas to remove the last processed frame
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    // Reset processing state
    processingRef.current = false;

    setStreamState({
      isStreaming: false,
      isProcessing: false,
      fps: 0,
      latency: 0,
      quality: streamState.quality,
      bitrate: 0,
    });

    // Reset session stats
    setSessionStats({ startTime: Date.now(), processedFrames: 0 });

    addLog("Stream terminated successfully", "success");
  }, [addLog, streamState.quality]);

  useEffect(() => {
    if (streamState.isStreaming && connectionState.isConnected) {
      startProcessingLoop();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [streamState.isStreaming, connectionState.isConnected, startProcessingLoop]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Stop camera if running
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    };
  }, []);

  const changeBackground = useCallback((backgroundType: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: "change_background",
        background: backgroundType,
        settings: {
          quality: backgroundSettings.quality,
          edgeSmoothing: backgroundSettings.edgeSmoothing,
        }
      };
      wsRef.current.send(JSON.stringify(message));
      addLog(`Switching to ${backgroundType} background`, "info");
    }
  }, [addLog, backgroundSettings]);

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        addLog("Uploading custom background asset...", "info");
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:8000/upload-background', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          setBackgroundSettings((prev) => ({
            ...prev,
            selectedBackground: URL.createObjectURL(file),
            type: "custom",
          }));
          
          changeBackground('custom');
          addLog("Custom background uploaded successfully", "success");
        } else {
          const result = await response.json();
          addLog(`Upload failed: ${result.error}`, "error");
        }
      } catch (error) {
        addLog(`Upload error: ${error}`, "error");
      }
    }
  };

  const downloadFrame = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `ai-studio-capture-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL("image/png", 1.0);
      link.click();
      addLog("High-resolution frame exported", "success");
    }
  };

  const resetCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        addLog("Canvas cleared", "info");
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const backgroundPresets = [
    { id: "blur", name: "Professional Blur", icon: "🌫️", gradient: "from-slate-400 to-slate-600" },
    { id: "office", name: "Modern Office", icon: "🏢", gradient: "from-blue-400 to-blue-600" },
    { id: "nature", name: "Natural Studio", icon: "🌲", gradient: "from-green-400 to-green-600" },
    { id: "space", name: "Cosmic Theme", icon: "🚀", gradient: "from-purple-400 to-purple-600" },
    { id: "beach", name: "Coastal Vibes", icon: "🏖️", gradient: "from-cyan-400 to-cyan-600" },
    { id: "gradient", name: "AI Gradient", icon: "🎨", gradient: "from-pink-400 to-pink-600" },
    { id: "abstract", name: "Abstract Pro", icon: "✨", gradient: "from-indigo-400 to-indigo-600" },
    { id: "custom", name: "Custom Asset", icon: "📁", gradient: "from-gray-400 to-gray-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6 max-w-[120rem] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Background Studio
                </h1>
                <p className="text-slate-400 text-lg">
                  Enterprise-grade real-time background replacement powered by MediaPipe AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status Badge */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                connectionState.isConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : connectionState.isConnecting
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {connectionState.isConnected ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <Wifi className="w-4 h-4" />
                    <span>AI Engine Online</span>
                  </>
                ) : connectionState.isConnecting ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </>
                )}
              </div>

              {/* Quality Indicator */}
              {streamState.isStreaming && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Monitor className="w-4 h-4" />
                    <span>{streamState.quality}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-400">
                    <Activity className="w-4 h-4" />
                    <span>{streamState.fps} FPS</span>
                  </div>
                  <div className="flex items-center space-x-1 text-purple-400">
                    <Zap className="w-4 h-4" />
                    <span>{streamState.latency}ms</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-12rem)]">
          {/* Main Video Feed */}
          <div className="col-span-8 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${streamState.isStreaming ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                  <h2 className="text-xl font-semibold flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-blue-400" />
                    <span>Live Studio Feed</span>
                  </h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`p-2 rounded-lg transition-colors ${audioEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}
                  >
                    {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 transition-colors"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="relative flex-1 bg-black rounded-xl overflow-hidden group">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover opacity-0"
                  autoPlay
                  muted={!audioEnabled}
                  playsInline
                />

                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {!streamState.isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center opacity-50">
                        <Camera className="w-12 h-12" />
                      </div>
                      <h3 className="text-xl font-semibold">AI Studio Ready</h3>
                      <p className="text-slate-400 max-w-md">
                        {!connectionState.isConnected
                          ? "Connect to AI backend to begin professional video processing"
                          : "Click Start to begin real-time AI background replacement"}
                      </p>
                      {connectionState.isConnected && (
                        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-400 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>AI Engine Connected - Ready to Start</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Advanced Overlay */}
                {streamState.isStreaming && (
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-xs space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-slate-400">Engine Status</div>
                        <div className="text-green-400 font-medium">Processing</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Background</div>
                        <div className="text-blue-400 font-medium capitalize">{backgroundSettings.type}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Quality</div>
                        <div className="text-purple-400 font-medium">{backgroundSettings.quality.toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Smoothing</div>
                        <div className="text-cyan-400 font-medium">{backgroundSettings.edgeSmoothing}%</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-700">
                      <div className="text-slate-400">Processed: {sessionStats.processedFrames} frames</div>
                    </div>
                  </div>
                )}

                {/* Performance HUD */}
                {streamState.isStreaming && (
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-xs space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-slate-400 font-medium">Performance Metrics</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">FPS:</span>
                        <span className="text-green-400 font-mono">{streamState.fps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Latency:</span>
                        <span className="text-blue-400 font-mono">{streamState.latency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bitrate:</span>
                        <span className="text-purple-400 font-mono">{streamState.bitrate.toFixed(1)} Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Uptime:</span>
                        <span className="text-cyan-400 font-mono">{formatUptime(performanceMetrics.uptime)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Controls */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-3">
                  {!streamState.isStreaming ? (
                    <button
                      onClick={startCamera}
                      disabled={connectionState.isConnecting}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-slate-600 disabled:to-slate-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                    >
                      <Play className="w-5 h-5" />
                      <span>Start Studio</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Square className="w-5 h-5" />
                      <span>Stop Studio</span>
                    </button>
                  )}

                  {!connectionState.isConnected && !connectionState.isConnecting && (
                    <button
                      onClick={connectWebSocket}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Cloud className="w-5 h-5" />
                      <span>Connect AI Engine</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={streamState.quality}
                    onChange={(e) => setStreamState(prev => ({ ...prev, quality: e.target.value as any }))}
                    className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="4K">4K Ultra</option>
                    <option value="HD">HD 1080p</option>
                    <option value="SD">SD 720p</option>
                  </select>

                  <button
                    onClick={resetCanvas}
                    className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={downloadFrame}
                    disabled={!streamState.isStreaming}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span>Export Frame</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-6 overflow-y-auto">
            {/* Background Presets */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>AI Backgrounds</span>
                </h3>
                <div className="text-sm text-slate-400">
                  {backgroundPresets.length} presets
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {backgroundPresets.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setBackgroundSettings((prev) => ({
                        ...prev,
                        type: bg.id as any,
                      }));
                      changeBackground(bg.id);
                    }}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      backgroundSettings.type === bg.id
                        ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/25"
                        : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${bg.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <div className="relative z-10 text-center">
                      <div className="text-2xl mb-2">{bg.icon}</div>
                      <div className="text-sm font-medium text-white">{bg.name}</div>
                    </div>
                    {backgroundSettings.type === bg.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Upload */}
              {backgroundSettings.type === "custom" && (
                <div className="mb-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleBackgroundUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-2 border-dashed border-slate-600 rounded-xl py-8 transition-all duration-300 group"
                  >
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                    <div>
                      <div className="text-white font-medium">Upload Custom Background</div>
                      <div className="text-slate-400 text-sm">PNG, JPG up to 10MB</div>
                    </div>
                  </button>
                  {backgroundSettings.selectedBackground && (
                    <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-400 text-sm">
                        <Shield className="w-4 h-4" />
                        <span>Custom background loaded successfully</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Settings */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <span>Advanced Settings</span>
                  <RotateCcw className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                {showAdvanced && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">
                        Processing Quality: {backgroundSettings.quality.toUpperCase()}
                      </label>
                      <select
                        value={backgroundSettings.quality}
                        onChange={(e) => setBackgroundSettings(prev => ({ 
                          ...prev, 
                          quality: e.target.value as "high" | "medium" | "low" 
                        }))}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="high">High Quality</option>
                        <option value="medium">Medium Quality</option>
                        <option value="low">Low Quality</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">
                        Edge Smoothing: {backgroundSettings.edgeSmoothing}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={backgroundSettings.edgeSmoothing}
                        onChange={(e) => setBackgroundSettings(prev => ({ 
                          ...prev, 
                          edgeSmoothing: parseInt(e.target.value) 
                        }))}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Sharp</span>
                        <span>Smooth</span>
                      </div>
                    </div>

                    {backgroundSettings.type === "blur" && (
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Blur Intensity: {backgroundSettings.blurAmount}px
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={backgroundSettings.blurAmount}
                          onChange={(e) => setBackgroundSettings(prev => ({ 
                            ...prev, 
                            blurAmount: parseInt(e.target.value) 
                          }))}
                          className="w-full accent-purple-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Dashboard */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
              <h3 className="text-xl font-semibold flex items-center space-x-2 mb-6">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span>Performance Monitor</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-slate-300">CPU Usage</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {performanceMetrics.cpuUsage.toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${performanceMetrics.cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-slate-300">Memory</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {performanceMetrics.memoryUsage.toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${performanceMetrics.memoryUsage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-300">AI Engine Status</span>
                    <div className={`w-3 h-3 rounded-full ${
                      connectionState.isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    }`}></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Version:</span>
                      <span className="text-blue-400 font-mono">{connectionState.serverVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Server Load:</span>
                      <span className="text-purple-400">{connectionState.serverLoad.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uptime:</span>
                      <span className="text-cyan-400 font-mono">{formatUptime(performanceMetrics.uptime)}</span>
                    </div>
                    {connectionState.reconnectCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reconnects:</span>
                        <span className="text-yellow-400">{connectionState.reconnectCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                {streamState.isStreaming && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="flex items-center space-x-2 mb-3">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">Session Statistics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400 block">Frames Processed</span>
                        <span className="text-white font-semibold">{sessionStats.processedFrames.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Session Duration</span>
                        <span className="text-white font-semibold">{formatUptime(Date.now() - sessionStats.startTime)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
              <h3 className="text-xl font-semibold flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-orange-400" />
                <span>System Activity</span>
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {logs.length === 0 ? (
                  <div className="text-slate-500 text-sm italic text-center py-8">
                    No activity logged yet...
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index} 
                      className="text-sm font-mono text-slate-300 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors border-l-2 border-slate-600"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Setup Instructions (when disconnected) */}
        {!connectionState.isConnected && (
          <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8">
            Connect to AI for
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pb-6">
          <div className="flex items-center justify-center space-x-8 text-sm text-slate-400 mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Real-time AI Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-green-400" />
              <span>Scalable Architecture</span>
            </div>
          </div>
          <p className="text-slate-500">
            Professional AI Background Studio • Powered by MediaPipe • Built for Enterprise
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;