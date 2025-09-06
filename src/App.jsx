import { useState, useEffect, useMemo } from 'react';
import { getAllSnippets, addSnippet, updateSnippet, deleteSnippet } from "./utils/firebaseSnippets";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdAdd, MdDownload, MdUpload, MdCode, MdFavorite, MdCategory, MdVisibility } from 'react-icons/md';

import SnippetCard from './components/SnippetCard';
import AddSnippetModal from './components/AddSnippetModal';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import CategoryTabs from './components/CategoryTabs';
import ConfirmationDialog from './components/ConfirmationDialog';
import { exportSnippets, importSnippets } from './utils/storage';
import { useLocalStorage } from './hooks/useLocalStorage';

const defaultCategories = ["All", "Favourite", "General", "Markdown", "GitHub", "GPT for Study", "ADB", "CMD", "LaTeX", "Uncategorized"];
const defaultLanguages = ["JavaScript", "Python", "CSS", "HTML", "JSON", "Markdown", "Bash", "SQL", "TypeScript", "React", "Node.js", "PHP", "Java", "C++", "Go", "Rust"];

function App() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useLocalStorage('categories', defaultCategories); // Persist category order
  const [languages] = useState(defaultLanguages);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    language: '',
    hasDescription: false,
    hasMultipleSnippets: false,
    sortBy: 'newest'
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  // Load from Firestore on mount
  useEffect(() => {
    const fetchSnippets = async () => {
      setLoading(true);
      try {
        const data = await getAllSnippets();
        setSnippets(data || []);
      } catch (error) {
        console.error('Error loading snippets:', error);
        toast.error('Failed to load snippets');
      } finally {
        setLoading(false);
      }
    };
    fetchSnippets();
  }, []);

  const filteredSnippets = useMemo(() => {
    if (!Array.isArray(snippets)) return [];

    let filtered = snippets.filter(snippet => {
      // Category filter (from tabs) - support multiple categories
      let matchesCategory = activeCategory === 'All';
      
      if (activeCategory === 'Favourite') {
        matchesCategory = snippet.isFavorite;
      } else if (!matchesCategory) {
        // Check if snippet has categories array or single category
        if (snippet.categories && Array.isArray(snippet.categories)) {
          matchesCategory = snippet.categories.includes(activeCategory);
        } else if (snippet.category) {
          matchesCategory = snippet.category === activeCategory;
        }
      }

      // Search filter
      const matchesSearch =
        snippet.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Advanced filters
      const matchesLanguage = !filters.language || snippet.language === filters.language;
      const matchesDescription = !filters.hasDescription || (snippet.description && snippet.description.trim());
      const matchesMultiSnippets = !filters.hasMultipleSnippets || (snippet.snippets && snippet.snippets.length > 0);

      return matchesCategory && matchesSearch && matchesLanguage && matchesDescription && matchesMultiSnippets;
    });

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'updated':
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [snippets, activeCategory, searchTerm, filters]);

  // Show confirmation dialog
  const showConfirmDialog = (title, message, onConfirm, type = 'danger') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'danger'
    });
  };

  // Category management functions
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handleAddCategory = (newCategoryName) => {
    if (!categories.includes(newCategoryName)) {
      setCategories(prev => [...prev, newCategoryName]);
      toast.success(`Category "${newCategoryName}" added!`);
    } else {
      toast.error('Category already exists!');
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    const protectedCategories = ['All', 'Favourite', 'Uncategorized'];
    if (protectedCategories.includes(categoryToDelete)) {
      toast.error(`Cannot delete "${categoryToDelete}" category`);
      return;
    }

    showConfirmDialog(
      'Delete Category',
      `Are you sure you want to delete the "${categoryToDelete}" category? All snippets in this category will be moved to "Uncategorized".`,
      () => {
        const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
        setCategories(updatedCategories);
        
        // If the deleted category was active, switch to "All"
        if (activeCategory === categoryToDelete) {
          setActiveCategory('All');
        }
        
        // Update snippets that had this category
        const updatedSnippets = snippets.map(snippet => {
          let newSnippet = { ...snippet };
          
          // Handle multiple categories
          if (snippet.categories && Array.isArray(snippet.categories)) {
            newSnippet.categories = snippet.categories.filter(cat => cat !== categoryToDelete);
            if (newSnippet.categories.length === 0) {
              newSnippet.categories = ['Uncategorized'];
            }
            newSnippet.category = newSnippet.categories[0]; // Keep backward compatibility
          } else if (snippet.category === categoryToDelete) {
            newSnippet.category = 'Uncategorized';
            newSnippet.categories = ['Uncategorized'];
          }
          
          return newSnippet;
        });
        
        // Update in Firestore
        updatedSnippets.forEach(async (snippet, index) => {
          if (snippet !== snippets[index]) { // Only update if changed
            try {
              await updateSnippet(snippet.id, snippet);
            } catch (error) {
              console.error('Error updating snippet category:', error);
            }
          }
        });

        setSnippets(updatedSnippets);
        toast.success(`Category "${categoryToDelete}" deleted!`);
      },
      'warning'
    );
  };

  const handleReorderCategories = (newCategories) => {
    setCategories(newCategories);
    toast.success('Categories reordered!');
  };

  // Snippet management functions
  const handleSaveSnippet = async (snippetData) => {
    try {
      // Add new categories to categories list if they don't exist
      if (snippetData.categories && Array.isArray(snippetData.categories)) {
        const newCategories = snippetData.categories.filter(cat => !categories.includes(cat));
        if (newCategories.length > 0) {
          setCategories(prev => [...prev, ...newCategories]);
        }
      } else if (snippetData.category && !categories.includes(snippetData.category)) {
        setCategories(prev => [...prev, snippetData.category]);
      }

      if (snippetData.id && editingSnippet) {
        await updateSnippet(snippetData.id, snippetData);
        toast.success('Snippet updated!');
      } else {
        await addSnippet(snippetData);
        toast.success('Snippet added!');
      }
      
      setEditingSnippet(null);
      setIsModalOpen(false);
      
      // Refresh snippets from Firestore
      const updated = await getAllSnippets();
      setSnippets(updated || []);
    } catch (error) {
      console.error("Save error:", error);
      toast.error('Failed to save snippet');
    }
  };

  const handleEditSnippet = (snippet) => {
    setEditingSnippet(snippet);
    setIsModalOpen(true);
  };

  const handleDeleteSnippet = (id) => {
    const snippet = snippets.find(s => s.id === id);
    const snippetTitle = snippet ? snippet.title : 'this snippet';
    
    showConfirmDialog(
      'Delete Snippet',
      `Are you sure you want to delete "${snippetTitle}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteSnippet(id);
          toast.success('Snippet deleted successfully!');
          const updated = await getAllSnippets();
          setSnippets(updated || []);
        } catch (e) {
          toast.error('Failed to delete snippet');
        }
      }
    );
  };

  const handleToggleFavorite = async (id) => {
    try {
      const snippet = snippets.find(s => s.id === id);
      if (!snippet) return;
      await updateSnippet(id, { ...snippet, isFavorite: !snippet.isFavorite });
      const updated = await getAllSnippets();
      setSnippets(updated || []);
    } catch (e) {
      toast.error('Failed to update favorite');
    }
  };

  const handleExport = () => {
    exportSnippets(snippets);
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      showConfirmDialog(
        'Import Snippets',
        'This will replace all current snippets with the imported ones. Are you sure you want to continue?',
        async () => {
          try {
            const imported = await importSnippets(file);
            for (let snippet of snippets) await deleteSnippet(snippet.id);
            for (let snippet of imported) await addSnippet(snippet);
            const updated = await getAllSnippets();
            setSnippets(updated || []);
            toast.success('Snippets imported successfully!');
          } catch (error) {
            toast.error('Failed to import snippets');
          }
        },
        'warning'
      );
    }
  };

  const favoriteCount = Array.isArray(snippets)
    ? snippets.filter(s => s.isFavorite).length
    : 0;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                SnippetVault
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                Your personal code snippet manager with drag-and-drop categories, multi-category support, and enhanced filtering
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ThemeToggle />
              
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105">
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
                className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105"
              >
                <MdDownload className="w-4 h-4" />
                Export
              </button>
              
              <button
                onClick={() => {
                  setEditingSnippet(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <MdAdd className="w-5 h-5" />
                Add Snippet
              </button>
            </div>
          </div>
        </header>

        {/* Draggable Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
          favoriteCount={favoriteCount}
        />

        {/* Enhanced Search and Filters */}
        <SearchBar
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
        />

        {/* Enhanced Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full">
                <MdCode className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="stat-number">
              {loading ? '--' : snippets.length}
            </div>
            <div className="stat-label">Total Snippets</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
                <MdCategory className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="stat-number">
              {categories.length - 2} {/* Exclude "All" and "Favourite" */}
            </div>
            <div className="stat-label">Categories</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full">
                <MdFavorite className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="stat-number">
              {loading ? '--' : favoriteCount}
            </div>
            <div className="stat-label">Favorites</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                <MdVisibility className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="stat-number">
              {loading ? '--' : filteredSnippets.length}
            </div>
            <div className="stat-label">
              {activeCategory === 'Favourite' ? 'Showing' : 'Filtered'}
            </div>
          </div>
        </div>

        {/* Current Category Display */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {activeCategory}
            </h3>
            {activeCategory !== 'All' && (
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full font-medium">
                {filteredSnippets.length} snippets
              </span>
            )}
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
              <span className="text-xl text-gray-600 dark:text-gray-400">Loading snippets...</span>
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="col-span-full">
              <div className="empty-state">
                <div className="text-8xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                  {activeCategory === 'Favourite' ? 'No favorites yet' : 'No snippets found'}
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                  {activeCategory === 'Favourite' 
                    ? 'Star some snippets to see them here!' 
                    : searchTerm 
                      ? 'Try adjusting your search terms or filters'
                      : activeCategory === 'All'
                        ? 'Create your first snippet to get started'
                        : `No snippets in "${activeCategory}" category yet`
                  }
                </p>
                {activeCategory === 'All' && !searchTerm && (
                  <button
                    onClick={() => {
                      setEditingSnippet(null);
                      setIsModalOpen(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Create Your First Snippet
                  </button>
                )}
              </div>
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
          languages={languages}
        />

        {/* Custom Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={closeConfirmDialog}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
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
