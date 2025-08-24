import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Error Loading Data</h3>
        <p className="text-gray-500 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 btn-primary"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}