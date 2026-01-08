import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wheel, Segment } from '../types';
import { StorageService } from '../services/storageService';
import WheelCanvas, { WheelHandle } from './WheelCanvas';
import { ArrowLeft, RefreshCcw, PartyPopper } from 'lucide-react';

const SpinPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [wheel, setWheel] = useState<Wheel | null>(null);
  const [winner, setWinner] = useState<Segment | null>(null);
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

  if (!wheel) return <div className="text-center py-20">Loading Wheel...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="mb-4 w-full max-w-2xl px-4 flex justify-between items-center">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
           <ArrowLeft className="w-4 h-4 mr-1"/> Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{wheel.title}</h1>
      </div>

      <div className="relative p-8 bg-white rounded-2xl shadow-xl border-4 border-indigo-100">
        <WheelCanvas 
            ref={wheelRef} 
            segments={wheel.segments} 
            onSpinEnd={handleSpinEnd}
            width={500}
            height={500}
        />
        
        {/* Center Spin Button Overlay if not spinning */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4">
             <button
                onClick={spin}
                disabled={wheelRef.current?.isSpinning}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:scale-100 text-lg"
             >
                {wheelRef.current?.isSpinning ? 'Spinning...' : 'SPIN!'}
             </button>
             {winner && (
                 <button
                    onClick={reset}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-full shadow-md transition"
                 >
                    <RefreshCcw className="w-5 h-5" />
                 </button>
             )}
        </div>
      </div>

      {winner && (
        <div className="mt-8 animate-bounce bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-8 py-4 rounded-xl flex items-center shadow-lg">
            <PartyPopper className="w-8 h-8 mr-3 text-yellow-600" />
            <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-yellow-600">Winner</p>
                <p className="text-3xl font-extrabold">{winner.label}</p>
            </div>
            <PartyPopper className="w-8 h-8 ml-3 text-yellow-600 transform scale-x-[-1]" />
        </div>
      )}
    </div>
  );
};

export default SpinPage;