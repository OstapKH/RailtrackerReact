#!/usr/bin/env node

/**
 * Data Deduplication Script
 * 
 * This script processes the train delay data to remove duplicates following the backend logic:
 * - One record per train per day (using trainNumber + route as unique key)
 * - Keeps the latest timestamp entry for each train per day
 * - Matches backend TrainDelayAnalyzer approach
 */

const fs = require('fs');
const path = require('path');

// File paths
const INPUT_FILE = path.join(__dirname, '../public/train_delay_data.json');
const OUTPUT_FILE = path.join(__dirname, '../public/train_delay_data_deduplicated.json');
const BACKUP_FILE = path.join(__dirname, '../public/train_delay_data_original_backup.json');

console.log('🚂 Train Delay Data Deduplication Script');
console.log('==========================================');

try {
  // Read the original data
  console.log('📖 Reading original data file...');
  const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
  const data = JSON.parse(rawData);
  
  console.log(`📊 Original data loaded:`);
  console.log(`   - Total records: ${data.records.length.toLocaleString()}`);
  console.log(`   - Date range: ${data.statistics.date_range.start} to ${data.statistics.date_range.end}`);
  
  // Create backup of original file
  console.log('💾 Creating backup of original file...');
  fs.writeFileSync(BACKUP_FILE, rawData);
  console.log(`   ✅ Backup saved to: ${path.basename(BACKUP_FILE)}`);
  
  // Deduplicate records following backend logic
  console.log('🔄 Processing deduplication...');
  const deduplicatedRecords = deduplicateRecords(data.records);
  
  // Calculate new statistics
  console.log('📈 Recalculating statistics...');
  const newStatistics = calculateStatistics(deduplicatedRecords, data.statistics);
  
  // Create new data structure
  const deduplicatedData = {
    metadata: {
      ...data.metadata,
      generated_at: new Date().toISOString(),
      deduplicated: true,
      deduplication_date: new Date().toISOString(),
      original_record_count: data.records.length,
      deduplicated_record_count: deduplicatedRecords.length,
      duplicate_percentage: ((data.records.length - deduplicatedRecords.length) / data.records.length * 100).toFixed(2)
    },
    statistics: newStatistics,
    records: deduplicatedRecords
  };
  
  // Write deduplicated data
  console.log('💾 Saving deduplicated data...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(deduplicatedData, null, 2));
  
  // Replace original file with deduplicated version
  console.log('🔄 Replacing original file with deduplicated version...');
  fs.writeFileSync(INPUT_FILE, JSON.stringify(deduplicatedData, null, 2));
  
  // Summary
  console.log('\n✅ Deduplication completed successfully!');
  console.log('==========================================');
  console.log(`📊 Results:`);
  console.log(`   - Original records: ${data.records.length.toLocaleString()}`);
  console.log(`   - Deduplicated records: ${deduplicatedRecords.length.toLocaleString()}`);
  console.log(`   - Duplicates removed: ${(data.records.length - deduplicatedRecords.length).toLocaleString()}`);
  console.log(`   - Duplicate percentage: ${deduplicatedData.metadata.duplicate_percentage}%`);
  console.log(`   - New unique trains: ${newStatistics.unique_trains}`);
  console.log(`   - New unique routes: ${newStatistics.unique_routes}`);
  console.log('\n📁 Files:');
  console.log(`   - Original backup: ${path.basename(BACKUP_FILE)}`);
  console.log(`   - Deduplicated copy: ${path.basename(OUTPUT_FILE)}`);
  console.log(`   - Updated main file: ${path.basename(INPUT_FILE)}`);
  
} catch (error) {
  console.error('❌ Error during deduplication:', error.message);
  process.exit(1);
}

/**
 * Deduplicates train delay records following backend logic
 * @param {Array} records - Array of train delay records
 * @returns {Array} - Deduplicated records
 */
function deduplicateRecords(records) {
  console.log('   🔍 Grouping records by date and train...');
  
  // Group records by date and train key (trainNumber_route)
  const processedData = new Map();
  
  records.forEach((record, index) => {
    if (index % 10000 === 0) {
      process.stdout.write(`\r   📝 Processing record ${index.toLocaleString()}/${records.length.toLocaleString()}`);
    }
    
    const date = record.date; // Extract date (YYYY-MM-DD format)
    const trainKey = `${record.train_number}_${record.route}`; // Unique train identifier
    
    if (!processedData.has(date)) {
      processedData.set(date, new Map());
    }
    
    const dayData = processedData.get(date);
    const existingRecord = dayData.get(trainKey);
    
    // Keep the record with the latest timestamp (backend logic)
    if (!existingRecord || record.timestamp > existingRecord.timestamp) {
      dayData.set(trainKey, record);
    }
  });
  
  console.log('\n   📦 Flattening deduplicated data...');
  
  // Flatten back to array
  const deduplicatedRecords = [];
  processedData.forEach(dayData => {
    dayData.forEach(record => {
      deduplicatedRecords.push(record);
    });
  });
  
  // Sort by timestamp descending (most recent first)
  console.log('   🔄 Sorting records by timestamp...');
  deduplicatedRecords.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  
  return deduplicatedRecords;
}

/**
 * Recalculates statistics for deduplicated data
 * @param {Array} records - Deduplicated records
 * @param {Object} originalStats - Original statistics
 * @returns {Object} - New statistics
 */
function calculateStatistics(records, originalStats) {
  console.log('   📊 Calculating delay statistics...');
  
  const delays = records.map(r => r.delay_minutes);
  const uniqueTrains = new Set(records.map(r => r.train_number)).size;
  const uniqueRoutes = new Set(records.map(r => r.route)).size;
  
  // Calculate most delayed trains
  const trainStats = new Map();
  records.forEach(record => {
    const key = record.train_number;
    if (!trainStats.has(key)) {
      trainStats.set(key, { delays: [], max: 0 });
    }
    const stats = trainStats.get(key);
    stats.delays.push(record.delay_minutes);
    stats.max = Math.max(stats.max, record.delay_minutes);
  });
  
  const mostDelayedTrains = Array.from(trainStats.entries())
    .map(([train_number, stats]) => ({
      train_number,
      avg_delay_minutes: Math.round(stats.delays.reduce((a, b) => a + b, 0) / stats.delays.length),
      total_records: stats.delays.length,
      max_delay: stats.max
    }))
    .sort((a, b) => b.avg_delay_minutes - a.avg_delay_minutes)
    .slice(0, 10);
  
  // Calculate most delayed routes
  const routeStats = new Map();
  records.forEach(record => {
    const key = record.route;
    if (!routeStats.has(key)) {
      routeStats.set(key, { delays: [], max: 0 });
    }
    const stats = routeStats.get(key);
    stats.delays.push(record.delay_minutes);
    stats.max = Math.max(stats.max, record.delay_minutes);
  });
  
  const mostDelayedRoutes = Array.from(routeStats.entries())
    .map(([route, stats]) => ({
      route,
      avg_delay_minutes: Math.round(stats.delays.reduce((a, b) => a + b, 0) / stats.delays.length * 10) / 10,
      total_records: stats.delays.length,
      max_delay: stats.max
    }))
    .sort((a, b) => b.avg_delay_minutes - a.avg_delay_minutes)
    .slice(0, 10);
  
  return {
    total_records: records.length,
    unique_trains: uniqueTrains,
    unique_routes: uniqueRoutes,
    date_range: originalStats.date_range,
    delay_stats: {
      average_minutes: Math.round(delays.reduce((a, b) => a + b, 0) / delays.length * 10) / 10,
      maximum_minutes: Math.max(...delays),
      minimum_minutes: Math.min(...delays)
    },
    most_delayed_trains: mostDelayedTrains,
    most_delayed_routes: mostDelayedRoutes
  };
}