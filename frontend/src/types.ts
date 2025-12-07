export interface Registration {
  id?: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
}

export interface TimeSlot {
  time: string;
  count: number;
  registrations: Registration[];
}

export interface DayData {
  date: Date;
  dayName: string;
  dayNumber: number;
  month: number;
  registrations: Registration[];
}

export type UserType = 'admin' | 'vip' | 'kibbutz' | 'teenbeast';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserType;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, lastName: string, phone: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string, phone: string) => Promise<void>;
  isAdmin: boolean;
}

