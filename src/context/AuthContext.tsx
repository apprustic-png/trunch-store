'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { UserProfile, Order } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  activeOrdersCount: number;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  activeOrdersCount: 0,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user profile doc in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || '',
            phone: '',
            addresses: [],
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
        }

        // Listen for active processing orders count (status != 'done')
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );

        const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
          const activeCount = snapshot.docs.filter((d) => {
            const data = d.data() as Order;
            return data.status !== 'done';
          }).length;
          setActiveOrdersCount(activeCount);
        });

        setLoading(false);
        return () => unsubOrders();
      } else {
        setProfile(null);
        setActiveOrdersCount(0);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In failed', error);
      alert('Gagal login dengan Google. Silakan coba lagi.');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign-Out failed', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data() as UserProfile);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeOrdersCount,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
