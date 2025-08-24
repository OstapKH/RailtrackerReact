import { useState } from 'react';
import Header from './components/Header';
import Navigation, { TabType } from './components/Navigation';
import Loading from './components/Loading';
import ErrorDisplay from './components/ErrorDisplay';
import OverviewStats from './components/OverviewStats';
import Analytics from './components/Analytics';
import TrainDelaysTable from './components/TrainDelaysTable';
import RouteAnalysis from './components/RouteAnalysis';
import Search from './components/Search';
import { useTrainData } from './hooks/useTrainData';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { data, loading, error } = useTrainData();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && <Loading />}
        
        {error && (
          <ErrorDisplay message={error} onRetry={handleRetry} />
        )}
        
        {data && !loading && !error && (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <OverviewStats data={data} />
            )}
            
            {activeTab === 'delays' && (
              <TrainDelaysTable records={data.records} />
            )}
            
            {activeTab === 'routes' && (
              <RouteAnalysis data={data} />
            )}
            
            {activeTab === 'analytics' && (
              <Analytics data={data} />
            )}
            
            {activeTab === 'search' && (
              <Search data={data} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;