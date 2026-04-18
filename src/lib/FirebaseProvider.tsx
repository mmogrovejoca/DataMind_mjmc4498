import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface FirebaseContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const userDoc = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userDoc);
        if (snapshot.exists()) {
          setUserProfile(snapshot.data());
        } else {
          const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'analyst', // Default role
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          // Try to create profile (will respect rules)
          try {
            await setDoc(userDoc, newProfile);
            setUserProfile(newProfile);
          } catch (e) {
            console.error("Error creating profile:", e);
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
};
