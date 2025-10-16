import { useState } from 'react';
import { MdStar, MdStarBorder, MdEdit, MdDelete } from 'react-icons/md';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  vs,
  materialDark,
  materialLight,
  oneLight,
  oneDark
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';
import { useTheme } from '../hooks/useTheme';
// 🆕 ADDED (2025-10-16 13:50 IST)
import MarkdownPreview from './MarkdownPreview';


const SnippetCard = ({ snippet, onEdit, onDelete, onToggleFavorite }) => {
  const { theme } = useTheme();
  const [showFullCodeIndexes, setShowFullCodeIndexes] = useState([]);

  // Dynamic theme selection for syntax highlighter
  const getSyntaxTheme = () => {
    return theme === 'dark' ? oneDark : oneLight;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied snippet!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const toggleCodeExpansion = (index) => {
    setShowFullCodeIndexes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Create unique tags array to prevent duplicate keys
  const uniqueTags = snippet.tags ? [...new Set(snippet.tags)] : [];

  // Handle both single category (legacy) and multiple categories
  const displayCategories = snippet.categories && Array.isArray(snippet.categories)
    ? snippet.categories
    : (snippet.category ? [snippet.category] : ['Uncategorized']);

  return (
    <div className="glass-effect rounded-xl p-6 card-hover group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {snippet.title}
          </h3>

          {/* // ✅ UPDATED (2025-10-16 13:51 IST)
          // Replace plain text description with markdown rendering */}
          <MarkdownPreview content={snippet.description || ''} className="mb-3" />

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Display multiple categories */}
            {displayCategories.map((category, index) => (
              <span
                key={`${snippet.id}-category-${index}`}
                className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full"
              >
                {category}
              </span>
            ))}

            {/* Language badge */}
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
              {snippet.language || 'text'}
            </span>

            {/* Tags */}
            {uniqueTags.map((tag, index) => (
              <span
                key={`${snippet.id}-tag-${index}-${tag}`}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
              >
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

      {/* Multi-snippet support or single snippet fallback */}
      {snippet.snippets && snippet.snippets.length > 0 ? (
        // Multiple code snippets with individual descriptions
        snippet.snippets.map((codeItem, index) => {
          const isExpanded = showFullCodeIndexes.includes(index);
          const code = codeItem.code || '';
          const description = codeItem.description || `Code ${index + 1}`;
          const truncatedCode = code.length > 200 ? code.substring(0, 200) + '...' : code;

          return (
            <div key={`${snippet.id}-multi-${index}`} className="mb-4">
              {/* Individual snippet description */}
              <div className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                {description}
              </div>

              {/* Clickable code block with hidden scrollbar and dynamic theme */}
              <div
                className="cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-600 rounded-lg overflow-hidden"
                onClick={() => copyToClipboard(code)}
                title="Click to copy this snippet"
              >
                <div className="scrollbar-hide overflow-x-auto">
                  <SyntaxHighlighter
                    language={codeItem.language || snippet.language || 'text'}
                    style={getSyntaxTheme()}
                    className="rounded-lg scrollbar-hide"
                    showLineNumbers={code.split('\n').length > 3}
                    wrapLongLines={false}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      overflowX: 'auto',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      background: theme === 'dark' ? '#1e1e1e' : '#fafafa',
                    }}
                  >
                    {isExpanded ? code : truncatedCode}
                  </SyntaxHighlighter>
                </div>
              </div>

              {/* Show more/less button */}
              {code.length > 200 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCodeExpansion(index);
                  }}
                  className="mt-2 text-primary-600 dark:text-primary-400 text-sm hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          );
        })
      ) : (
        // Single code snippet (legacy support) with hidden scrollbar and dynamic theme
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-600 rounded-lg overflow-hidden"
          onClick={() => copyToClipboard(snippet.code)}
          title="Click to copy this snippet"
        >
          <div className="scrollbar-hide overflow-x-auto">
            <SyntaxHighlighter
              language={snippet.language || 'text'}
              style={getSyntaxTheme()}
              className="rounded-lg scrollbar-hide"
              showLineNumbers={snippet.code?.split('\n').length > 3}
              wrapLongLines={false}
              customStyle={{
                margin: 0,
                padding: '1rem',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                background: theme === 'dark' ? '#1e1e1e' : '#fafafa',
              }}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetCard;
