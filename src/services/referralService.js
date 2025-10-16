import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';

const functions = getFunctions();

export const generateReferralCode = async () => {
  try {
    const generateReferralFunction = httpsCallable(functions, 'generateReferralCode');
    const result = await generateReferralFunction({});
    return result.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const redeemReferralCode = async (code) => {
  try {
    const redeemReferralFunction = httpsCallable(functions, 'redeemReferralCode');
    const result = await redeemReferralFunction({ code });
    return result.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUserReferralData = async () => {
  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', auth.currentUser?.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().referrals || {};
    }
    return {};
  } catch (error) {
    throw new Error('Failed to fetch referral data');
  }
};

export const checkReferralCodeValidity = async (code) => {
  try {
    const db = getFirestore();
    const codeRef = doc(db, 'referral_codes', code);
    const codeDoc = await getDoc(codeRef);
    if (!codeDoc.exists) {
      return { valid: false, reason: 'Code not found' };
    }

    const data = codeDoc.data();
    if (data.status !== 'active') {
      return { valid: false, reason: 'Code is inactive' };
    }

    if (data.usageCount >= data.maxUses) {
      return { valid: false, reason: 'Code has reached maximum uses' };
    }

    if (data.ownerId === auth.currentUser?.uid) {
      return { valid: false, reason: 'Cannot use your own referral code' };
    }

    return { valid: true, ownerId: data.ownerId };
  } catch (error) {
    throw new Error('Failed to check code validity');
  }
};
