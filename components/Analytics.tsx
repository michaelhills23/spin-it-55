import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { AnalyticsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft } from 'lucide-react';

const Analytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [wheelName, setWheelName] = useState('');

  useEffect(() => {
    if (id) {
      StorageService.getWheel(id).then(w => setWheelName(w?.title || 'Unknown Wheel'));
      StorageService.getAnalytics(id).then(setData);
    }
  }, [id]);

  if (!data) return <div className="text-center py-20">Loading Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-0">
        <div className="mb-8">
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center mb-4">
                <ArrowLeft className="w-4 h-4 mr-1"/> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Analytics: {wheelName}</h1>
            <p className="text-gray-500 mt-2">Total Spins: <span className="font-bold text-gray-900">{data.totalSpins}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Distribution Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Result Distribution</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Timeline Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Spins Over Time</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.timeline}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{fill: '#f3f4f6'}} />
                            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Analytics;