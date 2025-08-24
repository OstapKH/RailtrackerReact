import { useState, useMemo } from 'react';
import { 
  ChevronUp, ChevronDown, Filter, Search, ArrowLeft, ArrowRight,
  Clock, Train, MapPin, Calendar, Download, Eye, EyeOff
} from 'lucide-react';
import { TrainDelayRecord, FilterOptions } from '../types/train';
import { 
  processRecords, 
  formatDelayTime, 
  formatDate, 
  formatTime, 
  getDelayBadgeClass,
  getUniqueTrainNumbers,
  getUniqueRoutes
} from '../utils/dataProcessing';

interface TrainDelaysTableProps {
  records: TrainDelayRecord[];
}

export default function TrainDelaysTable({ records }: TrainDelaysTableProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    page: 1,
    pageSize: 25,
    sortBy: 'timestamp',
    sortDirection: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrains, setSelectedTrains] = useState<string[]>([]);
  const [delayRange, setDelayRange] = useState({ min: '', max: '' });


  const uniqueTrains = useMemo(() => getUniqueTrainNumbers(records), [records]);
  const uniqueRoutes = useMemo(() => getUniqueRoutes(records), [records]);


  const currentFilters = useMemo(() => ({
    ...filters,
    searchQuery: searchQuery.trim(),
    trainNumbers: selectedTrains.length > 0 ? selectedTrains : undefined,
    minDelay: delayRange.min ? parseInt(delayRange.min) : undefined,
    maxDelay: delayRange.max ? parseInt(delayRange.max) : undefined,
  }), [filters, searchQuery, selectedTrains, delayRange]);

  const filteredRecords = useMemo(() => {
    const filtersWithoutPagination = { ...currentFilters };
    delete filtersWithoutPagination.page;
    delete filtersWithoutPagination.pageSize;
    return processRecords(records, filtersWithoutPagination);
  }, [records, currentFilters]);

  const paginatedRecords = useMemo(() => {
    return processRecords(records, currentFilters);
  }, [records, currentFilters]);

  const totalPages = Math.ceil(filteredRecords.length / (filters.pageSize || 25));


  const handleSort = (field: keyof TrainDelayRecord) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  const getSortIcon = (field: keyof TrainDelayRecord) => {
    if (filters.sortBy !== field) return null;
    return filters.sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };


  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setFilters(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };


  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTrains([]);
    setDelayRange({ min: '', max: '' });
    setFilters({
      page: 1,
      pageSize: 25,
      sortBy: 'timestamp',
      sortDirection: 'desc'
    });
  };

  const handleTrainSelection = (trainNumber: string) => {
    setSelectedTrains(prev => 
      prev.includes(trainNumber)
        ? prev.filter(t => t !== trainNumber)
        : [...prev, trainNumber]
    );
    setFilters(prev => ({ ...prev, page: 1 }));
  };


  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Train Number', 'Route', 'Origin', 'Destination', 'Delay (minutes)', 'Delay Display'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        record.date,
        record.time,
        record.train_number,
        `"${record.route.replace(/"/g, '""')}"`,
        `"${record.origin.replace(/"/g, '""')}"`,
        `"${record.destination.replace(/"/g, '""')}"`,
        record.delay_minutes,
        record.delay_display
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `train_delays_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-600" />
            Train Delays
          </h2>
          <p className="text-gray-600">
            {filteredRecords.length.toLocaleString()} of {records.length.toLocaleString()} records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            {showFilters ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button
            onClick={exportToCSV}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>


      {showFilters && (
        <div className="card bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Trains/Routes
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="Train number or route..."
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Range (minutes)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={delayRange.min}
                  onChange={(e) => setDelayRange(prev => ({ ...prev, min: e.target.value }))}
                  className="input flex-1"
                  placeholder="Min"
                  min="0"
                />
                <input
                  type="number"
                  value={delayRange.max}
                  onChange={(e) => setDelayRange(prev => ({ ...prev, max: e.target.value }))}
                  className="input flex-1"
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Trains ({selectedTrains.length})
              </label>
              <div className="max-h-24 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-white">
                {uniqueTrains.slice(0, 10).map(train => (
                  <label key={train} className="flex items-center text-sm py-1">
                    <input
                      type="checkbox"
                      checked={selectedTrains.includes(train)}
                      onChange={() => handleTrainSelection(train)}
                      className="mr-2"
                    />
                    {train}
                  </label>
                ))}
                {uniqueTrains.length > 10 && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{uniqueTrains.length - 10} more...
                  </p>
                )}
              </div>
            </div>


            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date/Time
                    {getSortIcon('timestamp')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('train_number')}
                >
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4" />
                    Train
                    {getSortIcon('train_number')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Route
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('delay_minutes')}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Delay
                    {getSortIcon('delay_minutes')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {formatDate(record.date)}
                      </div>
                      <div className="text-gray-500">
                        {formatTime(record.time)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      #{record.train_number}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 truncate max-w-xs" title={`#${record.train_number}: ${record.route}`}>
                        #{record.train_number}: {record.route}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {record.origin} → {record.destination}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={getDelayBadgeClass(record.delay_minutes)}>
                        {record.delay_display}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({formatDelayTime(record.delay_minutes)})
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Show</span>
              <select
                value={filters.pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {filters.page} of {totalPages} ({filteredRecords.length.toLocaleString()} records)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}