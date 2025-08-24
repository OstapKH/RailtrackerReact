import { Train } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "Loading train data..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
      <div className="relative">
        <Train className="w-12 h-12 text-blue-600 animate-pulse" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">{message}</h3>
        <p className="text-gray-500">Please wait while we fetch the latest data</p>
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}