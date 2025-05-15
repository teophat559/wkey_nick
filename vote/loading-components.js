import React from 'react';
import { Trophy } from 'lucide-react';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-${colorClasses[color]} rounded-full animate-spin`}></div>
  );
};

// Loading Screen Component
export const LoadingScreen = ({ message = 'Đang tải...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
          <Trophy className="text-white" size={24} />
        </div>
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4 text-lg">{message}</p>
      </div>
    </div>
  );
};

// Loading Skeleton Components
export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonList = ({ items = 3 }) => {
  return (
    <div className="space-y-4">
      {[...Array(items)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading Button Component
export const LoadingButton = ({ children, loading, disabled, className, ...props }) => {
  return (
    <button
      disabled={loading || disabled}
      className={`relative ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Lazy Loading Image Component
export const LazyImage = ({ src, alt, className, fallback, ...props }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="w-12 h-12 bg-gray-300 rounded mx-auto mb-2"></div>
            <p className="text-xs">Không thể tải ảnh</p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
          {...props}
        />
      )}
    </div>
  );
};