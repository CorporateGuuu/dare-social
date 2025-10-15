import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Track user login after successful sign in
    try {
      const { trackUserLogin } = await import('../services/loginService');
      await trackUserLogin(userCredential.user.uid);
    } catch (trackingError) {
      console.error('Error tracking login:', trackingError);
      // Don't fail sign in if tracking fails
    }
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signUp = async (email, password, referralCode) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Create user document in Firestore
    const userData = {
      displayName: `@user_${user.uid.slice(0, 6)}`,
      stonesBalance: 100, // Starting stones
      xp: 0,
      level: 1,
      badges: [],
      currentStreak: 0,
      totalDaresCompleted: 0,
      email: user.email,
      createdAt: new Date(),
      referralEarnings: 0,
      loginStreak: {
        currentStreak: 0,
        lastLogin: new Date(),
        totalLogins: 1, // Count the signup as first login
        maxStreak: 1
      },
      dailyRewardLastClaimed: null,
      loginEarnings: 0,
      postStats: {
        totalPosts: 0,
        rewardedPosts: 0,
        totalPostEarnings: 0,
        dailyPostCount: 0,
        lastPostReset: new Date(),
      }
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    // Handle referral code if provided
    if (referralCode) {
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        const processReferral = httpsCallable(functions, 'processReferral');
        await processReferral({
          referralCode,
          eventType: 'signup'
        });
      } catch (referralError) {
        console.error('Error processing referral code:', referralError);
        // Don't fail sign up if referral processing fails
      }
    }

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
