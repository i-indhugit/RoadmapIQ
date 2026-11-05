import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({
  message = 'An error occurred while loading this content.',
  onRetry,
}) => {
  return (
    <div className="glass-panel border-rose-500/30 bg-rose-950/20 p-6 text-center max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-3 text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-rose-300 mb-1">Service Notice</h4>
      <p className="text-xs text-rose-200/80 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs py-1.5 px-3">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

