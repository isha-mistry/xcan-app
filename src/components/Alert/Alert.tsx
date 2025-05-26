// components/Alert.tsx
import React from 'react';
import { XCircle } from 'lucide-react';

interface AlertProps {
  message: React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success'; // Optional: Alert type for styling
  onClose?: () => void; // Optional: Callback when the close button is clicked
}

const Alert: React.FC<AlertProps> = ({ message, type = 'warning', onClose }) => {
  let backgroundColor = 'bg-dark-tertiary';
  let textColor = 'text-yellow-400';
  let borderColor = 'border-yellow-500';

  if (type === 'error') {
    backgroundColor = 'bg-dark-tertiary';
    textColor = 'text-red-400';
    borderColor = 'border-red-500';
  } else if (type === 'success') {
    backgroundColor = 'bg-dark-tertiary';
    textColor = 'text-green-400';
    borderColor = 'border-green-500';
  } else if (type === 'info') {
    backgroundColor = 'bg-dark-tertiary';
    textColor = 'text-blue-400';
    borderColor = 'border-blue-500';
  }

  return (
    <div className={`${backgroundColor} ${textColor} border-l-4 ${borderColor} p-4 my-4 rounded-md shadow-md relative`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {type === 'error' && <XCircle className="h-5 w-5 inline-block mr-2" aria-hidden="true" />}
          {/* Add icons for other types if needed */}
        </div>
        <div className="ml-3 text-sm font-medium">
          {message}
        </div>
        {onClose && (
          <button onClick={onClose} className="absolute top-2 right-2 text-dark-text-secondary hover:text-dark-text-primary">
            <span className="sr-only">Close</span>
            <XCircle className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;