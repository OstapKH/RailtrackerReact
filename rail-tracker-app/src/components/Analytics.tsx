import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { TrainData } from '../types/train';
import { 
  generateChartData, 
  generateHourlyDelayData, 
  generateDailyDelayData, 
  generateDelayDistribution,
  formatDate 
} from '../utils/dataProcessing';

interface AnalyticsProps {
  data: TrainData;
}

export default function Analytics({ data }: AnalyticsProps) {
  const chartData = generateChartData(data.records);
  const hourlyData = generateHourlyDelayData(data.records);
  const dailyData = generateDailyDelayData(data.records);
  const delayDistribution = generateDelayDistribution(data.records);


  const recentTrends = chartData.slice(-30);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Date: ${formatDate(label)}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('Delay') ? 'm' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const HourlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Hour: ${label}:00`}</p>
          <p style={{ color: payload[0].color }}>
            {`Avg Delay: ${payload[0].value.toFixed(1)}m`}
          </p>
          <p className="text-sm text-gray-600">
            {`Records: ${payload[0].payload.totalRecords}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#7c2d12'];

  return (
    <div className="space-y-8">

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
          Train Delay Analytics
        </h2>
        <p className="text-lg text-gray-600">
          Interactive visualizations and trends analysis
        </p>
      </div>


      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Daily Delay Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#64748b"
              />
              <YAxis stroke="#64748b" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averageDelay" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Average Delay"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="maxDelay" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Maximum Delay"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-600" />
            Delays by Hour of Day
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip content={<HourlyTooltip />} />
                <Bar 
                  dataKey="averageDelay" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Delays by Day of Week
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="dayName" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}m`, 'Average Delay']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Bar 
                  dataKey="averageDelay" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Delay Severity Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={delayDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {delayDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} incidents`,
                    'Count'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {delayDistribution.map((item, index) => (
              <div key={item.category} className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index] }}
                ></div>
                <span>{item.range}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>


        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Daily Traffic Volume
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value: number) => [`${value}`, 'Total Incidents']}
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalTrains" 
                  stroke="#f59e0b" 
                  fill="#fef3c7" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Peak Hour</h4>
          <p className="text-2xl font-bold text-blue-700">
            {hourlyData.reduce((max, hour) => 
              hour.averageDelay > max.averageDelay ? hour : max
            ).hour}:00
          </p>
          <p className="text-sm text-blue-600">
            Avg: {hourlyData.reduce((max, hour) => 
              hour.averageDelay > max.averageDelay ? hour : max
            ).averageDelay.toFixed(1)}m
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">Best Day</h4>
          <p className="text-2xl font-bold text-green-700">
            {dailyData.reduce((min, day) => 
              day.averageDelay < min.averageDelay ? day : min
            ).dayName}
          </p>
          <p className="text-sm text-green-600">
            Avg: {dailyData.reduce((min, day) => 
              day.averageDelay < min.averageDelay ? day : min
            ).averageDelay.toFixed(1)}m
          </p>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-2">Worst Day</h4>
          <p className="text-2xl font-bold text-red-700">
            {dailyData.reduce((max, day) => 
              day.averageDelay > max.averageDelay ? day : max
            ).dayName}
          </p>
          <p className="text-sm text-red-600">
            Avg: {dailyData.reduce((max, day) => 
              day.averageDelay > max.averageDelay ? day : max
            ).averageDelay.toFixed(1)}m
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">Data Points</h4>
          <p className="text-2xl font-bold text-purple-700">
            {chartData.length}
          </p>
          <p className="text-sm text-purple-600">
            Days tracked
          </p>
        </div>
      </div>
    </div>
  );
}