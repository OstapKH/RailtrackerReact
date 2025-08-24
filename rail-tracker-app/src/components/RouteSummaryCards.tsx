import { Clock, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { RouteDetailData } from '../types/train';
import { formatDelayTime } from '../utils/dataProcessing';

interface RouteSummaryCardsProps {
  data: RouteDetailData;
}

export default function RouteSummaryCards({ data }: RouteSummaryCardsProps) {

  const worstMonth = data.monthlyStats.reduce((max, month) => 
    month.averageDelay > max.averageDelay ? month : max, 
    data.monthlyStats[0]
  );
  
  const bestMonth = data.monthlyStats.reduce((min, month) => 
    month.averageDelay < min.averageDelay ? month : min, 
    data.monthlyStats[0]
  );


  const sortedRecords = data.records.sort((a, b) => a.date.localeCompare(b.date));
  const startDate = sortedRecords.length > 0 ? sortedRecords[0].date : '';
  const endDate = sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1].date : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Total Incidents</p>
            <p className="text-3xl font-bold text-blue-900">{data.totalRecords}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-xs text-blue-600 mt-2">
          From {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
        </p>
      </div>


      <div className="card bg-amber-50 border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600">Average Delay</p>
            <p className="text-3xl font-bold text-amber-900">
              {formatDelayTime(data.averageDelay)}
            </p>
          </div>
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-xs text-amber-600 mt-2">
          Range: {formatDelayTime(data.minDelay)} - {formatDelayTime(data.maxDelay)}
        </p>
      </div>


      <div className="card bg-red-50 border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">Worst Month</p>
            <p className="text-2xl font-bold text-red-900">
              {worstMonth ? formatDelayTime(worstMonth.averageDelay) : 'N/A'}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-xs text-red-600 mt-2">
          {worstMonth ? `${worstMonth.monthYear} (${worstMonth.totalIncidents} incidents)` : 'No data'}
        </p>
      </div>


      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">Best Month</p>
            <p className="text-2xl font-bold text-green-900">
              {bestMonth ? formatDelayTime(bestMonth.averageDelay) : 'N/A'}
            </p>
          </div>
          <Calendar className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-xs text-green-600 mt-2">
          {bestMonth ? `${bestMonth.monthYear} (${bestMonth.totalIncidents} incidents)` : 'No data'}
        </p>
      </div>
    </div>
  );
}