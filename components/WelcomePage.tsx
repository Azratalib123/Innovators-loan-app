
import React from 'react';
import { Landmark, ArrowRight, Sparkles, Activity } from 'lucide-react';

interface WelcomePageProps {
  onStart: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white flex flex-col relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 text-center">
        <div className="mb-10 relative group">
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className="bg-gray-800/80 p-6 rounded-3xl border border-gray-700 backdrop-blur-sm shadow-2xl relative">
            <Landmark size={80} className="text-blue-400" />
          </div>
        </div>
        
        <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">
            MLMS.AI
            </h1>
            
            <h2 className="text-xl md:text-2xl font-medium text-blue-200">
            AI Microfinance Loan Management System
            </h2>
            
            <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
            Empowering financial inclusion with next-generation AI risk assessment and seamless loan processing.
            </p>
        </div>

        <div className="mt-12 mb-16 space-y-6">
             <p className="text-3xl font-light tracking-wide text-white animate-fade-in">
            Welcome
            </p>
            <button 
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>

      {/* Footer */}
      <div className="z-10 py-8 text-center border-t border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs md:text-sm uppercase tracking-[0.3em] font-medium">
          <Sparkles size={14} className="text-blue-400" />
          <span>Innovators</span>
          <Activity size={14} className="text-purple-400" />
        </div>
      </div>
    </div>
  );
};
