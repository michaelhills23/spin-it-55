import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wheel, Segment } from '../types';
import { StorageService } from '../services/storageService';
import WheelCanvas, { WheelHandle } from './WheelCanvas';
import { ArrowLeft, RefreshCcw, PartyPopper, ExternalLink, Share2, Check } from 'lucide-react';

const SpinPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [wheel, setWheel] = useState<Wheel | null>(null);
  const [winner, setWinner] = useState<Segment | null>(null);
  const [copied, setCopied] = useState(false);
  const wheelRef = useRef<WheelHandle>(null);

  useEffect(() => {
    if (id) {
      StorageService.getWheel(id).then(w => {
        if(w) setWheel(w);
      });
    }
  }, [id]);

  const handleSpinEnd = (result: Segment) => {
    setWinner(result);
    // Record spin
    if (wheel) {
        StorageService.recordSpin({
            id: Date.now().toString(),
            wheelId: wheel.id,
            segmentId: result.id,
            segmentLabel: result.label,
            timestamp: new Date().toISOString()
        });
    }
  };

  const spin = () => {
    setWinner(null);
    wheelRef.current?.spin();
  };

  const reset = () => {
    setWinner(null);
    wheelRef.current?.reset();
  };

  const share = () => {
     const url = window.location.href;
     navigator.clipboard.writeText(url);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  if (!wheel) return <div className="text-center py-20">Loading Wheel...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] pb-12">
      <div className="mb-6 w-full max-w-2xl px-4 flex justify-between items-center">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
           <ArrowLeft className="w-4 h-4 mr-1"/> Dashboard
        </Link>
        <button 
            onClick={share}
            className="text-gray-500 hover:text-indigo-600 flex items-center space-x-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
        >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
        </button>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{wheel.title}</h1>

      <div className="relative p-8 bg-white rounded-3xl shadow-2xl border-4 border-indigo-100 mb-8">
        <WheelCanvas 
            ref={wheelRef} 
            segments={wheel.segments} 
            onSpinEnd={handleSpinEnd}
            width={500}
            height={500}
        />
        
        {/* Center Spin Button Overlay if not spinning */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center space-x-4 z-10">
             <button
                onClick={spin}
                disabled={wheelRef.current?.isSpinning}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-full shadow-xl transform transition hover:scale-105 disabled:opacity-50 disabled:scale-100 text-xl border-4 border-white"
             >
                {wheelRef.current?.isSpinning ? 'Spinning...' : 'SPIN!'}
             </button>
             {winner && (
                 <button
                    onClick={reset}
                    className="bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-full shadow-xl border-4 border-white transition hover:scale-105"
                    title="Reset"
                 >
                    <RefreshCcw className="w-6 h-6" />
                 </button>
             )}
        </div>
      </div>

      {winner && (
        <div className="mt-6 w-full max-w-md animate-bounce-in mx-4">
             <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-orange-400"></div>
                
                <div className="flex justify-center mb-3">
                     <PartyPopper className="w-10 h-10 text-yellow-500" />
                </div>
                
                <p className="text-sm font-bold uppercase tracking-wider text-yellow-600 mb-1">We have a winner!</p>
                <p className="text-4xl font-extrabold text-gray-900 mb-6">{winner.label}</p>
                
                {winner.url && (
                    <a 
                        href={winner.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
                    >
                        Visit Link <ExternalLink className="ml-2 -mr-1 w-5 h-5" />
                    </a>
                )}
             </div>
        </div>
      )}
    </div>
  );
};

export default SpinPage;