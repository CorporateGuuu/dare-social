import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('User signed in:', firebaseUser.uid)
        const uid = firebaseUser.uid;
        // Update daily streak on login
        // Temporarily commented out to prevent crash
        // try {
        //   await updateDailyStreak();
        // } catch (error) {
        //   console.error('Error updating streak:', error);
        // }

        // Listen to user document
        const userDocRef = doc(db, 'users', uid);
        const unsubscribeUser = onSnapshot(
          userDocRef,  
          async (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setUser({
                id: uid,
                email: userData.email,
                emailVerified: userData.emailVerified,
                username: userData.displayName || `@user_${uid.slice(0, 6)}`,
                avatar: userData.photoURL || null,
                stones: userData.stoneBalance || 0,
                xp: userData.xp || 0,
                level: userData.level || 1,
                badges: userData.badges || [],
                currentStreak: userData.currentStreak || 0,
                totalDaresCompleted: userData.totalDaresCompleted || 0,
                ...userData
              });


            } else {
              console.warn('User document not found for user:', uid);
              await signOut(auth);
              setUser(null);
              setLoading(false);
            }
            setLoading(false);
        }, (error) => {
          console.error('Error fetching user document:', error);
          setUser(null);
          setLoading(false);
        });

        return unsubscribeUser;
      } else {
        // logged out
        setUser(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribeAuth();  }, []);
  
  // signInAnonymously(auth).catch((error) => {
  //   console.error('Anonymous sign in failed:', error);
  //   setUser(null);
  //   setLoading(false);
  // });
  // --- Auth Functions ---
  const loginWithEmail = async (email, password) => {
    try{
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    }
    catch(error){
      console.error('Login failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const registerWithEmail = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const profile = {
      id: uid,
      username: `@user_${uid.slice(0, 6)}`,
      avatar: "", // avatar uploaded and stored as string for now
      email: email,
      stones: 0,
      xp: 0,
      level: 1,
      badges: [],
      currentStreak: 0,
      totalDaresCompleted: 0,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      emailVerified: true, // TODO: change to false after implementing email verification
    }
    await setDoc(doc(db, "users", uid), profile);

    // TODO: implement email verification
    // await sendEmailVerification(userCredential.user);
    // alert("Verification email sent. Please verify before logging in.");
    // await signOut(auth);

    setLoading(false);
  };

  // TODO: implement google login 
  // const loginWithGoogle = async () => {
  //   try {
  //     const result  = await promptAsync();
  //     if (result?.type === 'success') {
  //       const { idToken } = result?.params;
  //       const credential = GoogleAuthProvider.credential(idToken);
  //       await signInWithCredential(auth, credential);
  //     }
  //     setLoading(false); 
  //   } catch (error) {
  //     console.error('Google Login Failed:', error);
  //     setLoading(false);
  //   }
  // };


  const logout = () => {
    signOut(auth);
  };

  const setTyping = (challengeId, isTyping) => {
    console.log(`User ${user?.id} ${isTyping ? 'started' : 'stopped'} typing in ${challengeId}`);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, setTyping, logout, loading, loginWithEmail, registerWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
