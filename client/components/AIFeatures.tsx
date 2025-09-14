"use client";

import React, { useState, useCallback } from 'react';
import { 
  Hand, 
  Eye, 
  Brain, 
  Zap, 
  Settings, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Lightbulb,
  Target
} from 'lucide-react';

interface AIFeaturesProps {
  onGestureDetected: (gesture: string) => void;
  onPoseDetected: (pose: any) => void;
  onEmotionDetected: (emotion: string) => void;
}

const AIFeatures: React.FC<AIFeaturesProps> = ({
  onGestureDetected,
  onPoseDetected,
  onEmotionDetected
}) => {
  const [features, setFeatures] = useState({
    gestureControl: false,
    poseEstimation: false,
    emotionDetection: false,
    virtualLighting: false,
    autoBackground: false,
    smartCropping: false,
  });

  const [gestureHistory, setGestureHistory] = useState<string[]>([]);
  const [emotionHistory, setEmotionHistory] = useState<string[]>([]);

  const toggleFeature = useCallback((feature: keyof typeof features) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  }, []);

  const handleGesture = useCallback((gesture: string) => {
    setGestureHistory(prev => [...prev.slice(-4), gesture]);
    onGestureDetected(gesture);
  }, [onGestureDetected]);

  const handleEmotion = useCallback((emotion: string) => {
    setEmotionHistory(prev => [...prev.slice(-4), emotion]);
    onEmotionDetected(emotion);
  }, [onEmotionDetected]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-xl font-semibold">Advanced AI Features</h3>
        <div className="ml-auto px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
          Beta
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-4">
        {/* Gesture Control */}
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Hand className="w-5 h-5 text-blue-400" />
            <div>
              <div className="font-medium text-white">Gesture Control</div>
              <div className="text-sm text-slate-400">Control backgrounds with hand gestures</div>
            </div>
          </div>
          <button
            onClick={() => toggleFeature('gestureControl')}
            className="flex items-center"
          >
            {features.gestureControl ? (
              <ToggleRight className="w-6 h-6 text-blue-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Pose Estimation */}
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-green-400" />
            <div>
              <div className="font-medium text-white">Pose Estimation</div>
              <div className="text-sm text-slate-400">Track body posture for virtual lighting</div>
            </div>
          </div>
          <button
            onClick={() => toggleFeature('poseEstimation')}
            className="flex items-center"
          >
            {features.poseEstimation ? (
              <ToggleRight className="w-6 h-6 text-green-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Emotion Detection */}
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-pink-400" />
            <div>
              <div className="font-medium text-white">Emotion Detection</div>
              <div className="text-sm text-slate-400">Adapt backgrounds based on emotions</div>
            </div>
          </div>
          <button
            onClick={() => toggleFeature('emotionDetection')}
            className="flex items-center"
          >
            {features.emotionDetection ? (
              <ToggleRight className="w-6 h-6 text-pink-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Virtual Lighting */}
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="font-medium text-white">Virtual Lighting</div>
              <div className="text-sm text-slate-400">AI-powered lighting adjustment</div>
            </div>
          </div>
          <button
            onClick={() => toggleFeature('virtualLighting')}
            className="flex items-center"
          >
            {features.virtualLighting ? (
              <ToggleRight className="w-6 h-6 text-yellow-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Auto Background */}
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <div className="font-medium text-white">Smart Backgrounds</div>
              <div className="text-sm text-slate-400">AI suggests optimal backgrounds</div>
            </div>
          </div>
          <button
            onClick={() => toggleFeature('autoBackground')}
            className="flex items-center"
          >
            {features.autoBackground ? (
              <ToggleRight className="w-6 h-6 text-purple-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* AI Activity Feed */}
      {(features.gestureControl || features.emotionDetection) && (
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>AI Activity Feed</span>
          </h4>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {gestureHistory.length === 0 && emotionHistory.length === 0 ? (
              <div className="text-slate-500 text-sm italic text-center py-4">
                AI features will appear here when active...
              </div>
            ) : (
              <>
                {gestureHistory.map((gesture, index) => (
                  <div key={`gesture-${index}`} className="flex items-center space-x-2 text-sm">
                    <Hand className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-300">Gesture detected:</span>
                    <span className="text-blue-400 font-medium">{gesture}</span>
                  </div>
                ))}
                {emotionHistory.map((emotion, index) => (
                  <div key={`emotion-${index}`} className="flex items-center space-x-2 text-sm">
                    <Eye className="w-3 h-3 text-pink-400" />
                    <span className="text-slate-300">Emotion detected:</span>
                    <span className="text-pink-400 font-medium">{emotion}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => handleGesture('thumbs_up')}
          className="flex items-center justify-center space-x-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
        >
          <Hand className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">Test Gesture</span>
        </button>
        
        <button
          onClick={() => handleEmotion('happy')}
          className="flex items-center justify-center space-x-2 p-3 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4 text-pink-400" />
          <span className="text-sm text-pink-300">Test Emotion</span>
        </button>
      </div>
    </div>
  );
};

export default AIFeatures;