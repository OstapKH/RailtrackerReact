import { Train } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ 
  title = "Ukraine National Railways Stats", 
  subtitle = "Real-time analysis of train delays across Ukraine's railway network" 
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Train className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 hidden sm:block">{subtitle}</p>
            </div>
          </div>
          

        </div>
      </div>
    </header>
  );
}