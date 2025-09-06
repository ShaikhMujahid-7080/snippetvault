import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MdAdd, MdClose, MdDragHandle, MdFavorite, MdCheck, MdCancel } from 'react-icons/md';

const CategoryTabs = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  onAddCategory, 
  onDeleteCategory, 
  onReorderCategories,
  favoriteCount 
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Protected categories that cannot be deleted or moved
  const protectedCategories = new Set(['All', 'Favourite', 'Uncategorized']);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddForm(false);
    }
  };

  const handleCancelAdd = () => {
    setNewCategoryName('');
    setShowAddForm(false);
  };

  const handleDeleteCategory = (categoryToDelete) => {
    if (protectedCategories.has(categoryToDelete)) {
      return; // Don't delete protected categories
    }
    
    onDeleteCategory(categoryToDelete);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    // Don't allow moving protected categories
    const draggedCategory = categories[sourceIndex];
    if (protectedCategories.has(draggedCategory)) {
      return;
    }

    // Create new array with reordered items
    const newCategories = Array.from(categories);
    const [reorderedItem] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(destinationIndex, 0, reorderedItem);
    
    // Save the new order
    onReorderCategories(newCategories);
  };

  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Categories
        </h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <MdAdd className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="mb-4 p-4 glass-effect rounded-lg animate-slide-up border-l-4 border-indigo-500">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newCategoryName.trim()) {
                  handleAddCategory();
                } else if (e.key === 'Escape') {
                  handleCancelAdd();
                }
              }}
              placeholder="Enter category name..."
              className="flex-1 p-3 glass-effect rounded-lg border-2 border-transparent focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 transition-all duration-200"
              autoFocus
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="flex items-center gap-1 px-3 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              title="Add category"
            >
              <MdCheck className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelAdd}
              className="flex items-center gap-1 px-3 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              title="Cancel"
            >
              <MdCancel className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to add, Escape to cancel
          </p>
        </div>
      )}

      {/* Draggable Category Tabs */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="category-tabs" direction="horizontal">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`flex flex-wrap gap-2 border-b-2 border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto scrollbar-hide ${
                snapshot.isDraggingOver ? 'drag-placeholder border-indigo-300' : ''
              }`}
            >
              {categories.map((category, index) => (
                <Draggable
                  key={category}
                  draggableId={`category-${category}`}
                  index={index}
                  isDragDisabled={protectedCategories.has(category)}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group flex items-center gap-2 px-4 py-3 rounded-t-lg cursor-pointer transition-all duration-200 select-none min-w-fit ${
                        activeCategory === category
                          ? 'bg-indigo-600 text-white border-b-2 border-indigo-600 shadow-lg transform -translate-y-0.5'
                          : 'glass-effect text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:shadow-md'
                      } ${
                        snapshot.isDragging ? 'dragging' : ''
                      } ${
                        !protectedCategories.has(category) ? 'hover:transform hover:-translate-y-0.5' : ''
                      }`}
                      onClick={() => onCategoryChange(category)}
                    >
                      {/* Drag handle - only show for non-protected categories */}
                      {!protectedCategories.has(category) && (
                        <div
                          {...provided.dragHandleProps}
                          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                        >
                          <MdDragHandle className="w-4 h-4" />
                        </div>
                      )}
                      
                      {/* Category name with special icons */}
                      <span className="text-sm font-medium whitespace-nowrap flex items-center gap-2">
                        {category}
                        {category === 'Favourite' && (
                          <div className="flex items-center gap-1">
                            <MdFavorite className="w-4 h-4 text-yellow-400" />
                            {favoriteCount > 0 && (
                              <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">
                                {favoriteCount}
                              </span>
                            )}
                          </div>
                        )}
                      </span>
                      
                      {/* Delete button - only for non-protected categories */}
                      {!protectedCategories.has(category) && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDeleteCategory(category); 
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-500 hover:text-red-700 transition-all duration-200"
                          title="Delete category"
                        >
                          <MdClose className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CategoryTabs;
