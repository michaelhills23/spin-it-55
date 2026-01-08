export interface Segment {
  id: string;
  label: string;
  color: string;
  weight: number;
  url?: string;
}

export interface Wheel {
  id: string;
  title: string;
  segments: Segment[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  userId: string;
}

export interface SpinResult {
  id: string;
  wheelId: string;
  segmentId: string;
  segmentLabel: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AnalyticsData {
  totalSpins: number;
  distribution: { name: string; value: number; fill: string }[];
  timeline: { date: string; count: number }[];
}