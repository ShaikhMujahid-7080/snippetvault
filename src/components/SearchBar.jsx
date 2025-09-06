import { useState } from 'react';
import { MdSearch, MdFilterList, MdClose, MdTrendingUp } from 'react-icons/md';
import { useTheme } from '../hooks/useTheme';

const SearchBar = ({ onSearch, onFilterChange }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    language: '',
    hasDescription: false,
    hasMultipleSnippets: false,
    sortBy: 'newest'
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      language: '',
      hasDescription: false,
      hasMultipleSnippets: false,
      sortBy: 'newest'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false && value !== 'newest'
  );

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MdSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          className="block w-full pl-12 pr-12 py-4 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 text-lg placeholder-gray-500 border-2 border-transparent focus:border-indigo-300 transition-all duration-300"
          placeholder="Search snippets by title, description, or tags..."
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-200 ${
            hasActiveFilters 
              ? 'text-indigo-600 hover:text-indigo-700' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Toggle filters"
        >
          <MdFilterList className="h-6 w-6" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="glass-effect rounded-xl p-6 space-y-6 animate-slide-up border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdTrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Advanced Filters
              </h3>
            </div>
            <div className="flex gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Language Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Programming Language
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className={`w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-all duration-200 hover:border-indigo-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-750' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <option value="" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>All Languages</option>
                <option value="javascript" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>JavaScript</option>
                <option value="python" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Python</option>
                <option value="css" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>CSS</option>
                <option value="html" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>HTML</option>
                <option value="json" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>JSON</option>
                <option value="markdown" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Markdown</option>
                <option value="bash" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Bash</option>
                <option value="sql" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>SQL</option>
                <option value="typescript" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>TypeScript</option>
                <option value="react" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>React</option>
                <option value="php" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>PHP</option>
                <option value="java" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Java</option>
                <option value="cpp" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>C++</option>
                <option value="go" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Go</option>
                <option value="rust" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Rust</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className={`w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-all duration-200 hover:border-indigo-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-750' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <option value="newest" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Newest First</option>
                <option value="oldest" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Oldest First</option>
                <option value="alphabetical" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Alphabetical</option>
                <option value="updated" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}>Recently Updated</option>
              </select>
            </div>

            {/* Has Description Filter */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center space-x-3 cursor-pointer p-3 glass-effect rounded-lg hover:bg-white/20 transition-colors duration-200">
                <input
                  type="checkbox"
                  id="hasDescription"
                  checked={filters.hasDescription}
                  onChange={(e) => handleFilterChange('hasDescription', e.target.checked)}
                  className="custom-checkbox"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Has Description
                </span>
              </label>
            </div>

            {/* Has Multiple Snippets Filter */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center space-x-3 cursor-pointer p-3 glass-effect rounded-lg hover:bg-white/20 transition-colors duration-200">
                <input
                  type="checkbox"
                  id="hasMultipleSnippets"
                  checked={filters.hasMultipleSnippets}
                  onChange={(e) => handleFilterChange('hasMultipleSnippets', e.target.checked)}
                  className="custom-checkbox"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Multi-Snippet Cards
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
