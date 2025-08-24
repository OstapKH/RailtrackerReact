import { BarChart3, Table, Clock, MapPin, Search } from 'lucide-react';

export type TabType = 'overview' | 'delays' | 'routes' | 'analytics' | 'search';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'overview' as TabType, name: 'Overview', icon: BarChart3 },
  { id: 'delays' as TabType, name: 'Train Delays', icon: Clock },
  { id: 'routes' as TabType, name: 'Routes', icon: MapPin },
  { id: 'analytics' as TabType, name: 'Analytics', icon: BarChart3 },
  { id: 'search' as TabType, name: 'Search', icon: Search },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}