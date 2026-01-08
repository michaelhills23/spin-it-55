import { Wheel, SpinResult, User, AnalyticsData } from '../types';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';

export const StorageService = {
  getUser: (): User | null => {
    const u = auth.currentUser;
    if (!u) return null;
    return {
      id: u.uid,
      email: u.email || '',
      name: u.displayName || u.email?.split('@')[0] || 'User'
    };
  },

  login: async (email: string, password: string, isSignUp: boolean): Promise<User> => {
    let userCredential;
    
    if (isSignUp) {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Set a default display name based on email
      if (userCredential.user) {
         await updateProfile(userCredential.user, {
             displayName: email.split('@')[0]
         });
      }
    } else {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }

    const u = userCredential.user;
    return {
      id: u.uid,
      email: u.email || '',
      name: u.displayName || u.email?.split('@')[0] || 'User'
    };
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  getWheels: async (): Promise<Wheel[]> => {
    const user = StorageService.getUser();
    if (!user) return [];

    const q = query(collection(db, 'wheels'), where('userId', '==', user.id));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as Wheel);
  },

  getWheel: async (id: string): Promise<Wheel | undefined> => {
    try {
      const docRef = doc(db, 'wheels', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Firestore rules will handle the permission check.
        // If we can read it, it's either ours or public.
        return docSnap.data() as Wheel;
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching wheel:", error);
      return undefined;
    }
  },

  saveWheel: async (wheel: Wheel): Promise<void> => {
    const user = StorageService.getUser();
    if (!user) throw new Error("Must be logged in to save");

    // Ensure userId is strictly set to current user
    wheel.userId = user.id;
    wheel.updatedAt = new Date().toISOString(); // Update timestamp

    // Using setDoc with merge:true is safer, but strictly we replace the wheel config here
    await setDoc(doc(db, 'wheels', wheel.id), wheel);
  },

  deleteWheel: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'wheels', id));
  },

  recordSpin: async (result: SpinResult): Promise<void> => {
    // We store spins in a subcollection 'spins' under the specific wheel
    const spinsRef = collection(db, 'wheels', result.wheelId, 'spins');
    await addDoc(spinsRef, result);
  },

  getAnalytics: async (wheelId: string): Promise<AnalyticsData> => {
    const spinsRef = collection(db, 'wheels', wheelId, 'spins');
    // Note: In a production app with thousands of spins, you would want to use 
    // Firestore aggregation queries (count()) instead of fetching all documents.
    // For this demo, fetching all docs is acceptable.
    const snapshot = await getDocs(spinsRef);
    const results = snapshot.docs.map(d => d.data() as SpinResult);

    // Check if we found anything. If wheel exists but no spins, it returns empty array which is fine.
    
    // Calculate Distribution
    const distMap = new Map<string, number>();
    results.forEach(res => {
        distMap.set(res.segmentLabel, (distMap.get(res.segmentLabel) || 0) + 1);
    });

    // We need the wheel colors to make the chart pretty. 
    // We can fetch the wheel definition to match colors.
    const wheel = await StorageService.getWheel(wheelId);

    const distribution = Array.from(distMap.entries()).map(([name, value]) => {
        const seg = wheel?.segments.find(s => s.label === name);
        return { name, value, fill: seg?.color || '#8884d8' };
    });

    // Calculate Timeline
    const timeMap = new Map<string, number>();
    results.forEach(res => {
        const date = new Date(res.timestamp).toLocaleDateString();
        timeMap.set(date, (timeMap.get(date) || 0) + 1);
    });
    
    // Sort timeline by date
    const timeline = Array.from(timeMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
        totalSpins: results.length,
        distribution,
        timeline
    };
  }
};