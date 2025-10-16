import { useState, useEffect } from 'react';
import { MdClose, MdAdd, MdRemove } from 'react-icons/md';
import Select from 'react-select/creatable';
import { detectLanguage } from '../utils/codeLanguageDetector';
import { useTheme } from '../hooks/useTheme';

const AddSnippetModal = ({ isOpen, onClose, onSave, snippet, categories = [], languages = [] }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    categories: [], // Multiple categories support
    language: 'text',
    tags: '',
    snippets: []
  });

  const [useMultiSnippets, setUseMultiSnippets] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('');
  const [showLanguageInput, setShowLanguageInput] = useState(false);

  // Dynamic React-Select styles based on theme
  const getSelectStyles = () => ({
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
      borderColor: state.isFocused
        ? (theme === 'dark' ? '#6366f1' : '#4f46e5')
        : (theme === 'dark' ? '#4b5563' : '#d1d5db'),
      color: theme === 'dark' ? '#f9fafb' : '#374151',
      minHeight: '2.75rem',
      boxShadow: state.isFocused
        ? `0 0 0 3px ${theme === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`
        : provided.boxShadow,
      '&:hover': {
        borderColor: theme === 'dark' ? '#6366f1' : '#4f46e5',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
      border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
      boxShadow: theme === 'dark'
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? (theme === 'dark' ? '#4f46e5' : '#e0e7ff')
        : state.isSelected
          ? (theme === 'dark' ? '#6366f1' : '#4f46e5')
          : 'transparent',
      color: state.isSelected || state.isFocused
        ? (theme === 'dark' ? '#ffffff' : state.isSelected ? '#ffffff' : '#1f2937')
        : (theme === 'dark' ? '#f9fafb' : '#374151'),
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme === 'dark' ? '#4f46e5' : '#e0e7ff',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#6366f1' : '#e0e7ff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#ffffff' : '#1e40af',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#ffffff' : '#1e40af',
      '&:hover': {
        backgroundColor: theme === 'dark' ? '#ef4444' : '#fee2e2',
        color: theme === 'dark' ? '#ffffff' : '#dc2626',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#f9fafb' : '#374151',
    }),
  });

  useEffect(() => {
    const safeCategories = Array.isArray(categories)
      ? categories.filter(cat => typeof cat === 'string' && cat.length > 0)
      : [];

    const safeLanguages = Array.isArray(languages)
      ? languages.filter(lang => typeof lang === 'string' && lang.length > 0)
      : [];

    const defaultLanguage = safeLanguages[0] || 'text';

    if (snippet) {
      const hasMultiSnippets = snippet.snippets && snippet.snippets.length > 0;
      setUseMultiSnippets(hasMultiSnippets);

      // Handle both single category (legacy) and multiple categories
      let snippetCategories = [];
      if (snippet.categories && Array.isArray(snippet.categories)) {
        snippetCategories = snippet.categories;
      } else if (snippet.category) {
        snippetCategories = [snippet.category];
      } else {
        snippetCategories = ['Uncategorized'];
      }

      setFormData({
        title: String(snippet.title || ''),
        description: String(snippet.description || ''),
        code: hasMultiSnippets ? '' : String(snippet.code || ''),
        categories: snippetCategories,
        language: String(snippet.language || defaultLanguage),
        tags: Array.isArray(snippet.tags) ? snippet.tags.join(', ') : String(snippet.tags || ''),
        snippets: hasMultiSnippets ? snippet.snippets : []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        code: '',
        categories: ['Uncategorized'], // Default to Uncategorized
        language: defaultLanguage,
        tags: '',
        snippets: []
      });
      setUseMultiSnippets(false);
    }

    setShowLanguageInput(false);
    setCustomLanguage('');
  }, [snippet, categories, languages, isOpen]);

  const handleCodeChange = (e) => {
    const code = e.target.value;
    const detectedLang = detectLanguage(code);
    setFormData(prev => ({
      ...prev,
      code,
      language: detectedLang
    }));
  };

  const processTagsInput = (tagsString) => {
    if (!tagsString || !tagsString.trim()) return [];

    const tags = String(tagsString)
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const uniqueTags = [];
    const seen = new Set();

    for (const tag of tags) {
      const lowerTag = tag.toLowerCase();
      if (!seen.has(lowerTag)) {
        seen.add(lowerTag);
        uniqueTags.push(tag);
      }
    }

    return uniqueTags;
  };

  // Multi-snippet functions
  const addSnippetBlock = () => {
    setFormData(prev => ({
      ...prev,
      snippets: [...prev.snippets, { code: '', description: '', language: 'text' }]
    }));
  };

  const removeSnippetBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      snippets: prev.snippets.filter((_, i) => i !== index)
    }));
  };

  const updateSnippetBlock = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      snippets: prev.snippets.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value };
          if (field === 'code') {
            updated.language = detectLanguage(value);
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const toggleMultiSnippets = () => {
    setUseMultiSnippets(prev => {
      const newValue = !prev;
      if (newValue && formData.snippets.length === 0) {
        setFormData(prevForm => ({
          ...prevForm,
          snippets: [{ code: prevForm.code, description: 'Main code', language: prevForm.language }]
        }));
      }
      return newValue;
    });
  };

  const handleAddCustomLanguage = () => {
    if (customLanguage.trim()) {
      setFormData(prev => ({
        ...prev,
        language: customLanguage.trim()
      }));
      setCustomLanguage('');
      setShowLanguageInput(false);
    }
  };

  // Handle category changes for multi-select
  const handleCategoryChange = (selectedOptions) => {
    const selectedCategories = selectedOptions
      ? selectedOptions.map(option => option.value)
      : ['Uncategorized'];

    // Ensure at least one category is selected, default to Uncategorized
    const finalCategories = selectedCategories.length > 0 ? selectedCategories : ['Uncategorized'];

    setFormData(prev => ({
      ...prev,
      categories: finalCategories
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const processedTags = processTagsInput(formData.tags);

    // Ensure categories array has at least Uncategorized
    const finalCategories = formData.categories.length > 0 ? formData.categories : ['Uncategorized'];

    const snippetData = {
      title: formData.title,
      description: formData.description,
      categories: finalCategories, // Use multiple categories
      category: finalCategories[0], // Keep single category for backward compatibility
      tags: processedTags,
      id: snippet?.id || Date.now(),
      createdAt: snippet?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: snippet?.isFavorite || false
    };

    if (useMultiSnippets && formData.snippets.length > 0) {
      snippetData.snippets = formData.snippets;
      snippetData.language = formData.snippets[0]?.language || 'text';
      snippetData.code = ''; // Clear single code field
    } else {
      snippetData.code = formData.code;
      snippetData.language = formData.language;
      snippetData.snippets = []; // Clear multi snippets
    }

    onSave(snippetData);
  };

  const safeCategories = Array.isArray(categories)
    ? categories.filter(cat => typeof cat === 'string' && cat.length > 0)
    : [];

  const safeLanguages = Array.isArray(languages)
    ? languages.filter(lang => typeof lang === 'string' && lang.length > 0)
    : [];

  // Prepare category options for react-select
  const categoryOptions = safeCategories
    .filter(cat => cat !== 'All' && cat !== 'Favourite') // Exclude special tabs
    .map(cat => ({
      value: cat,
      label: cat
    }));

  const selectedCategoryOptions = formData.categories.map(cat => ({
    value: cat,
    label: cat
  }));

  const previewTags = processTagsInput(formData.tags);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {snippet ? 'Edit Snippet' : 'Add New Snippet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors"
          >
            <MdClose className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 glass-effect rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              placeholder="Enter snippet title"
            />
          </div>

          <div>
            {/* // ✅ UPDATED (2025-10-16 14:13 IST) */}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 glass-effect rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 resize-y"
              placeholder="Brief description of the snippet (supports Markdown)"
            />

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categories * (Multiple Selection Supported)
              </label>
              <div className="react-select-container">
                <Select
                  isMulti
                  isCreatable
                  options={categoryOptions}
                  value={selectedCategoryOptions}
                  onChange={handleCategoryChange}
                  placeholder="Select or create categories..."
                  styles={getSelectStyles()}
                  classNamePrefix="react-select"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Default: Uncategorized. Type to create new categories.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language *
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className={`flex-1 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'glass-effect text-gray-900'
                    }`}
                >
                  {safeLanguages.map((language) => (
                    <option
                      key={language}
                      value={language}
                      className={theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}
                    >
                      {language}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowLanguageInput(!showLanguageInput)}
                  className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  title="Add custom language"
                >
                  + New
                </button>
              </div>

              {showLanguageInput && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomLanguage();
                      }
                    }}
                    placeholder="Enter new language"
                    className="flex-1 p-2 glass-effect rounded text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLanguageInput(false);
                      setCustomLanguage('');
                    }}
                    className="px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full p-3 glass-effect rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              placeholder="e.g., function, utility, helper"
            />
            {formData.tags.trim() && (
              <div className="mt-2 p-2 glass-effect rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Preview ({previewTags.length} unique tags):
                </div>
                <div className="flex flex-wrap gap-1">
                  {previewTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Multiple Snippets Toggle */}
          <div className="p-4 glass-effect rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useMultiSnippets}
                onChange={toggleMultiSnippets}
                className="custom-checkbox"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Multiple Code Snippets
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Add multiple code blocks with individual descriptions to this snippet
                </p>
              </div>
            </label>
          </div>

          {useMultiSnippets ? (
            // Multiple snippet blocks
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code Snippets *
                </label>
                <button
                  type="button"
                  onClick={addSnippetBlock}
                  className="flex items-center gap-2 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors"
                >
                  <MdAdd className="w-4 h-4" />
                  Add Snippet
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                {formData.snippets.map((snippetBlock, index) => (
                  <div key={index} className="p-4 glass-effect rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Snippet {index + 1}
                      </h4>
                      {formData.snippets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSnippetBlock(index)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <MdRemove className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={snippetBlock.description}
                          onChange={(e) => updateSnippetBlock(index, 'description', e.target.value)}
                          className="w-full p-2 glass-effect rounded text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Description for this code block"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Code (auto-detected: {snippetBlock.language})
                        </label>
                        <div className="scrollbar-hide">
                          <textarea
                            value={snippetBlock.code}
                            onChange={(e) => updateSnippetBlock(index, 'code', e.target.value)}
                            rows="6"
                            className="w-full p-3 glass-effect rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-mono text-sm resize-y scrollbar-hide overflow-x-auto"
                            placeholder="Paste your code here..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.snippets.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No code snippets added yet.</p>
                  <p>Click "Add Snippet" to get started.</p>
                </div>
              )}
            </div>
          ) : (
            // Single code block
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code * (auto-detected: {formData.language})
              </label>
              <div className="scrollbar-hide">
                <textarea
                  required
                  value={formData.code}
                  onChange={handleCodeChange}
                  rows="10"
                  className="w-full p-3 glass-effect rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-mono text-sm resize-y scrollbar-hide overflow-x-auto"
                  placeholder="Paste your code here..."
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <MdAdd className="w-4 h-4" />
              {snippet ? 'Update' : 'Save'} Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSnippetModal;
