"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, Cpu, Activity, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceData {
  fps: number;
  latency: number;
  cpuUsage: number;
  memoryUsage: number;
  frameDrops: number;
  networkLatency: number;
  processingTime: number;
  timestamp: number;
}

interface PerformanceDashboardProps {
  data: PerformanceData[];
  isConnected: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ data, isConnected }) => {
  const [selectedMetric, setSelectedMetric] = useState<'fps' | 'latency' | 'cpu' | 'memory'>('fps');
  
  const getPerformanceScore = () => {
    if (data.length === 0) return 0;
    
    const recent = data.slice(-10);
    const avgFps = recent.reduce((sum, d) => sum + d.fps, 0) / recent.length;
    const avgLatency = recent.reduce((sum, d) => sum + d.latency, 0) / recent.length;
    const avgCpu = recent.reduce((sum, d) => sum + d.cpuUsage, 0) / recent.length;
    
    const fpsScore = Math.min(avgFps / 30, 1) * 25;
    const latencyScore = Math.max(0, 1 - avgLatency / 100) * 25;
    const cpuScore = Math.max(0, 1 - avgCpu / 100) * 25;
    const stabilityScore = 25; // Based on frame drops
    
    return Math.round(fpsScore + latencyScore + cpuScore + stabilityScore);
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { grade: 'D', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const performanceScore = getPerformanceScore();
  const grade = getPerformanceGrade(performanceScore);

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>AI Performance Analytics</span>
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${grade.bg} ${grade.color}`}>
          {grade.grade} ({performanceScore}/100)
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-300">FPS Trend</span>
          </div>
          <div className="h-20 flex items-end space-x-1">
            {data.slice(-20).map((d, i) => (
              <div
                key={i}
                className="bg-green-400 rounded-t"
                style={{
                  height: `${(d.fps / 60) * 100}%`,
                  width: '4px',
                  minHeight: '2px'
                }}
              />
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Current: {data[data.length - 1]?.fps || 0} FPS
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Latency Trend</span>
          </div>
          <div className="h-20 flex items-end space-x-1">
            {data.slice(-20).map((d, i) => (
              <div
                key={i}
                className="bg-blue-400 rounded-t"
                style={{
                  height: `${Math.min((d.latency / 100) * 100, 100)}%`,
                  width: '4px',
                  minHeight: '2px'
                }}
              />
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Current: {data[data.length - 1]?.latency || 0}ms
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">CPU Usage</span>
            <span className="text-sm font-mono text-white">
              {data[data.length - 1]?.cpuUsage?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${data[data.length - 1]?.cpuUsage || 0}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Memory Usage</span>
            <span className="text-sm font-mono text-white">
              {data[data.length - 1]?.memoryUsage?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${data[data.length - 1]?.memoryUsage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Performance Insights</h4>
        <div className="space-y-2 text-xs">
          {performanceScore >= 90 && (
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Excellent performance - AI processing at optimal levels</span>
            </div>
          )}
          {performanceScore < 70 && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Consider reducing video quality for better performance</span>
            </div>
          )}
          {data[data.length - 1]?.frameDrops > 5 && (
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="w-3 h-3" />
              <span>High frame drops detected - check system resources</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;