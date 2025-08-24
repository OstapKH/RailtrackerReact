import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { MonthlyDelayStats } from '../types/train';
import { formatDelayTime } from '../utils/dataProcessing';

interface RouteTimelineChartProps {
  data: MonthlyDelayStats[];
  title?: string;
}

export default function RouteTimelineChart({ data, title = "Monthly Delay Trends" }: RouteTimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          {title}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No monthly data available
        </div>
      </div>
    );
  }


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600">
            Average Delay: <span className="font-medium">{formatDelayTime(data.averageDelay)}</span>
          </p>
          <p className="text-gray-600">
            Incidents: <span className="font-medium">{data.totalIncidents}</span>
          </p>
          <p className="text-red-600">
            Max Delay: <span className="font-medium">{formatDelayTime(data.maxDelay)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        {title}
      </h3>
      

      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Average Delay by Month</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="monthYear" 
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#64748b"
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="averageDelay" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Number of Incidents by Month</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="monthYear" 
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#64748b" />
              <Tooltip 
                formatter={(value: number, name: string) => [value, 'Incidents']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="totalIncidents" 
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {data.length}
          </p>
          <p className="text-sm text-gray-600">Months with Data</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {formatDelayTime(Math.min(...data.map(d => d.averageDelay)))}
          </p>
          <p className="text-sm text-gray-600">Best Month Avg</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {formatDelayTime(Math.max(...data.map(d => d.averageDelay)))}
          </p>
          <p className="text-sm text-gray-600">Worst Month Avg</p>
        </div>
      </div>
    </div>
  );
}