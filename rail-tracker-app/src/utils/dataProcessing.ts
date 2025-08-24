import {
  TrainDelayRecord,
  FilterOptions,
  ChartDataPoint,
  HourlyDelayData,
  DailyDelayData,
  RouteDelayData,
  DelayCategory,
  DelayDistribution,
  RouteDetailData,
  MonthlyDelayStats
} from '../types/train';

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function filterRecords(records: TrainDelayRecord[], options: FilterOptions = {}): TrainDelayRecord[] {
  let filtered = [...records];


  if (options.dateRange) {
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.date);
      const startDate = new Date(options.dateRange!.start);
      const endDate = new Date(options.dateRange!.end);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }


  if (options.trainNumbers && options.trainNumbers.length > 0) {
    filtered = filtered.filter(record => 
      options.trainNumbers!.includes(record.train_number)
    );
  }


  if (options.routes && options.routes.length > 0) {
    filtered = filtered.filter(record => 
      options.routes!.some(route => record.route.includes(route))
    );
  }


  if (options.minDelay !== undefined) {
    filtered = filtered.filter(record => record.delay_minutes >= options.minDelay!);
  }
  if (options.maxDelay !== undefined) {
    filtered = filtered.filter(record => record.delay_minutes <= options.maxDelay!);
  }


  if (options.searchQuery && options.searchQuery.trim()) {
    const query = options.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(record => 
      record.train_number.toLowerCase().includes(query) ||
      record.route.toLowerCase().includes(query) ||
      record.origin.toLowerCase().includes(query) ||
      record.destination.toLowerCase().includes(query)
    );
  }

  return filtered;
}

export function sortRecords(records: TrainDelayRecord[], options: FilterOptions = {}): TrainDelayRecord[] {
  if (!options.sortBy) return records;

  const sorted = [...records];
  
  sorted.sort((a, b) => {
    const aValue = a[options.sortBy!];
    const bValue = b[options.sortBy!];
    
    let comparison = 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return options.sortDirection === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

export function paginateRecords(records: TrainDelayRecord[], options: FilterOptions = {}): TrainDelayRecord[] {
  if (!options.page || !options.pageSize) return records;
  
  const startIndex = (options.page - 1) * options.pageSize;
  const endIndex = startIndex + options.pageSize;
  
  return records.slice(startIndex, endIndex);
}

export function processRecords(records: TrainDelayRecord[], options: FilterOptions = {}): TrainDelayRecord[] {
  let processed = filterRecords(records, options);
  processed = sortRecords(processed, options);
  

  if (options.page && options.pageSize) {
    processed = paginateRecords(processed, options);
  }
  
  return processed;
}

export function generateChartData(records: TrainDelayRecord[]): ChartDataPoint[] {
  const dailyData = new Map<string, { delays: number[], count: number }>();
  
  records.forEach(record => {
    const date = record.date;
    if (!dailyData.has(date)) {
      dailyData.set(date, { delays: [], count: 0 });
    }
    const data = dailyData.get(date)!;
    data.delays.push(record.delay_minutes);
    data.count++;
  });
  
  const chartData: ChartDataPoint[] = [];
  
  dailyData.forEach((data, date) => {
    const averageDelay = data.delays.reduce((sum, delay) => sum + delay, 0) / data.delays.length;
    const maxDelay = Math.max(...data.delays);
    
    chartData.push({
      date,
      averageDelay: Math.round(averageDelay * 10) / 10,
      totalTrains: data.count,
      maxDelay
    });
  });
  
  return chartData.sort((a, b) => a.date.localeCompare(b.date));
}

export function generateHourlyDelayData(records: TrainDelayRecord[]): HourlyDelayData[] {
  const hourlyData = new Map<number, number[]>();
  

  for (let hour = 0; hour < 24; hour++) {
    hourlyData.set(hour, []);
  }
  
  records.forEach(record => {
    hourlyData.get(record.hour)!.push(record.delay_minutes);
  });
  
  const result: HourlyDelayData[] = [];
  
  hourlyData.forEach((delays, hour) => {
    const averageDelay = delays.length > 0 
      ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length 
      : 0;
    
    result.push({
      hour,
      averageDelay: Math.round(averageDelay * 10) / 10,
      totalRecords: delays.length
    });
  });
  
  return result;
}

export function generateDailyDelayData(records: TrainDelayRecord[]): DailyDelayData[] {
  const dailyData = new Map<number, number[]>();
  

  for (let day = 0; day < 7; day++) {
    dailyData.set(day, []);
  }
  
  records.forEach(record => {
    dailyData.get(record.day_of_week)!.push(record.delay_minutes);
  });
  
  const result: DailyDelayData[] = [];
  
  dailyData.forEach((delays, dayOfWeek) => {
    const averageDelay = delays.length > 0 
      ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length 
      : 0;
    
    result.push({
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek],
      averageDelay: Math.round(averageDelay * 10) / 10,
      totalRecords: delays.length
    });
  });
  
  return result;
}

export function generateRouteDelayData(records: TrainDelayRecord[], limit: number = 20): RouteDelayData[] {
  const routeData = new Map<string, { delays: number[], trainNumbers: string[] }>();
  
  records.forEach(record => {
    if (!routeData.has(record.route)) {
      routeData.set(record.route, { delays: [], trainNumbers: [] });
    }
    const data = routeData.get(record.route)!;
    data.delays.push(record.delay_minutes);
    if (!data.trainNumbers.includes(record.train_number)) {
      data.trainNumbers.push(record.train_number);
    }
  });
  
  const result: RouteDelayData[] = [];
  
  routeData.forEach((data, route) => {
    const averageDelay = data.delays.reduce((sum, delay) => sum + delay, 0) / data.delays.length;
    const maxDelay = Math.max(...data.delays);
    
    result.push({
      route,
      averageDelay: Math.round(averageDelay * 10) / 10,
      totalRecords: data.delays.length,
      maxDelay
    });
  });
  
  return result
    .sort((a, b) => b.averageDelay - a.averageDelay)
    .slice(0, limit);
}

export function getDelayCategory(delayMinutes: number): DelayCategory {

  const rounded = Math.round(delayMinutes * 10) / 10;
  
  if (rounded <= 15) return 'low';
  if (rounded <= 60) return 'medium';
  if (rounded <= 180) return 'high';
  return 'extreme';
}

export function generateDelayDistribution(records: TrainDelayRecord[]): DelayDistribution[] {
  const categories = {
    low: { range: '0-15 min', count: 0, color: '#22c55e' },
    medium: { range: '16-60 min', count: 0, color: '#f59e0b' },
    high: { range: '61-180 min', count: 0, color: '#ef4444' },
    extreme: { range: '180+ min', count: 0, color: '#7c2d12' }
  };
  
  records.forEach(record => {
    const category = getDelayCategory(record.delay_minutes);
    categories[category].count++;
  });
  
  const total = records.length;
  
  return Object.entries(categories).map(([category, data]) => ({
    category: category as DelayCategory,
    range: data.range,
    count: data.count,
    percentage: total > 0 ? Math.round((data.count / total) * 100 * 10) / 10 : 0,
    color: data.color
  }));
}

export function getUniqueTrainNumbers(records: TrainDelayRecord[]): string[] {
  const unique = new Set(records.map(record => record.train_number));
  return Array.from(unique).sort();
}

export function getRouteTrainNumber(records: TrainDelayRecord[], routeName: string): string {

  const trainNumbers = records
    .filter(record => record.route === routeName)
    .map(record => record.train_number);
  
  if (trainNumbers.length === 0) return '';
  

  const counts = new Map<string, number>();
  trainNumbers.forEach(trainNumber => {
    counts.set(trainNumber, (counts.get(trainNumber) || 0) + 1);
  });
  

  let maxCount = 0;
  let mostCommon = trainNumbers[0];
  counts.forEach((count, trainNumber) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = trainNumber;
    }
  });
  
  return mostCommon;
}

export function getUniqueRoutes(records: TrainDelayRecord[]): string[] {
  const unique = new Set(records.map(record => record.route));
  return Array.from(unique).sort();
}

export function formatDelayTime(minutes: number): string {

  const roundedMinutes = Math.round(minutes * 100) / 100;
  const hours = Math.floor(roundedMinutes / 60);
  const mins = Math.round((roundedMinutes % 60) * 100) / 100;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(timeString: string): string {
  return timeString.slice(0, 5);
}

export function getDelayBadgeClass(delayMinutes: number): string {
  const category = getDelayCategory(delayMinutes);
  
  switch (category) {
    case 'low':
      return 'delay-badge delay-low';
    case 'medium':
      return 'delay-badge delay-medium';
    case 'high':
    case 'extreme':
      return 'delay-badge delay-high';
    default:
      return 'delay-badge delay-medium';
  }
}


export function generateRouteDetailData(
  records: TrainDelayRecord[], 
  routeName: string
): RouteDetailData {
  const routeRecords = records.filter(r => r.route === routeName);
  
  if (routeRecords.length === 0) {
    return {
      route: routeName,
      totalRecords: 0,
      averageDelay: 0,
      maxDelay: 0,
      minDelay: 0,
      records: [],
      monthlyStats: [],
      dailyStats: []
    };
  }
  
  const delays = routeRecords.map(r => r.delay_minutes);
  
  return {
    route: routeName,
    totalRecords: routeRecords.length,
    averageDelay: Math.round((delays.reduce((sum, delay) => sum + delay, 0) / delays.length) * 10) / 10,
    maxDelay: Math.max(...delays),
    minDelay: Math.min(...delays),
    records: routeRecords,
    monthlyStats: generateMonthlyStats(routeRecords),
    dailyStats: generateDailyDelayData(routeRecords)
  };
}

export function generateMonthlyStats(records: TrainDelayRecord[]): MonthlyDelayStats[] {
  const monthlyData = new Map<string, number[]>();
  
  records.forEach(record => {
    const date = new Date(record.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData.has(monthYear)) {
      monthlyData.set(monthYear, []);
    }
    monthlyData.get(monthYear)!.push(record.delay_minutes);
  });
  
  const result: MonthlyDelayStats[] = [];
  
  monthlyData.forEach((delays, monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const averageDelay = delays.reduce((sum, delay) => sum + delay, 0) / delays.length;
    const maxDelay = Math.max(...delays);
    
    result.push({
      month: monthName,
      year: parseInt(year),
      monthYear: `${monthName} ${year}`,
      averageDelay: Math.round(averageDelay * 10) / 10,
      totalIncidents: delays.length,
      maxDelay
    });
  });
  
  return result.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });
}

