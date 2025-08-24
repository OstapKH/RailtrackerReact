import { useState } from 'react';
import { X, Download, ExternalLink, BarChart3 } from 'lucide-react';
import { RouteDetailData } from '../types/train';
import { getRouteTrainNumber } from '../utils/dataProcessing';
import RouteSummaryCards from './RouteSummaryCards';
import RouteTimelineChart from './RouteTimelineChart';


interface RouteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeName: string;
  routeData: RouteDetailData | null;
  allRecords: any[];
}

export default function RouteDetailModal({ 
  isOpen, 
  onClose, 
  routeName, 
  routeData,
  allRecords
}: RouteDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');

  if (!isOpen || !routeData) return null;


  const handleExport = () => {
    const exportData = {
      route: routeData.route,
      summary: {
        totalRecords: routeData.totalRecords,
        averageDelay: routeData.averageDelay,
        maxDelay: routeData.maxDelay,
        minDelay: routeData.minDelay
      },
      monthlyStats: routeData.monthlyStats,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route-${routeData.route.replace(/[^a-zA-Z0-9]/g, '_')}-statistics.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Route Statistics</h2>
              <p className="text-sm text-gray-600 max-w-2xl truncate" title={`#${getRouteTrainNumber(allRecords, routeData.route)}: ${routeData.route}`}>
                #{getRouteTrainNumber(allRecords, routeData.route)}: {routeData.route}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Timeline Analysis
          </button>

        </div>


        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'overview' && (
            <div className="space-y-8">

              <RouteSummaryCards data={routeData} />
              

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Weekly Pattern Summary
                  </h3>
                  <div className="space-y-3">
                    {routeData.dailyStats.map((day) => (
                      <div key={day.dayOfWeek} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{day.dayName}</span>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {day.averageDelay.toFixed(1)}m avg
                          </div>
                          <div className="text-xs text-gray-500">
                            {day.totalRecords} incidents
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Monthly Performance
                  </h3>
                  <div className="space-y-3">
                    {routeData.monthlyStats.slice(-6).map((month) => (
                      <div key={month.monthYear} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{month.monthYear}</span>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {month.averageDelay.toFixed(1)}m avg
                          </div>
                          <div className="text-xs text-gray-500">
                            {month.totalIncidents} incidents
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <RouteTimelineChart 
              data={routeData.monthlyStats}
              title={`Timeline Analysis for #${getRouteTrainNumber(allRecords, routeData.route)}: ${routeData.route}`}
            />
          )}


        </div>


        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white text-sm text-gray-600">
          <div>
            Data range: {routeData.records.length > 0 && (
              <>
                {new Date(Math.min(...routeData.records.map(r => new Date(r.date).getTime()))).toLocaleDateString()} 
                {' - '}
                {new Date(Math.max(...routeData.records.map(r => new Date(r.date).getTime()))).toLocaleDateString()}
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>{routeData.totalRecords} total incidents</span>
            <span>•</span>
            <span>{routeData.monthlyStats.length} months of data</span>
          </div>
        </div>
      </div>
    </div>
  );
}