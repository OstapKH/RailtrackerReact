export interface TrainDelayRecord {
  id: number;
  timestamp: string;
  date: string;
  time: string;
  hour: number;
  day_of_week: number;
  raw_train_info: string;
  train_number: string;
  route: string;
  origin: string;
  destination: string;
  delay_minutes: number;
  delay_hours: number;
  delay_display: string;
}

export interface DelayStatistics {
  average_minutes: number;
  maximum_minutes: number;
  minimum_minutes: number;
}

export interface TrainSummary {
  train_number: string;
  avg_delay_minutes: number;
  total_records: number;
  max_delay: number;
}

export interface RouteSummary {
  route: string;
  avg_delay_minutes: number;
  total_records: number;
  max_delay: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface TrainDataStatistics {
  total_records: number;
  unique_trains: number;
  unique_routes: number;
  date_range: DateRange;
  delay_stats: DelayStatistics;
  most_delayed_trains: TrainSummary[];
  most_delayed_routes: RouteSummary[];
}

export interface TrainDataMetadata {
  generated_at: string;
  source_file: string;
  total_records: number;
}

export interface TrainData {
  metadata: TrainDataMetadata;
  statistics: TrainDataStatistics;
  records: TrainDelayRecord[];
}

export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  trainNumbers?: string[];
  routes?: string[];
  minDelay?: number;
  maxDelay?: number;
  searchQuery?: string;
  sortBy?: keyof TrainDelayRecord;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ChartDataPoint {
  date: string;
  averageDelay: number;
  totalTrains: number;
  maxDelay: number;
}

export interface HourlyDelayData {
  hour: number;
  averageDelay: number;
  totalRecords: number;
}

export interface DailyDelayData {
  dayOfWeek: number;
  dayName: string;
  averageDelay: number;
  totalRecords: number;
}

export interface RouteDelayData {
  route: string;
  averageDelay: number;
  totalRecords: number;
  maxDelay: number;
}

export type DelayCategory = 'low' | 'medium' | 'high' | 'extreme';

export interface DelayDistribution {
  category: DelayCategory;
  range: string;
  count: number;
  percentage: number;
  color: string;
}


export interface RouteDetailData {
  route: string;
  totalRecords: number;
  averageDelay: number;
  maxDelay: number;
  minDelay: number;
  records: TrainDelayRecord[];
  monthlyStats: MonthlyDelayStats[];
  dailyStats: DailyDelayData[];
}

export interface MonthlyDelayStats {
  month: string;
  year: number;
  monthYear: string;
  averageDelay: number;
  totalIncidents: number;
  maxDelay: number;
}

