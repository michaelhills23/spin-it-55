import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wheel, Segment } from '../types';
import { StorageService } from '../services/storageService';
import { generateWheelConfig } from '../services/geminiService';
import { Plus, Trash2, Wand2, Save, ArrowLeft, RefreshCw } from 'lucide-react';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
];

const WheelEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [segments, setSegments] = useState<Segment[]>([
    { id: '1', label: 'Yes', weight: 1, color: COLORS[4] },
    { id: '2', label: 'No', weight: 1, color: COLORS[0] }
  ]);
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      loadWheel(id);
    }
  }, [id]);

  const loadWheel = async (wheelId: string) => {
    setLoading(true);
    const wheel = await StorageService.getWheel(wheelId);
    if (wheel) {
      setTitle(wheel.title);
      setSegments(wheel.segments);
    } else {
        // If not found (or access denied), redirect
        navigate('/');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || segments.length < 2) {
      alert("Please provide a title and at least 2 segments.");
      return;
    }

    const currentUser = StorageService.getUser();
    if (!currentUser) {
        alert("You must be logged in to save.");
        return;
    }

    const wheel: Wheel = {
      id: id || Date.now().toString(),
      title,
      segments,
      createdAt: id ? (await StorageService.getWheel(id))?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: true, // Default to public
      userId: currentUser.id
    };

    try {
        await StorageService.saveWheel(wheel);
        navigate('/');
    } catch (e) {
        alert("Error saving wheel");
        console.error(e);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const config = await generateWheelConfig(aiPrompt);
      if (config.title) setTitle(config.title);
      if (config.segments) setSegments(config.segments as Segment[]);
    } catch (error) {
      console.error(error);
      alert("Failed to generate wheel. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addSegment = () => {
    setSegments([...segments, {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Option',
      weight: 1,
      color: COLORS[segments.length % COLORS.length]
    }]);
  };

  const updateSegment = (index: number, field: keyof Segment, value: string | number) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
  };

  const removeSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <button onClick={() => navigate('/')} className="mb-6 flex items-center text-gray-500 hover:text-gray-700 transition">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Wheel Configuration</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Wheel Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Dinner Options"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium text-gray-900">Segments</h3>
                    <button onClick={addSegment} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                        <Plus className="w-4 h-4 mr-1"/> Add Segment
                    </button>
                </div>
                
                <div className="space-y-3">
                    {segments.map((segment, index) => (
                        <div key={segment.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <input
                                type="color"
                                value={segment.color}
                                onChange={(e) => updateSegment(index, 'color', e.target.value)}
                                className="h-8 w-8 rounded cursor-pointer border-none bg-transparent"
                                title="Segment Color"
                            />
                            <input
                                type="text"
                                value={segment.label}
                                onChange={(e) => updateSegment(index, 'label', e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                placeholder="Label"
                            />
                            <input
                                type="number"
                                min="1"
                                value={segment.weight}
                                onChange={(e) => updateSegment(index, 'weight', parseInt(e.target.value) || 1)}
                                className="w-20 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                placeholder="Weight"
                                title="Probability Weight"
                            />
                            <button
                                onClick={() => removeSegment(index)}
                                className="text-red-400 hover:text-red-600 p-1"
                                disabled={segments.length <= 2}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center space-x-2 mb-4">
                    <Wand2 className="w-6 h-6 text-yellow-300" />
                    <h3 className="text-lg font-bold">Magic Generator</h3>
                </div>
                <p className="text-indigo-100 text-sm mb-4">
                    Describe what you need a wheel for, and AI will generate the segments for you.
                </p>
                <textarea
                    className="w-full px-3 py-2 rounded-md text-gray-900 text-sm mb-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                    rows={3}
                    placeholder="e.g., Best sci-fi movies of the 90s..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-2 px-4 rounded-md shadow-sm transition flex justify-center items-center"
                >
                    {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-md font-bold mb-3 text-gray-900">Actions</h3>
                <button
                    onClick={handleSave}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md shadow-sm transition flex justify-center items-center"
                >
                    <Save className="w-5 h-5 mr-2" />
                    Save Wheel
                </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WheelEditor;