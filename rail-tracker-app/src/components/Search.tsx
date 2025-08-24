import { useState, useMemo } from 'react';
import { Search as SearchIcon, Filter, Calendar, Clock, Train, MapPin, TrendingDown, TrendingUp } from 'lucide-react';
import { TrainData } from '../types/train';
import { 
  processRecords, 
  formatDelayTime, 
  formatDate, 
  formatTime,
  getDelayBadgeClass,
  getUniqueTrainNumbers,
  getUniqueRoutes,
  getRouteTrainNumber
} from '../utils/dataProcessing';

interface SearchProps {
  data: TrainData;
}

export default function Search({ data }: SearchProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trains' | 'routes'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [delayRange, setDelayRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'relevance' | 'delay' | 'date'>('relevance');


  const uniqueTrains = useMemo(() => getUniqueTrainNumbers(data.records), [data.records]);
  const uniqueRoutes = useMemo(() => getUniqueRoutes(data.records), [data.records]);


  const searchResults = useMemo(() => {
    if (!query.trim() && !dateRange.start && !delayRange.min) {
      return [];
    }

    let filtered = data.records;


    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(record => {
        const matchTrain = record.train_number.toLowerCase().includes(searchTerm);
        const matchRoute = record.route.toLowerCase().includes(searchTerm);
        const matchOrigin = record.origin.toLowerCase().includes(searchTerm);
        const matchDestination = record.destination.toLowerCase().includes(searchTerm);

        switch (selectedCategory) {
          case 'trains':
            return matchTrain;
          case 'routes':
            return matchRoute || matchOrigin || matchDestination;
          default:
            return matchTrain || matchRoute || matchOrigin || matchDestination;
        }
      });
    }


    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date('1900-01-01');
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date('2100-01-01');
        return recordDate >= startDate && recordDate <= endDate;
      });
    }


    if (delayRange.min || delayRange.max) {
      filtered = filtered.filter(record => {
        const delay = record.delay_minutes;
        const minDelay = delayRange.min ? parseInt(delayRange.min) : 0;
        const maxDelay = delayRange.max ? parseInt(delayRange.max) : Infinity;
        return delay >= minDelay && delay <= maxDelay;
      });
    }


    switch (sortBy) {
      case 'delay':
        filtered.sort((a, b) => b.delay_minutes - a.delay_minutes);
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'relevance':
      default:

        if (query.trim()) {
          const searchTerm = query.toLowerCase();
          filtered.sort((a, b) => {
            const aExact = a.train_number.toLowerCase() === searchTerm ? 1 : 0;
            const bExact = b.train_number.toLowerCase() === searchTerm ? 1 : 0;
            if (aExact !== bExact) return bExact - aExact;
            return b.delay_minutes - a.delay_minutes;
          });
        } else {
          filtered.sort((a, b) => b.delay_minutes - a.delay_minutes);
        }
        break;
    }

    return filtered.slice(0, 100);
  }, [data.records, query, selectedCategory, dateRange, delayRange, sortBy]);


  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const searchTerm = query.toLowerCase();
    const trainSuggestions = uniqueTrains
      .filter(train => train.toLowerCase().includes(searchTerm))
      .slice(0, 5)
      .map(train => ({ type: 'train', value: train }));
    
    const routeSuggestions = uniqueRoutes
      .filter(route => route.toLowerCase().includes(searchTerm))
      .slice(0, 5)
      .map(route => ({ type: 'route', value: route }));
    
    return [...trainSuggestions, ...routeSuggestions];
  }, [query, uniqueTrains, uniqueRoutes]);


  const resultStats = useMemo(() => {
    if (searchResults.length === 0) return null;

    const totalDelay = searchResults.reduce((sum, record) => sum + record.delay_minutes, 0);
    const avgDelay = totalDelay / searchResults.length;
    const maxDelay = Math.max(...searchResults.map(r => r.delay_minutes));
    const minDelay = Math.min(...searchResults.map(r => r.delay_minutes));
    const uniqueTrainsCount = new Set(searchResults.map(r => r.train_number)).size;
    const uniqueRoutesCount = new Set(searchResults.map(r => r.route)).size;

    return {
      total: searchResults.length,
      avgDelay,
      maxDelay,
      minDelay,
      uniqueTrains: uniqueTrainsCount,
      uniqueRoutes: uniqueRoutesCount
    };
  }, [searchResults]);

  const clearSearch = () => {
    setQuery('');
    setDateRange({ start: '', end: '' });
    setDelayRange({ min: '', max: '' });
    setSortBy('relevance');
  };

  return (
    <div className="space-y-6">

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
          <SearchIcon className="w-8 h-8 mr-3 text-blue-600" />
          Advanced Search
        </h2>
        <p className="text-lg text-gray-600">
          Search through {data.statistics.total_records.toLocaleString()} delay records
        </p>
      </div>


      <div className="card">
        <div className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <div className="relative">
              <SearchIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trains, routes, or destinations..."
                className="input pl-10 w-full"
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(suggestion.value)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      {suggestion.type === 'train' ? (
                        <Train className="w-4 h-4 text-blue-600" />
                      ) : (
                        <MapPin className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm">{suggestion.value}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {suggestion.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search In
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
                className="input w-full"
              >
                <option value="all">All Fields</option>
                <option value="trains">Train Numbers</option>
                <option value="routes">Routes Only</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="input w-full"
                  min={data.statistics.date_range.start}
                  max={data.statistics.date_range.end}
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="input w-full"
                  min={data.statistics.date_range.start}
                  max={data.statistics.date_range.end}
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Range (minutes)
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  value={delayRange.min}
                  onChange={(e) => setDelayRange(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="Min delay"
                  className="input w-full"
                  min="0"
                />
                <input
                  type="number"
                  value={delayRange.max}
                  onChange={(e) => setDelayRange(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="Max delay"
                  className="input w-full"
                  min="0"
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Results By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="input w-full"
              >
                <option value="relevance">Relevance</option>
                <option value="delay">Delay Duration</option>
                <option value="date">Date (Newest)</option>
              </select>
              <button
                onClick={clearSearch}
                className="btn-secondary w-full mt-2 text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>


      {resultStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-blue-600">{resultStats.total}</p>
            <p className="text-sm text-gray-600">Results</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-yellow-600">{resultStats.avgDelay.toFixed(1)}m</p>
            <p className="text-sm text-gray-600">Avg Delay</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-red-600">{formatDelayTime(resultStats.maxDelay)}</p>
            <p className="text-sm text-gray-600">Max Delay</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-600">{formatDelayTime(resultStats.minDelay)}</p>
            <p className="text-sm text-gray-600">Min Delay</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-purple-600">{resultStats.uniqueTrains}</p>
            <p className="text-sm text-gray-600">Trains</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-indigo-600">{resultStats.uniqueRoutes}</p>
            <p className="text-sm text-gray-600">Routes</p>
          </div>
        </div>
      )}


      {searchResults.length > 0 ? (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Search Results ({searchResults.length})
          </h3>
          <div className="space-y-4">
            {searchResults.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Train className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        Train #{record.train_number}
                      </span>
                      <span className={getDelayBadgeClass(record.delay_minutes)}>
                        {record.delay_display}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate" title={`#${getRouteTrainNumber(data.records, record.route)}: ${record.route}`}>
                        #{getRouteTrainNumber(data.records, record.route)}: {record.route}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(record.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {record.delay_minutes} min
                      </div>
                      <div className="text-gray-500">
                        delay
                      </div>
                    </div>
                    {record.delay_minutes > 60 ? (
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    ) : record.delay_minutes > 15 ? (
                      <TrendingUp className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : query.trim() || dateRange.start || delayRange.min ? (
        <div className="card text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or clearing filters
          </p>
          <button onClick={clearSearch} className="btn-primary">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="card text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Search</h3>
          <p className="text-gray-600">
            Enter a search query above to find specific trains, routes, or analyze delay patterns
          </p>
        </div>
      )}
    </div>
  );
}