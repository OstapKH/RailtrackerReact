import { useState, useEffect, useMemo } from 'react';
import { TrainData, TrainDelayRecord, FilterOptions } from '../types/train';
import { processRecords } from '../utils/dataProcessing';

interface UseTrainDataReturn {
  data: TrainData | null;
  records: TrainDelayRecord[];
  filteredRecords: TrainDelayRecord[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  applyFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;
  currentFilters: FilterOptions;
}

export function useTrainData(): UseTrainDataReturn {
  const [data, setData] = useState<TrainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    page: 1,
    pageSize: 50,
    sortBy: 'timestamp',
    sortDirection: 'desc'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/train_delay_data.json');
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }
        
        const trainData: TrainData = await response.json();
        setData(trainData);
      } catch (err) {
        console.error('Error loading train data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load train data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const records = useMemo(() => {
    return data?.records || [];
  }, [data]);

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    

    const filtersWithoutPagination = { ...currentFilters };
    delete filtersWithoutPagination.page;
    delete filtersWithoutPagination.pageSize;
    
    return processRecords(data.records, filtersWithoutPagination);
  }, [data, currentFilters]);

  const paginatedRecords = useMemo(() => {
    if (!data) return [];
    return processRecords(data.records, currentFilters);
  }, [data, currentFilters]);

  const totalPages = useMemo(() => {
    if (!currentFilters.pageSize) return 1;
    return Math.ceil(filteredRecords.length / currentFilters.pageSize);
  }, [filteredRecords.length, currentFilters.pageSize]);

  const applyFilters = (filters: FilterOptions) => {
    setCurrentFilters(prev => ({
      ...prev,
      ...filters,
      page: filters.page !== undefined ? filters.page : 1
    }));
  };

  const clearFilters = () => {
    setCurrentFilters({
      page: 1,
      pageSize: 50,
      sortBy: 'timestamp',
      sortDirection: 'desc'
    });
  };

  return {
    data,
    records,
    filteredRecords,
    loading,
    error,
    totalPages,
    applyFilters,
    clearFilters,
    currentFilters
  };
}