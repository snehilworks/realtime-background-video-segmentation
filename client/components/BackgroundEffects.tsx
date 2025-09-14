"use client";

import React, { useState, useCallback } from 'react';
import { 
  Sparkles, 
  Palette, 
  Zap, 
  Droplets, 
  Sun, 
  Moon,
  Star,
  Heart,
  Snowflake,
  Flame
} from 'lucide-react';

interface BackgroundEffectsProps {
  onEffectChange: (effect: string, intensity: number) => void;
  currentEffect: string;
  currentIntensity: number;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  onEffectChange,
  currentEffect,
  currentIntensity
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const effects = [
    { id: 'none', name: 'None', icon: Sparkles, color: 'text-slate-400' },
    { id: 'blur', name: 'Motion Blur', icon: Zap, color: 'text-blue-400' },
    { id: 'vintage', name: 'Vintage', icon: Palette, color: 'text-amber-400' },
    { id: 'rain', name: 'Rain', icon: Droplets, color: 'text-cyan-400' },
    { id: 'sunset', name: 'Sunset', icon: Sun, color: 'text-orange-400' },
    { id: 'night', name: 'Night Mode', icon: Moon, color: 'text-indigo-400' },
    { id: 'stars', name: 'Starry Sky', icon: Star, color: 'text-purple-400' },
    { id: 'hearts', name: 'Hearts', icon: Heart, color: 'text-pink-400' },
    { id: 'snow', name: 'Snow', icon: Snowflake, color: 'text-blue-300' },
    { id: 'fire', name: 'Fire', icon: Flame, color: 'text-red-400' },
  ];

  const handleEffectSelect = useCallback((effectId: string) => {
    onEffectChange(effectId, currentIntensity);
  }, [onEffectChange, currentIntensity]);

  const handleIntensityChange = useCallback((intensity: number) => {
    onEffectChange(currentEffect, intensity);
  }, [onEffectChange, currentEffect]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Background Effects</span>
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Effect Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {effects.map((effect) => {
          const Icon = effect.icon;
          const isSelected = currentEffect === effect.id;
          
          return (
            <button
              key={effect.id}
              onClick={() => handleEffectSelect(effect.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                isSelected
                  ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                  : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
              }`}
            >
              <div className="text-center">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-purple-400' : effect.color}`} />
                <div className={`text-sm font-medium ${isSelected ? 'text-purple-300' : 'text-slate-300'}`}>
                  {effect.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Intensity Control */}
      {currentEffect !== 'none' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Effect Intensity</span>
            <span className="text-sm text-purple-400 font-mono">{currentIntensity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentIntensity}
            onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Subtle</span>
            <span>Intense</span>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Advanced Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-2">Animation Speed</label>
              <select className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm">
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 block mb-2">Particle Count</label>
              <select className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="syncWithAudio"
              className="w-4 h-4 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-500"
            />
            <label htmlFor="syncWithAudio" className="text-sm text-slate-300">
              Sync effects with audio (if available)
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="randomizeEffects"
              className="w-4 h-4 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-500"
            />
            <label htmlFor="randomizeEffects" className="text-sm text-slate-300">
              Randomize effect parameters
            </label>
          </div>
        </div>
      )}

      {/* Effect Preview */}
      {currentEffect !== 'none' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Effect Preview</span>
          </div>
          <div className="text-xs text-purple-200/80">
            {currentEffect === 'blur' && 'Motion blur effect applied to background elements'}
            {currentEffect === 'vintage' && 'Vintage film grain and color grading applied'}
            {currentEffect === 'rain' && 'Animated rain particles overlay'}
            {currentEffect === 'sunset' && 'Warm sunset color grading and glow effects'}
            {currentEffect === 'night' && 'Dark mode with enhanced contrast and blue tones'}
            {currentEffect === 'stars' && 'Twinkling star particles across the background'}
            {currentEffect === 'hearts' && 'Floating heart particles with romantic theme'}
            {currentEffect === 'snow' && 'Falling snow particles for winter theme'}
            {currentEffect === 'fire' && 'Flickering fire particles and warm glow'}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundEffects;