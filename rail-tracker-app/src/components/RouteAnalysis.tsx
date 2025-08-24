import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, TrendingUp, Clock, Train, Search, Filter, ArrowUpDown } from 'lucide-react';
import { TrainData, RouteDetailData } from '../types/train';
import { 
  generateRouteDelayData, 
  formatDelayTime,
  getDelayBadgeClass,
  generateRouteDetailData,
  getRouteTrainNumber
} from '../utils/dataProcessing';
import RouteDetailModal from './RouteDetailModal';

interface RouteAnalysisProps {
  data: TrainData;
}

export default function RouteAnalysis({ data }: RouteAnalysisProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'averageDelay' | 'totalRecords' | 'maxDelay'>('averageDelay');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showLimit, setShowLimit] = useState(20);
  

  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routeDetailData, setRouteDetailData] = useState<RouteDetailData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const allRouteData = useMemo(() => {
    return generateRouteDelayData(data.records, 1000);
  }, [data.records]);


  const filteredRoutes = useMemo(() => {
    let filtered = allRouteData;


    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(route => 
        route.route.toLowerCase().includes(query)
      );
    }


    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'averageDelay':
          comparison = a.averageDelay - b.averageDelay;
          break;
        case 'totalRecords':
          comparison = a.totalRecords - b.totalRecords;
          break;
        case 'maxDelay':
          comparison = a.maxDelay - b.maxDelay;
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered.slice(0, showLimit);
  }, [allRouteData, searchQuery, sortBy, sortDirection, showLimit]);


  const chartData = filteredRoutes
    .sort((a, b) => b.totalRecords - a.totalRecords)
    .slice(0, 10)
    .map(route => ({
      ...route,
      shortRoute: route.route.length > 30 ? route.route.substring(0, 30) + '...' : route.route
    }));


  const totalRoutes = allRouteData.length;
  const avgDelayAcrossRoutes = allRouteData.reduce((sum, route) => sum + route.averageDelay, 0) / totalRoutes;
  const worstRoute = allRouteData[0];
  const bestRoute = allRouteData.reduce((min, route) => route.averageDelay < min.averageDelay ? route : min);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return (
      <ArrowUpDown className={`w-4 h-4 ${
        sortDirection === 'asc' ? 'text-blue-600 rotate-180' : 'text-blue-600'
      }`} />
    );
  };


  const handleRouteClick = (routeName: string) => {
    const detailData = generateRouteDetailData(data.records, routeName);
    setRouteDetailData(detailData);
    setSelectedRoute(routeName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoute(null);
    setRouteDetailData(null);
  };

  return (
    <div className="space-y-8">

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
          <MapPin className="w-8 h-8 mr-3 text-blue-600" />
          Route Analysis
        </h2>
        <p className="text-lg text-gray-600">
          Comprehensive analysis of delays across {totalRoutes} different routes
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Routes</p>
              <p className="text-3xl font-bold text-blue-900">{totalRoutes}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Delay</p>
              <p className="text-3xl font-bold text-green-900">
                {avgDelayAcrossRoutes.toFixed(1)}m
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Worst Route</p>
              <p className="text-lg font-bold text-red-900">
                {worstRoute.averageDelay.toFixed(1)}m
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-xs text-red-600 mt-1 truncate" title={`#${getRouteTrainNumber(data.records, worstRoute.route)}: ${worstRoute.route}`}>
            #{getRouteTrainNumber(data.records, worstRoute.route)}: {worstRoute.route.substring(0, 20)}...
          </p>
        </div>

        <div className="card bg-emerald-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Best Route</p>
              <p className="text-lg font-bold text-emerald-900">
                {bestRoute.averageDelay.toFixed(1)}m
              </p>
            </div>
            <Train className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-xs text-emerald-600 mt-1 truncate" title={`#${getRouteTrainNumber(data.records, bestRoute.route)}: ${bestRoute.route}`}>
            #{getRouteTrainNumber(data.records, bestRoute.route)}: {bestRoute.route.substring(0, 20)}...
          </p>
        </div>
      </div>


      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Top 10 Routes by Incidents Reported
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="shortRoute"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                stroke="#64748b"
              />
              <YAxis stroke="#64748b" />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value}`,
                  name === 'totalRecords' ? 'Incidents' : name
                ]}
                labelFormatter={(label, payload) => {
                  const route = payload?.[0]?.payload?.route;
                  if (route) {
                    const trainNumber = getRouteTrainNumber(data.records, route);
                    return `#${trainNumber}: ${route}`;
                  }
                  return label;
                }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="totalRecords" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Route Details
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search routes..."
                className="input pl-10 min-w-64"
              />
            </div>
            <select
              value={showLimit}
              onChange={(e) => setShowLimit(parseInt(e.target.value))}
              className="input"
            >
              <option value={20}>Show 20</option>
              <option value={50}>Show 50</option>
              <option value={100}>Show 100</option>
              <option value={500}>Show 500</option>
            </select>
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Route
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('averageDelay')}
                >
                  <div className="flex items-center gap-2">
                    Average Delay
                    {getSortIcon('averageDelay')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('maxDelay')}
                >
                  <div className="flex items-center gap-2">
                    Max Delay
                    {getSortIcon('maxDelay')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalRecords')}
                >
                  <div className="flex items-center gap-2">
                    Incidents
                    {getSortIcon('totalRecords')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRoutes.map((route, index) => (
                <tr 
                  key={route.route} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRouteClick(route.route)}
                  title="Click to view detailed statistics"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-blue-600">
                          #{(sortBy === 'averageDelay' && sortDirection === 'desc') ? index + 1 : '—'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900" title={`#${getRouteTrainNumber(data.records, route.route)}: ${route.route}`}>
                          #{getRouteTrainNumber(data.records, route.route)}: {route.route}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={getDelayBadgeClass(route.averageDelay)}>
                      {route.averageDelay.toFixed(1)}m
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">
                      {formatDelayTime(route.maxDelay)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900 font-medium">
                      {route.totalRecords}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {searchQuery && filteredRoutes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No routes found matching "{searchQuery}"
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {filteredRoutes.length} of {allRouteData.length} routes
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>


      <RouteDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        routeName={selectedRoute || ''}
        routeData={routeDetailData}
        allRecords={data.records}
      />
    </div>
  );
}