import { useState, useEffect } from 'react';
import { MdInfo, MdClose, MdSettings } from 'react-icons/md';

const IndexCreationNotice = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-slide-up">
      <div className="flex items-start">
        <MdInfo className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
            Database Setup in Progress
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            We're optimizing your snippets database for better performance. This process may take 5-10 minutes on first use.
          </p>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <MdSettings className="w-4 h-4 animate-spin" />
            <span>Creating database indexes...</span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors ml-2"
        >
          <MdClose className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default IndexCreationNotice;
