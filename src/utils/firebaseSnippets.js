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
// ✅ UPDATED (2025-10-17 01:50 IST)
export const getAllSnippets = async (userId) => {
  if (!userId) {
    console.warn('No userId provided to getAllSnippets');
    return [];
  }

  try {    
    const snippetsRef = collection(db, 'snippets');
    const q = query(snippetsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const snippets = [];
    querySnapshot.forEach((doc) => {
      snippets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('Fetched snippets:', snippets.length);
    return snippets;
  } catch (error) {
    console.error('Error in getAllSnippets:', error);
    // 🆕 UPDATED: Throw the error instead of returning empty array
    // This allows calling code to retry on network failures
    throw error;
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
    // Sanitize the snippet data
    // 🆕 UPDATED (2025-10-16 13:07 IST)
    const cleanData = sanitizeFirestoreData(snippetData);

    const docData = {
      ...cleanData,
      code: snippetData.code,         // ensure code field included
      snippets: snippetData.snippets, // ensure multi-snippets included
      userId,
      createdAt: cleanData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

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
    // Sanitize the data first
    const cleanData = sanitizeFirestoreData(snippetData);

    // Prepare update data - ensure no undefined values
    const updateData = {
      ...cleanData,
      updatedAt: new Date().toISOString()
    };


    // Create document reference with explicit string parameters
    const snippetRef = doc(db, COLLECTION_NAME, String(id));

    // Update the document
    await updateDoc(snippetRef, updateData);

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

    // Create document reference with explicit string parameters
    const snippetRef = doc(db, COLLECTION_NAME, String(id));

    // Delete the document
    await deleteDoc(snippetRef);

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
