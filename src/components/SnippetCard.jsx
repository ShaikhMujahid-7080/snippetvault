import { useState } from 'react';
import { MdContentCopy, MdEdit, MdDelete, MdStar, MdStarBorder } from 'react-icons/md';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';
import { useTheme } from '../hooks/useTheme';

const SnippetCard = ({ snippet, onEdit, onDelete, onToggleFavorite }) => {
  const { theme } = useTheme();
  const [showFullCode, setShowFullCode] = useState(false);
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const truncatedCode = snippet.code.length > 200 
    ? snippet.code.substring(0, 200) + '...' 
    : snippet.code;

  return (
    <div className="glass-effect rounded-xl p-6 card-hover group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {snippet.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {snippet.description}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
              {snippet.category}
            </span>
            {snippet.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleFavorite(snippet.id)}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors"
            title={snippet.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {snippet.isFavorite ? (
              <MdStar className="w-4 h-4 text-yellow-500" />
            ) : (
              <MdStarBorder className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={() => copyToClipboard(snippet.code)}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors"
            title="Copy to clipboard"
          >
            <MdContentCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onEdit(snippet)}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors"
            title="Edit snippet"
          >
            <MdEdit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(snippet.id)}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors"
            title="Delete snippet"
          >
            <MdDelete className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <div className="relative">
        <SyntaxHighlighter
          language={snippet.language || 'text'}
          style={theme === 'dark' ? vscDarkPlus : vs}
          className="rounded-lg !bg-gray-50 dark:!bg-gray-800/50"
          showLineNumbers={snippet.code.split('\n').length > 3}
        >
          {showFullCode ? snippet.code : truncatedCode}
        </SyntaxHighlighter>
        
        {snippet.code.length > 200 && (
          <button
            onClick={() => setShowFullCode(!showFullCode)}
            className="mt-2 text-primary-600 dark:text-primary-400 text-sm hover:underline"
          >
            {showFullCode ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SnippetCard;
