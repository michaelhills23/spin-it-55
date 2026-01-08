import { Wheel, SpinResult, User, AnalyticsData } from '../types';

const KEYS = {
  USER: 'stw_user',
  WHEELS: 'stw_wheels',
  RESULTS: 'stw_results',
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const StorageService = {
  getUser: (): User | null => {
    const u = localStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  },

  login: async (email: string): Promise<User> => {
    await delay(500);
    const user = { id: 'u_' + Date.now(), email, name: email.split('@')[0] };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return user;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(KEYS.USER);
  },

  // Get ALL wheels from storage (internal helper)
  _getAllWheels: (): Wheel[] => {
    const w = localStorage.getItem(KEYS.WHEELS);
    return w ? JSON.parse(w) : [];
  },

  // Get wheels belonging to the current user
  getWheels: async (): Promise<Wheel[]> => {
    await delay(300);
    const user = StorageService.getUser();
    if (!user) return [];
    
    const allWheels = StorageService._getAllWheels();
    return allWheels.filter(w => w.userId === user.id);
  },

  // Get a single wheel (checks for ownership or public visibility)
  getWheel: async (id: string): Promise<Wheel | undefined> => {
    const allWheels = StorageService._getAllWheels();
    const wheel = allWheels.find((w) => w.id === id);
    const user = StorageService.getUser();

    if (!wheel) return undefined;

    // Allow if public OR if user owns it
    if (wheel.isPublic) return wheel;
    if (user && wheel.userId === user.id) return wheel;
    
    return undefined; // Access denied
  },

  saveWheel: async (wheel: Wheel): Promise<void> => {
    await delay(300);
    const user = StorageService.getUser();
    if (!user) throw new Error("Must be logged in to save");

    // Ensure userId is set
    wheel.userId = user.id;

    const wheels = StorageService._getAllWheels();
    const existingIndex = wheels.findIndex((w) => w.id === wheel.id);
    
    if (existingIndex >= 0) {
      // Ensure we are updating our own wheel
      if (wheels[existingIndex].userId !== user.id) {
          throw new Error("Cannot update a wheel you don't own");
      }
      wheels[existingIndex] = wheel;
    } else {
      wheels.push(wheel);
    }
    localStorage.setItem(KEYS.WHEELS, JSON.stringify(wheels));
  },

  deleteWheel: async (id: string): Promise<void> => {
    const user = StorageService.getUser();
    if (!user) return;

    const wheels = StorageService._getAllWheels();
    // Only delete if owner
    const filtered = wheels.filter((w) => w.id !== id || w.userId !== user.id);
    localStorage.setItem(KEYS.WHEELS, JSON.stringify(filtered));
  },

  recordSpin: async (result: SpinResult): Promise<void> => {
    const r = localStorage.getItem(KEYS.RESULTS);
    const results: SpinResult[] = r ? JSON.parse(r) : [];
    results.push(result);
    localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
  },

  getAnalytics: async (wheelId: string): Promise<AnalyticsData> => {
    await delay(300);
    
    // Check ownership first
    const wheel = await StorageService.getWheel(wheelId);
    const user = StorageService.getUser();
    
    if (!wheel || !user || wheel.userId !== user.id) {
        throw new Error("Access denied");
    }

    const r = localStorage.getItem(KEYS.RESULTS);
    const allResults: SpinResult[] = r ? JSON.parse(r) : [];
    const wheelResults = allResults.filter((res) => res.wheelId === wheelId);
    
    // Distribution
    const distMap = new Map<string, number>();
    
    wheelResults.forEach(res => {
        distMap.set(res.segmentLabel, (distMap.get(res.segmentLabel) || 0) + 1);
    });

    const distribution = Array.from(distMap.entries()).map(([name, value]) => {
        const seg = wheel?.segments.find(s => s.label === name);
        return { name, value, fill: seg?.color || '#8884d8' };
    });

    // Timeline (last 7 days simulated)
    const timeMap = new Map<string, number>();
    wheelResults.forEach(res => {
        const date = new Date(res.timestamp).toLocaleDateString();
        timeMap.set(date, (timeMap.get(date) || 0) + 1);
    });
    
    const timeline = Array.from(timeMap.entries()).map(([date, count]) => ({ date, count }));

    return {
        totalSpins: wheelResults.length,
        distribution,
        timeline
    };
  }
};