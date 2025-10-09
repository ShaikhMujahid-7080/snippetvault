import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db 
} from '../utils/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin email
  const ADMIN_EMAIL = 'shaikhmujahid7080@gmail.com';

  // Sign up function
  const signup = async (email, password, displayName) => {
    try {
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      if (!password) {
        throw new Error('Password is required');
      }
      if (!displayName || !displayName.trim()) {
        throw new Error('Display name is required');
      }

      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      await updateProfile(user, { displayName: displayName.trim() });
      
      const userRole = email.trim() === ADMIN_EMAIL ? 'admin' : 'user';
      
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName.trim(),
          role: userRole,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          isActive: true,
          snippetCount: 0
        });
      } catch (firestoreError) {
        console.warn('Failed to create user profile in Firestore:', firestoreError);
      }

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in function
  const signin = async (email, password) => {
    try {
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      if (!password) {
        throw new Error('Password is required');
      }

      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Update last login time (non-blocking)
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Failed to update login time:', firestoreError);
      }

      return user;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = (email) => {
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    return sendPasswordResetEmail(auth, email.trim());
  };

  // Get user profile from Firestore
  const getUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.warn('Error getting user profile:', error);
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (uid, updates) => {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Admin functions
  const getAllUsers = async () => {
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');
    
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  };

  const suspendUser = async (uid) => {
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');
    
    try {
      await updateDoc(doc(db, 'users', uid), {
        isActive: false,
        suspendedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  };

  const activateUser = async (uid) => {
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');
    
    try {
      await updateDoc(doc(db, 'users', uid), {
        isActive: true,
        suspendedAt: null
      });
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  };

  const getUserStats = async () => {
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');
    
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      let activeUsers = 0;
      let suspendedUsers = 0;
      let adminUsers = 0;
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.isActive) activeUsers++;
        else suspendedUsers++;
        if (userData.role === 'admin') adminUsers++;
      });

      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          
          // Get user profile from Firestore
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Check if user is admin
          setIsAdmin(profile?.role === 'admin');
          
          // Check if user is suspended
          if (profile && !profile.isActive) {
            await signOut(auth);
            throw new Error('Account suspended. Please contact administrator.');
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setCurrentUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    signup,
    signin,
    logout,
    resetPassword,
    updateUserProfile,
    // Admin functions
    getAllUsers,
    suspendUser,
    activateUser,
    getUserStats
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
