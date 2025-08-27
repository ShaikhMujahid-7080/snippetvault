import { useState, useEffect } from 'react';
import { MdClose, MdAdd } from 'react-icons/md';
import { detectLanguage } from '../utils/codeLanguageDetector';

const AddSnippetModal = ({ isOpen, onClose, onSave, snippet, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    category: '',
    tags: '',
    language: 'text'
  });

  useEffect(() => {
    if (snippet) {
      setFormData({
        ...snippet,
        tags: snippet.tags?.join(', ') || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        code: '',
        category: categories[0] || '',
        tags: '',
        language: 'text'
      });
    }
  }, [snippet, categories, isOpen]);

  const handleCodeChange = (e) => {
    const code = e.target.value;
    const detectedLang = detectLanguage(code);
    setFormData(prev => ({
      ...prev,
      code,
      language: detectedLang
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const snippetData = {
      ...formData,
      tags,
      id: snippet?.id || Date.now(),
      createdAt: snippet?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: snippet?.isFavorite || false
    };
    
    onSave(snippetData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 glass-effect rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              placeholder="Brief description of the snippet"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 glass-effect rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-white dark:bg-gray-800">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language (auto-detected: {formData.language})
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="w-full p-3 glass-effect rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                placeholder="e.g., javascript, python, css"
              />
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Code *
            </label>
            <textarea
              required
              value={formData.code}
              onChange={handleCodeChange}
              rows="10"
              className="w-full p-3 glass-effect rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-mono text-sm resize-y"
              placeholder="Paste your code here..."
            />
          </div>

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
