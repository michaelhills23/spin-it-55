import React, { useEffect, useState } from 'react';
import { Wheel } from '../types';
import { StorageService } from '../services/storageService';
import { Link } from 'react-router-dom';
import { Edit, PlayCircle, BarChart2, Trash2, Clock, Share2, Copy, Check } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadWheels();
  }, []);

  const loadWheels = async () => {
    const data = await StorageService.getWheels();
    setWheels(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if(window.confirm("Are you sure you want to delete this wheel?")) {
        await StorageService.deleteWheel(id);
        loadWheels();
    }
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const url = `${window.location.origin}/#/spin/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading your wheels...</div>;

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wheels</h1>
        <Link to="/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium flex items-center">
            Create New
        </Link>
      </div>

      {wheels.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No wheels yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new spin wheel.</p>
            <div className="mt-6">
                <Link to="/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    <PlayCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Wheel
                </Link>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wheels.map((wheel) => (
            <div key={wheel.id} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{wheel.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 border border-gray-200">
                        {wheel.segments.length} segments
                    </span>
                </div>
                <div className="text-sm text-gray-500 mb-6 flex items-center">
                    <Clock className="w-4 h-4 mr-1"/>
                    Updated {new Date(wheel.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/spin/${wheel.id}`}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Spin
                  </Link>
                  <button
                    onClick={(e) => handleShare(e, wheel.id)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    title="Copy Share Link"
                  >
                    {copiedId === wheel.id ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <Link
                    to={`/edit/${wheel.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/analytics/${wheel.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    title="Analytics"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </Link>
                   <button
                    onClick={(e) => handleDelete(e, wheel.id)}
                    className="inline-flex items-center px-3 py-2 border border-red-200 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex space-x-1 overflow-hidden">
                    {wheel.segments.slice(0, 10).map((s, i) => (
                        <div key={i} className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} title={s.label}></div>
                    ))}
                    {wheel.segments.length > 10 && <span className="text-xs text-gray-400">...</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;