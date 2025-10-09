import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query,
  where
} from 'firebase/firestore';

const COLLECTION_NAME = 'snippets';

// Function to sanitize data for Firestore - only allows primitive types and arrays
const sanitizeFirestoreData = (data) => {
  if (data === null || data === undefined) {
    return null;
  }

  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined && item !== null)
      .map(item => sanitizeFirestoreData(item));
  }

  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip undefined values, functions, and the id field
      if (value !== undefined && typeof value !== 'function' && key !== 'id') {
        sanitized[key] = sanitizeFirestoreData(value);
      }
    }
    return sanitized;
  }

  // Skip functions, undefined, symbols, etc.
  return null;
};

// Get all snippets for a specific user
export const getAllSnippets = async (userId) => {
  if (!userId || typeof userId !== 'string') {
    console.error('Valid user ID string is required for getAllSnippets');
    return [];
  }

  try {
    console.log('Fetching snippets for user:', userId);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const snippets = [];
    
    querySnapshot.forEach((docSnapshot) => {
      snippets.push({
        id: docSnapshot.id,
        ...docSnapshot.data()
      });
    });
    
    console.log('Fetched snippets:', snippets.length);
    
    // Sort client-side by creation date
    return snippets.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
  } catch (error) {
    console.error('Error in getAllSnippets:', error);
    return [];
  }
};

// Add new snippet
export const addSnippet = async (snippetData, userId) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid user ID string is required');
  }

  if (!snippetData || typeof snippetData !== 'object') {
    throw new Error('Valid snippet data object is required');
  }

  try {
    console.log('Adding snippet for user:', userId);
    
    // Sanitize the snippet data
    const cleanData = sanitizeFirestoreData(snippetData);
    
    const docData = {
      ...cleanData,
      userId: userId,
      createdAt: cleanData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Sanitized document data:', docData);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    console.log('Snippet added with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding snippet:', error);
    throw new Error(`Failed to add snippet: ${error.message}`);
  }
};

// Update existing snippet
export const updateSnippet = async (id, snippetData, userId) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid user ID string is required');
  }
  
  if (!id || typeof id !== 'string') {
    throw new Error('Valid snippet ID string is required');
  }
  
  if (!snippetData || typeof snippetData !== 'object') {
    throw new Error('Valid snippet data object is required');
  }

  try {
    console.log('Updating snippet:', id, 'for user:', userId);
    
    // Sanitize the data first
    const cleanData = sanitizeFirestoreData(snippetData);
    
    // Prepare update data - ensure no undefined values
    const updateData = {
      ...cleanData,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Sanitized update data:', updateData);
    
    // Create document reference with explicit string parameters
    const snippetRef = doc(db, COLLECTION_NAME, String(id));
    
    // Update the document
    await updateDoc(snippetRef, updateData);
    
    console.log('Snippet updated successfully');
  } catch (error) {
    console.error('Error updating snippet:', error);
    throw new Error(`Failed to update snippet: ${error.message}`);
  }
};

// Delete snippet
export const deleteSnippet = async (id, userId) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid user ID string is required');
  }
  
  if (!id || typeof id !== 'string') {
    throw new Error('Valid snippet ID string is required');
  }

  try {
    console.log('Deleting snippet:', id, 'for user:', userId);
    
    // Create document reference with explicit string parameters
    const snippetRef = doc(db, COLLECTION_NAME, String(id));
    
    // Delete the document
    await deleteDoc(snippetRef);
    
    console.log('Snippet deleted successfully');
  } catch (error) {
    console.error('Error deleting snippet:', error);
    throw new Error(`Failed to delete snippet: ${error.message}`);
  }
};

// Batch operations for import/export
export const batchAddSnippets = async (snippets, userId) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid user ID string is required');
  }
  
  if (!Array.isArray(snippets)) {
    throw new Error('Snippets must be an array');
  }

  const results = [];
  
  for (const snippet of snippets) {
    try {
      const id = await addSnippet(snippet, userId);
      results.push(id);
      // Small delay to avoid overwhelming Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to add snippet: ${snippet?.title || 'Unknown'}`, error);
      throw error;
    }
  }
  
  return results;
};
