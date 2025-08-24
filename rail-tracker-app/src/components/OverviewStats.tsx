import { Clock, Train, MapPin, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { TrainData } from '../types/train';
import { formatDelayTime, generateDelayDistribution, getRouteTrainNumber } from '../utils/dataProcessing';

interface OverviewStatsProps {
  data: TrainData;
}

export default function OverviewStats({ data }: OverviewStatsProps) {
  const stats = data.statistics;
  const delayDistribution = generateDelayDistribution(data.records);
  

  const totalDelayHours = Math.round(data.records.reduce((sum, record) => sum + record.delay_minutes, 0) / 60);
  const maxDelayRecord = data.records.reduce((max, record) => 
    record.delay_minutes > max.delay_minutes ? record : max
  );
  
  const averageDelaysPerDay = Math.round(stats.total_records / 
    (new Date(stats.date_range.end).getTime() - new Date(stats.date_range.start).getTime()) * 24 * 60 * 60 * 1000
  );

  return (
    <div className="space-y-8">

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Railway Delay Analytics Dashboard
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive analysis of train delays across Ukraine's railway network from{' '}
          <span className="font-semibold">{new Date(stats.date_range.start).toLocaleDateString()}</span> to{' '}
          <span className="font-semibold">{new Date(stats.date_range.end).toLocaleDateString()}</span>
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Records</p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.total_records.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Train className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            Delay incidents tracked
          </p>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Unique Trains</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.unique_trains}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            Different train services
          </p>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Average Delay</p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats.delay_stats.average_minutes.toFixed(1)}m
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-yellow-600 mt-2">
            Per incident
          </p>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Max Delay</p>
              <p className="text-3xl font-bold text-red-900">
                {formatDelayTime(stats.delay_stats.maximum_minutes)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">
            Worst recorded delay
          </p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            System Impact
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Delay Hours</span>
              <span className="font-semibold">{totalDelayHours.toLocaleString()}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unique Routes</span>
              <span className="font-semibold">{stats.unique_routes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Delays/Day</span>
              <span className="font-semibold">{averageDelaysPerDay}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Delay Distribution
          </h3>
          <div className="space-y-3">
            {delayDistribution.map((dist) => (
              <div key={dist.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: dist.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{dist.range}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{dist.percentage}%</span>
                  <span className="text-xs text-gray-500 ml-1">({dist.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Worst Delay Record
          </h3>
          <div className="space-y-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="font-semibold text-red-900">
                Train {maxDelayRecord.train_number}
              </p>
              <p className="text-sm text-red-700 truncate" title={`#${getRouteTrainNumber(data.records, maxDelayRecord.route)}: ${maxDelayRecord.route}`}>
                #{getRouteTrainNumber(data.records, maxDelayRecord.route)}: {maxDelayRecord.route}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-red-600">
                  {new Date(maxDelayRecord.timestamp).toLocaleDateString()}
                </span>
                <span className="font-bold text-red-900">
                  +{formatDelayTime(maxDelayRecord.delay_minutes)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-blue-600" />
          Most Delayed Routes
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.most_delayed_routes.slice(0, 6).map((route, index) => (
            <div key={route.route} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate" title={`#${getRouteTrainNumber(data.records, route.route)}: ${route.route}`}>
                  #{getRouteTrainNumber(data.records, route.route)}: {route.route}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {route.total_records} incidents
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    Avg: {route.avg_delay_minutes}m
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Train className="w-6 h-6 mr-2 text-blue-600" />
          Most Delayed Trains
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.most_delayed_trains.slice(0, 6).map((train, index) => (
            <div key={train.train_number} className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">#{train.train_number}</h4>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Delay:</span>
                  <span className="font-semibold text-red-600">{train.avg_delay_minutes}m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Delay:</span>
                  <span className="font-semibold">{formatDelayTime(train.max_delay)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Incidents:</span>
                  <span className="font-semibold">{train.total_records}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}