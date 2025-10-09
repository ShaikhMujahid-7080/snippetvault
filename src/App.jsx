import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAllSnippets, addSnippet, updateSnippet, deleteSnippet } from "./utils/firebaseSnippets";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdAdd, MdDownload, MdUpload, MdCode, MdFavorite, MdCategory, MdVisibility, MdLogout, MdAdminPanelSettings, MdRefresh, MdClose } from 'react-icons/md';

import SnippetCard from './components/SnippetCard';
import AddSnippetModal from './components/AddSnippetModal';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import CategoryTabs from './components/CategoryTabs';
import ConfirmationDialog from './components/ConfirmationDialog';
import AuthPage from './components/Auth/AuthPage';
import AdminPanel from './components/Admin/AdminPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { exportSnippets, importSnippets } from './utils/storage';
import { useLocalStorage } from './hooks/useLocalStorage';

const defaultCategories = ["All", "Favourite", "General", "Markdown", "GitHub", "GPT for Study", "ADB", "CMD", "LaTeX", "Uncategorized"];
const defaultLanguages = ["JavaScript", "Python", "CSS", "HTML", "JSON", "Markdown", "Bash", "SQL", "TypeScript", "React", "Node.js", "PHP", "Java", "C++", "Go", "Rust"];

const getBasename = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? '' : '/snippetvault';
};

// Helper function to ensure data is serializable
const cleanSnippetData = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  return {
    title: String(data.title || ''),
    description: String(data.description || ''),
    content: String(data.content || ''),
    language: String(data.language || ''),
    category: String(data.category || 'Uncategorized'),
    categories: Array.isArray(data.categories) ? data.categories.filter(Boolean) : [data.category || 'Uncategorized'],
    tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
    isFavorite: Boolean(data.isFavorite),
    snippets: Array.isArray(data.snippets) ? data.snippets : []
  };
};

function AppContent() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useLocalStorage(`categories-${currentUser?.uid}`, defaultCategories);
  const [languages] = useState(defaultLanguages);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [filters, setFilters] = useState({
    language: '',
    hasDescription: false,
    hasMultipleSnippets: false,
    sortBy: 'newest'
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  // Enhanced initial load effect - runs immediately when user is available
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (!currentUser?.uid) {
        setSnippets([]);
        setLoading(false);
        setInitialLoadComplete(true);
        return;
      }

      console.log('Initial load starting for user:', currentUser.uid);
      setLoading(true);
      setError(null);
      
      try {
        const data = await getAllSnippets(currentUser.uid);
        
        if (isMounted) {
          setSnippets(Array.isArray(data) ? data : []);
          console.log(`Initial load complete: ${data?.length || 0} snippets`);
        }
      } catch (error) {
        console.error('Initial load error:', error);
        if (isMounted) {
          setError(error.message || 'Failed to load snippets');
          setSnippets([]);
          toast.error('Failed to load snippets on startup', {
            toastId: 'initial-load-error',
            autoClose: 5000
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoadComplete(true);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]); // Only depend on user ID

  const fetchSnippets = async () => {
    if (!currentUser?.uid) {
      console.log('No valid current user, skipping fetch');
      return;
    }

    console.log('Manual fetch starting for user:', currentUser.uid);
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAllSnippets(currentUser.uid);
      
      setSnippets(Array.isArray(data) ? data : []);
      
      if (data && data.length > 0) {
        console.log(`Manual fetch complete: ${data.length} snippets`);
        toast.success(`Loaded ${data.length} snippets`, {
          autoClose: 2000
        });
      } else {
        console.log('No snippets found for user');
      }
    } catch (error) {
      console.error('Manual fetch error:', error);
      setError(error.message || 'Failed to load snippets');
      setSnippets([]);
      
      toast.error('Failed to load snippets. Please try refreshing.', {
        toastId: 'fetch-error',
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSnippets = useMemo(() => {
    if (!Array.isArray(snippets)) return [];

    let filtered = snippets.filter(snippet => {
      let matchesCategory = activeCategory === 'All';
      
      if (activeCategory === 'Favourite') {
        matchesCategory = snippet.isFavorite;
      } else if (!matchesCategory) {
        if (snippet.categories && Array.isArray(snippet.categories)) {
          matchesCategory = snippet.categories.includes(activeCategory);
        } else if (snippet.category) {
          matchesCategory = snippet.category === activeCategory;
        }
      }

      const matchesSearch =
        snippet.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLanguage = !filters.language || snippet.language === filters.language;
      const matchesDescription = !filters.hasDescription || (snippet.description && snippet.description.trim());
      const matchesMultiSnippets = !filters.hasMultipleSnippets || (snippet.snippets && snippet.snippets.length > 0);

      return matchesCategory && matchesSearch && matchesLanguage && matchesDescription && matchesMultiSnippets;
    });

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
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [snippets, activeCategory, searchTerm, filters]);

  const showConfirmDialog = (title, message, onConfirm, type = 'danger') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'danger'
    });
  };

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

  const handleReorderCategories = (newCategories) => {
    setCategories(newCategories);
    toast.success('Categories reordered!');
  };

  const handleSaveSnippet = async (snippetData) => {
    if (!currentUser?.uid) {
      toast.error('You must be logged in to save snippets');
      return;
    }

    try {
      console.log('Saving snippet:', snippetData);
      
      // Clean and validate the snippet data
      const cleanData = cleanSnippetData(snippetData);
      
      // Handle new categories
      if (cleanData.categories && Array.isArray(cleanData.categories)) {
        const newCategories = cleanData.categories.filter(cat => !categories.includes(cat));
        if (newCategories.length > 0) {
          setCategories(prev => [...prev, ...newCategories]);
        }
      }

      if (snippetData.id && editingSnippet) {
        // Update existing snippet
        console.log('Updating existing snippet:', snippetData.id);
        await updateSnippet(String(snippetData.id), cleanData, currentUser.uid);
        toast.success('Snippet updated successfully!');
      } else {
        // Add new snippet
        console.log('Adding new snippet');
        await addSnippet(cleanData, currentUser.uid);
        toast.success('Snippet added successfully!');
      }
      
      setEditingSnippet(null);
      setIsModalOpen(false);
      
      // Refresh snippets list
      await fetchSnippets();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Failed to save snippet: ${error.message}`, {
        autoClose: 5000
      });
    }
  };

  const handleEditSnippet = (snippet) => {
    console.log('Editing snippet:', snippet);
    if (snippet && snippet.id) {
      // Create a clean copy for editing
      const editableSnippet = {
        ...snippet,
        // Ensure all required fields exist
        title: snippet.title || '',
        description: snippet.description || '',
        content: snippet.content || '',
        language: snippet.language || '',
        category: snippet.category || 'Uncategorized',
        categories: snippet.categories || [snippet.category || 'Uncategorized'],
        tags: snippet.tags || [],
        snippets: snippet.snippets || [],
        isFavorite: Boolean(snippet.isFavorite)
      };
      
      setEditingSnippet(editableSnippet);
      setIsModalOpen(true);
    } else {
      toast.error('Invalid snippet selected for editing');
    }
  };

  const handleDeleteSnippet = (id) => {
    if (!id) {
      toast.error('Invalid snippet ID for deletion');
      return;
    }

    const snippet = snippets.find(s => s.id === id);
    const snippetTitle = snippet ? snippet.title : 'this snippet';
    
    console.log('Requesting delete for snippet:', id, snippetTitle);
    
    showConfirmDialog(
      'Delete Snippet',
      `Are you sure you want to delete "${snippetTitle}"? This action cannot be undone.`,
      async () => {
        try {
          console.log('Confirmed delete for snippet:', id);
          await deleteSnippet(String(id), currentUser.uid);
          toast.success('Snippet deleted successfully!');
          
          // Refresh snippets list
          await fetchSnippets();
        } catch (error) {
          console.error('Delete error:', error);
          toast.error(`Failed to delete snippet: ${error.message}`, {
            autoClose: 5000
          });
        }
      }
    );
  };

  const handleToggleFavorite = async (id) => {
    if (!id || !currentUser?.uid) {
      toast.error('Cannot update favorite status');
      return;
    }

    try {
      const snippet = snippets.find(s => s.id === id);
      if (!snippet) {
        toast.error('Snippet not found');
        return;
      }
      
      console.log('Toggling favorite for snippet:', id, 'current:', snippet.isFavorite);
      
      // Create updated snippet data
      const updatedSnippet = cleanSnippetData({
        ...snippet, 
        isFavorite: !snippet.isFavorite 
      });
      
      // Optimistically update UI
      setSnippets(prevSnippets => 
        prevSnippets.map(s => 
          s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
        )
      );
      
      // Update in database
      await updateSnippet(String(id), updatedSnippet, currentUser.uid);
      
      // Refresh to ensure consistency
      await fetchSnippets();
      
      toast.success(updatedSnippet.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      
    } catch (error) {
      console.error('Toggle favorite error:', error);
      
      // Revert optimistic update on error
      setSnippets(prevSnippets => 
        prevSnippets.map(s => 
          s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
        )
      );
      
      toast.error('Failed to update favorite status. Please try again.');
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
      async () => {
        try {
          const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
          setCategories(updatedCategories);
          
          if (activeCategory === categoryToDelete) {
            setActiveCategory('All');
          }
          
          // Update snippets that use this category
          const snippetsToUpdate = snippets.filter(snippet => {
            if (snippet.categories && Array.isArray(snippet.categories)) {
              return snippet.categories.includes(categoryToDelete);
            } else if (snippet.category) {
              return snippet.category === categoryToDelete;
            }
            return false;
          });

          // Update each affected snippet
          for (const snippet of snippetsToUpdate) {
            let newSnippet = cleanSnippetData(snippet);
            
            if (snippet.categories && Array.isArray(snippet.categories)) {
              newSnippet.categories = snippet.categories.filter(cat => cat !== categoryToDelete);
              if (newSnippet.categories.length === 0) {
                newSnippet.categories = ['Uncategorized'];
              }
              newSnippet.category = newSnippet.categories[0];
            } else if (snippet.category === categoryToDelete) {
              newSnippet.category = 'Uncategorized';
              newSnippet.categories = ['Uncategorized'];
            }
            
            try {
              await updateSnippet(String(snippet.id), newSnippet, currentUser.uid);
            } catch (error) {
              console.error('Error updating snippet category:', error);
            }
          }

          // Refresh snippets
          await fetchSnippets();
          toast.success(`Category "${categoryToDelete}" deleted and snippets updated!`);
        } catch (error) {
          console.error('Error deleting category:', error);
          toast.error('Failed to delete category');
        }
      },
      'warning'
    );
  };

  const handleExport = () => {
    exportSnippets(snippets);
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      showConfirmDialog(
        'Import Snippets',
        'This will add the imported snippets to your collection. Are you sure you want to continue?',
        async () => {
          try {
            const imported = await importSnippets(file);
            for (let snippet of imported) {
              const cleanData = cleanSnippetData(snippet);
              await addSnippet(cleanData, currentUser.uid);
            }
            await fetchSnippets();
            toast.success('Snippets imported successfully!');
          } catch (error) {
            toast.error(`Failed to import snippets: ${error.message}`);
          }
        },
        'warning'
      );
    }
  };

  const handleLogout = () => {
    showConfirmDialog(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        try {
          await logout();
          toast.success('Signed out successfully');
        } catch (error) {
          toast.error('Failed to sign out');
        }
      }
    );
  };

  const favoriteCount = Array.isArray(snippets)
    ? snippets.filter(s => s.isFavorite).length
    : 0;

  if (!currentUser) {
    return <AuthPage />;
  }

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
                Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{userProfile?.displayName || currentUser.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ThemeToggle />
              
              <button
                onClick={fetchSnippets}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105 disabled:opacity-50"
                title="Refresh snippets"
              >
                <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105"
                  title="Admin Panel"
                >
                  <MdAdminPanelSettings className="w-4 h-4" />
                  Admin
                </button>
              )}
              
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
                disabled={snippets.length === 0}
                className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105 disabled:opacity-50"
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

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105"
                title="Sign Out"
              >
                <MdLogout className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-700 dark:text-red-300">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
          favoriteCount={favoriteCount}
        />

        {/* Search and Filters */}
        <SearchBar
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
        />

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full">
                <MdCode className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="stat-number">
              {!initialLoadComplete ? '--' : snippets.length}
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
              {categories.length - 2}
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
              {!initialLoadComplete ? '--' : favoriteCount}
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
              {!initialLoadComplete ? '--' : filteredSnippets.length}
            </div>
            <div className="stat-label">Showing</div>
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
              <span className="text-xl text-gray-600 dark:text-gray-400">
                {initialLoadComplete ? 'Refreshing snippets...' : 'Loading snippets...'}
              </span>
            </div>
          ) : filteredSnippets.length === 0 && !error ? (
            <div className="col-span-full">
              <div className="empty-state">
                <div className="text-8xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                  {snippets.length === 0 ? 'No snippets yet' : 'No snippets match your filter'}
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                  {snippets.length === 0 
                    ? 'Create your first snippet to get started!' 
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
                {snippets.length === 0 && (
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

        {/* Admin Panel */}
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
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

// 404 Not Found Component
function NotFound() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Navigate to="/" replace />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename={getBasename()}>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
