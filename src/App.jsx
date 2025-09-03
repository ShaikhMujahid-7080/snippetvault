import { useState, useEffect, useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdAdd, MdDownload, MdUpload, MdFavorite } from 'react-icons/md';

import SnippetCard from './components/SnippetCard';
import AddSnippetModal from './components/AddSnippetModal';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import { useLocalStorage } from './hooks/useLocalStorage';
import { exportSnippets, importSnippets } from './utils/storage';

// Sample initial data
const initialSnippets = [
  {
    id: 1,
    title: "React useState Hook",
    description: "Basic useState example with counter",
    code: "import { useState } from 'react';\n\nconst Counter = () => {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n};",
    category: "React",
    language: "javascript",
    tags: ["hook", "state", "counter"],
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "CSS Flexbox Center",
    description: "Center element using flexbox",
    code: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}",
    category: "CSS",
    language: "css",
    tags: ["flexbox", "center", "layout"],
    isFavorite: true,
    createdAt: new Date().toISOString()
  }
];

const defaultCategories = ["React", "CSS", "JavaScript", "Python", "Markdown", "Command Line"];

function App() {
  const [snippets, setSnippets] = useLocalStorage('snippets', initialSnippets);
  const [categories, setCategories] = useLocalStorage('categories', defaultCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: '' });
  const [view, setView] = useState('all'); // 'all', 'favorites'

  const filteredSnippets = useMemo(() => {
    // Ensure snippets is an array before filtering
    if (!Array.isArray(snippets)) {
      return [];
    }
    return snippets.filter(snippet => {
      const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = !filters.category || snippet.category === filters.category;
      const matchesFavorites = view === 'all' || (view === 'favorites' && snippet.isFavorite);

      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [snippets, searchTerm, filters, view]);

  const handleSaveSnippet = (snippetData) => {
    if (editingSnippet) {
      setSnippets(prev => prev.map(s => s.id === editingSnippet.id ? snippetData : s));
    } else {
      setSnippets(prev => [...prev, snippetData]);
    }
    setEditingSnippet(null);
  };

  const handleEditSnippet = (snippet) => {
    setEditingSnippet(snippet);
    setIsModalOpen(true);
  };

  const handleDeleteSnippet = (id) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      setSnippets(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleToggleFavorite = (id) => {
    setSnippets(prev => prev.map(s =>
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    ));
  };

  const handleExport = () => {
    exportSnippets(snippets);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importSnippets(file)
        .then(imported => {
          setSnippets(imported);
          toast.success('Snippets imported successfully!');
        })
        .catch(error => {
          toast.error('Failed to import snippets');
          console.error(error);
        });
    }
  };

  const favoriteCount = snippets.filter(s => s.isFavorite).length;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                SnippetVault
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your personal code snippet manager
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              <button
                onClick={() => setView(view === 'all' ? 'favorites' : 'all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${view === 'favorites'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'glass-effect hover:bg-white/20 dark:hover:bg-gray-700/30 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <MdFavorite className="w-4 h-4" />
                Favorites ({favoriteCount})
              </button>

              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors text-gray-700 dark:text-gray-300">
                <MdUpload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors text-gray-700 dark:text-gray-300"
              >
                <MdDownload className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={() => {
                  setEditingSnippet(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <MdAdd className="w-4 h-4" />
                Add Snippet
              </button>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <SearchBar
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          categories={categories}
        />

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-lg p-4">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {snippets.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Snippets
            </div>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Categories
            </div>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {favoriteCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Favorites
            </div>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {filteredSnippets.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {view === 'favorites' ? 'Showing' : 'Filtered'}
            </div>
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSnippets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {view === 'favorites' ? 'No favorites yet' : 'No snippets found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {view === 'favorites'
                  ? 'Star some snippets to see them here!'
                  : searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Create your first snippet to get started'
                }
              </p>
            </div>
          ) : (
            filteredSnippets.map(snippet => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onEdit={handleEditSnippet}
                onDelete={handleDeleteSnippet}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        <AddSnippetModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSnippet(null);
          }}
          onSave={handleSaveSnippet}
          snippet={editingSnippet}
          categories={categories}
        />

        {/* Toast Container */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="!z-50"
        />
      </div>
    </div>
  );
}

export default App;
