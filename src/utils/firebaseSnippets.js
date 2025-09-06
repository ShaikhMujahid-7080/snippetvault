import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const SNIPPET_COLLECTION = "snippets";

// Helper: ensure ID is a string
const ensureStringId = (id) => {
  return String(id);
};

// Helper: clean snippet data for Firestore (remove id and ensure plain object)
const cleanSnippetData = (snippet) => {
  const { id, ...rest } = snippet;
  return JSON.parse(JSON.stringify(rest));
};

export const getAllSnippets = async () => {
  try {
    const snap = await getDocs(collection(db, SNIPPET_COLLECTION));
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error("Error fetching snippets:", error);
    throw error;
  }
};

export const addSnippet = async (snippet) => {
  try {
    const cleanData = cleanSnippetData(snippet);
    const docRef = await addDoc(collection(db, SNIPPET_COLLECTION), cleanData);
    return docRef;
  } catch (error) {
    console.error("Error adding snippet:", error);
    throw error;
  }
};

export const updateSnippet = async (id, snippet) => {
  try {
    // Ensure ID is a string
    const stringId = ensureStringId(id);
    const cleanData = cleanSnippetData(snippet);

    console.log("Updating snippet with ID:", stringId, "Data:", cleanData);

    await updateDoc(doc(db, SNIPPET_COLLECTION, stringId), cleanData);
  } catch (error) {
    console.error("Error updating snippet:", error);
    throw error;
  }
};

export const deleteSnippet = async (id) => {
  try {
    const stringId = ensureStringId(id);
    await deleteDoc(doc(db, SNIPPET_COLLECTION, stringId));
  } catch (error) {
    console.error("Error deleting snippet:", error);
    throw error;
  }
};
