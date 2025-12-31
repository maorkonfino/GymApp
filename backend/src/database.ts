import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '../gym.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reminder_24h_sent INTEGER DEFAULT 0,
    reminder_4h_sent INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS workout_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    plan_content TEXT NOT NULL,
    created_by TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS nutrition_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL UNIQUE,
    regular_day_protein REAL DEFAULT 0,
    regular_day_fat REAL DEFAULT 0,
    regular_day_carbs REAL DEFAULT 0,
    loading_day_protein REAL DEFAULT 0,
    loading_day_fat REAL DEFAULT 0,
    loading_day_carbs REAL DEFAULT 0,
    updated_by TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    date TEXT NOT NULL,
    morning_weight REAL,
    total_calories REAL,
    protein REAL,
    fat REAL,
    carbs REAL,
    steps INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_email, date)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'kibbutz',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workout_folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS archived_workout_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    name TEXT NOT NULL,
    plan_content TEXT NOT NULL,
    folder_id INTEGER,
    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES workout_folders(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS time_restrictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    message TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS role_time_restrictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, day_of_week)
  );

  CREATE TABLE IF NOT EXISTS reminder_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enabled INTEGER DEFAULT 1,
    message_24h TEXT DEFAULT 'תזכורת: יש לך אימון מחר ב-{time}',
    message_4h TEXT DEFAULT 'תזכורת: יש לך אימון בעוד 4 שעות',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add password column to existing users table if it doesn't exist
try {
  db.exec('ALTER TABLE users ADD COLUMN password TEXT');
} catch (e) {
  // Column already exists, ignore
}

// Add role column to registrations table
try {
  db.exec('ALTER TABLE registrations ADD COLUMN role TEXT');
} catch (e) {
  // Column already exists, ignore
}

export interface Registration {
  id?: number;
  full_name: string;
  phone: string;
  email: string;
  role?: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  reminder_24h_sent?: number;
  reminder_4h_sent?: number;
}

export const createRegistration = (registration: Omit<Registration, 'id' | 'created_at'>) => {
  const stmt = db.prepare(`
    INSERT INTO registrations (full_name, phone, email, role, date, start_time, end_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    registration.full_name,
    registration.phone,
    registration.email,
    registration.role || null,
    registration.date,
    registration.start_time,
    registration.end_time
  );
  
  return result.lastInsertRowid;
};

export const getRegistrationsByDate = (date: string): Registration[] => {
  const stmt = db.prepare(`
    SELECT * FROM registrations 
    WHERE date = ?
    ORDER BY start_time
  `);
  
  return stmt.all(date) as Registration[];
};

export const getRegistrationsByDateRange = (startDate: string, endDate: string): Registration[] => {
  const stmt = db.prepare(`
    SELECT * FROM registrations 
    WHERE date >= ? AND date <= ?
    ORDER BY date, start_time
  `);
  
  return stmt.all(startDate, endDate) as Registration[];
};

export const getRegistrationCountByDateTime = (date: string, time: string): number => {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM registrations 
    WHERE date = ? AND start_time <= ? AND end_time > ?
  `);
  
  const result = stmt.get(date, time, time) as { count: number };
  return result.count;
};

export const getAllRegistrations = (): Registration[] => {
  const stmt = db.prepare(`
    SELECT * FROM registrations 
    ORDER BY date, start_time
  `);
  
  return stmt.all() as Registration[];
};

export const deleteRegistration = (id: number) => {
  const stmt = db.prepare('DELETE FROM registrations WHERE id = ?');
  return stmt.run(id);
};

export const deleteOldRegistrations = (beforeDate: string) => {
  const stmt = db.prepare('DELETE FROM registrations WHERE date < ?');
  return stmt.run(beforeDate);
};

export const updateRegistration = (id: number, date: string, startTime: string, endTime: string) => {
  const stmt = db.prepare(`
    UPDATE registrations 
    SET date = ?, start_time = ?, end_time = ?,
        reminder_24h_sent = 0, reminder_4h_sent = 0
    WHERE id = ?
  `);
  return stmt.run(date, startTime, endTime, id);
};

export const getRegistrationsByUser = (email: string): Registration[] => {
  const stmt = db.prepare(`
    SELECT * FROM registrations 
    WHERE email = ?
    ORDER BY date, start_time
  `);
  
  return stmt.all(email) as Registration[];
};

// Get registrations that need reminders
export const getRegistrationsForReminders = (hoursBeforeMin: number, hoursBeforeMax: number, reminderType: '24h' | '4h'): Registration[] => {
  const reminderField = reminderType === '24h' ? 'reminder_24h_sent' : 'reminder_4h_sent';
  
  const stmt = db.prepare(`
    SELECT * FROM registrations 
    WHERE ${reminderField} = 0
    AND datetime(date || ' ' || start_time) 
    BETWEEN datetime('now', 'localtime', '+' || ? || ' hours') 
    AND datetime('now', 'localtime', '+' || ? || ' hours')
    ORDER BY date, start_time
  `);
  
  return stmt.all(hoursBeforeMin, hoursBeforeMax) as Registration[];
};

// Mark reminder as sent
export const markReminderSent = (id: number, reminderType: '24h' | '4h') => {
  const reminderField = reminderType === '24h' ? 'reminder_24h_sent' : 'reminder_4h_sent';
  const stmt = db.prepare(`UPDATE registrations SET ${reminderField} = 1 WHERE id = ?`);
  return stmt.run(id);
};

// Workout Plans
export interface WorkoutPlan {
  id?: number;
  user_email: string;
  plan_content: string;
  created_by: string;
  updated_at?: string;
}

export const getWorkoutPlan = (userEmail: string): WorkoutPlan | undefined => {
  const stmt = db.prepare('SELECT * FROM workout_plans WHERE user_email = ?');
  return stmt.get(userEmail) as WorkoutPlan | undefined;
};

export const saveWorkoutPlan = (plan: Omit<WorkoutPlan, 'id' | 'updated_at'>) => {
  const existing = getWorkoutPlan(plan.user_email);
  
  if (existing) {
    const stmt = db.prepare(`
      UPDATE workout_plans 
      SET plan_content = ?, created_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_email = ?
    `);
    return stmt.run(plan.plan_content, plan.created_by, plan.user_email);
  } else {
    const stmt = db.prepare(`
      INSERT INTO workout_plans (user_email, plan_content, created_by)
      VALUES (?, ?, ?)
    `);
    return stmt.run(plan.user_email, plan.plan_content, plan.created_by);
  }
};

// Nutrition Goals
export interface NutritionGoals {
  id?: number;
  user_email: string;
  regular_day_protein: number;
  regular_day_fat: number;
  regular_day_carbs: number;
  loading_day_protein: number;
  loading_day_fat: number;
  loading_day_carbs: number;
  updated_by: string;
  updated_at?: string;
}

export const getNutritionGoals = (userEmail: string): NutritionGoals | undefined => {
  const stmt = db.prepare('SELECT * FROM nutrition_goals WHERE user_email = ?');
  return stmt.get(userEmail) as NutritionGoals | undefined;
};

export const saveNutritionGoals = (goals: Omit<NutritionGoals, 'id' | 'updated_at'>) => {
  const existing = getNutritionGoals(goals.user_email);
  
  if (existing) {
    const stmt = db.prepare(`
      UPDATE nutrition_goals 
      SET regular_day_protein = ?, regular_day_fat = ?, regular_day_carbs = ?,
          loading_day_protein = ?, loading_day_fat = ?, loading_day_carbs = ?,
          updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_email = ?
    `);
    return stmt.run(
      goals.regular_day_protein, goals.regular_day_fat, goals.regular_day_carbs,
      goals.loading_day_protein, goals.loading_day_fat, goals.loading_day_carbs,
      goals.updated_by, goals.user_email
    );
  } else {
    const stmt = db.prepare(`
      INSERT INTO nutrition_goals (user_email, regular_day_protein, regular_day_fat, regular_day_carbs,
                                   loading_day_protein, loading_day_fat, loading_day_carbs, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      goals.user_email, goals.regular_day_protein, goals.regular_day_fat, goals.regular_day_carbs,
      goals.loading_day_protein, goals.loading_day_fat, goals.loading_day_carbs, goals.updated_by
    );
  }
};

// Daily Tracking
export interface DailyTracking {
  id?: number;
  user_email: string;
  date: string;
  morning_weight?: number;
  total_calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  steps?: number;
  notes?: string;
  created_at?: string;
}

export const getDailyTracking = (userEmail: string, startDate: string, endDate: string): DailyTracking[] => {
  const stmt = db.prepare(`
    SELECT * FROM daily_tracking 
    WHERE user_email = ? AND date >= ? AND date <= ?
    ORDER BY date DESC
  `);
  return stmt.all(userEmail, startDate, endDate) as DailyTracking[];
};

export const getAllDailyTracking = (userEmail: string): DailyTracking[] => {
  const stmt = db.prepare('SELECT * FROM daily_tracking WHERE user_email = ? ORDER BY date DESC');
  return stmt.all(userEmail) as DailyTracking[];
};

export const getDailyTrackingByDate = (userEmail: string, date: string): DailyTracking | undefined => {
  const stmt = db.prepare('SELECT * FROM daily_tracking WHERE user_email = ? AND date = ?');
  return stmt.get(userEmail, date) as DailyTracking | undefined;
};

export const saveDailyTracking = (tracking: Omit<DailyTracking, 'id' | 'created_at'>) => {
  const existing = getDailyTrackingByDate(tracking.user_email, tracking.date);
  
  if (existing) {
    const stmt = db.prepare(`
      UPDATE daily_tracking 
      SET morning_weight = ?, total_calories = ?, protein = ?, fat = ?, carbs = ?, steps = ?, notes = ?
      WHERE user_email = ? AND date = ?
    `);
    return stmt.run(
      tracking.morning_weight, tracking.total_calories, tracking.protein, 
      tracking.fat, tracking.carbs, tracking.steps, tracking.notes,
      tracking.user_email, tracking.date
    );
  } else {
    const stmt = db.prepare(`
      INSERT INTO daily_tracking (user_email, date, morning_weight, total_calories, protein, fat, carbs, steps, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      tracking.user_email, tracking.date, tracking.morning_weight, tracking.total_calories,
      tracking.protein, tracking.fat, tracking.carbs, tracking.steps, tracking.notes
    );
  }
};

export const deleteDailyTracking = (userEmail: string, date: string) => {
  const stmt = db.prepare('DELETE FROM daily_tracking WHERE user_email = ? AND date = ?');
  return stmt.run(userEmail, date);
};

// ===== USER MANAGEMENT =====

export interface User {
  id?: number;
  email: string;
  name: string;
  phone: string;
  password?: string; // Optional - we don't want to expose it in responses
  role: 'admin' | 'vip' | 'kibbutz';
  created_at?: string;
}

export const createUser = (user: Omit<User, 'id' | 'created_at'>) => {
  const stmt = db.prepare(`
    INSERT INTO users (email, name, phone, password, role)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(user.email, user.name, user.phone, user.password || '', user.role);
  return result.lastInsertRowid;
};

export const getUserByEmail = (email: string): User | undefined => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
};

export const getUserById = (id: number | bigint): User | undefined => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
};

export const getAllUsers = (): User[] => {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all() as User[];
};

export const updateUser = (id: number, updates: Partial<Omit<User, 'id' | 'created_at'>>) => {
  const fields = [];
  const values = [];
  
  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.email) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.phone) {
    fields.push('phone = ?');
    values.push(updates.phone);
  }
  if (updates.role) {
    fields.push('role = ?');
    values.push(updates.role);
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
  return stmt.run(...values);
};

export const deleteUser = (id: number) => {
  // Get user email first
  const user = getUserById(id);
  if (!user) return;

  // Delete all related data in a transaction
  db.transaction(() => {
    // Delete registrations
    db.prepare('DELETE FROM registrations WHERE email = ?').run(user.email);
    
    // Delete workout plans
    db.prepare('DELETE FROM workout_plans WHERE user_email = ?').run(user.email);
    
    // Delete nutrition goals
    db.prepare('DELETE FROM nutrition_goals WHERE user_email = ?').run(user.email);
    
    // Delete daily tracking
    db.prepare('DELETE FROM daily_tracking WHERE user_email = ?').run(user.email);
    
    // Delete workout folders
    db.prepare('DELETE FROM workout_folders WHERE user_email = ?').run(user.email);
    
    // Delete archived workout plans
    db.prepare('DELETE FROM archived_workout_plans WHERE user_email = ?').run(user.email);
    
    // Finally, delete the user
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  })();
};

// Workout Archive & Folders
export interface WorkoutFolder {
  id?: number;
  user_email: string;
  name: string;
  created_at?: string;
}

export interface ArchivedWorkoutPlan {
  id?: number;
  user_email: string;
  name: string;
  plan_content: string;
  folder_id?: number;
  archived_at?: string;
}

export const createWorkoutFolder = (folder: Omit<WorkoutFolder, 'id' | 'created_at'>) => {
  const stmt = db.prepare(`
    INSERT INTO workout_folders (user_email, name)
    VALUES (?, ?)
  `);
  const result = stmt.run(folder.user_email, folder.name);
  return result.lastInsertRowid;
};

export const getWorkoutFolders = (userEmail: string): WorkoutFolder[] => {
  const stmt = db.prepare('SELECT * FROM workout_folders WHERE user_email = ? ORDER BY created_at DESC');
  return stmt.all(userEmail) as WorkoutFolder[];
};

export const archiveWorkoutPlan = (plan: Omit<ArchivedWorkoutPlan, 'id' | 'archived_at'>) => {
  const stmt = db.prepare(`
    INSERT INTO archived_workout_plans (user_email, name, plan_content, folder_id)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(plan.user_email, plan.name, plan.plan_content, plan.folder_id || null);
  return result.lastInsertRowid;
};

export const getArchivedWorkoutPlans = (userEmail: string): ArchivedWorkoutPlan[] => {
  const stmt = db.prepare('SELECT * FROM archived_workout_plans WHERE user_email = ? ORDER BY archived_at DESC');
  return stmt.all(userEmail) as ArchivedWorkoutPlan[];
};

export const getArchivedWorkoutPlansByFolder = (userEmail: string, folderId: number): ArchivedWorkoutPlan[] => {
  const stmt = db.prepare('SELECT * FROM archived_workout_plans WHERE user_email = ? AND folder_id = ? ORDER BY archived_at DESC');
  return stmt.all(userEmail, folderId) as ArchivedWorkoutPlan[];
};

export const getUnorganizedArchivedPlans = (userEmail: string): ArchivedWorkoutPlan[] => {
  const stmt = db.prepare('SELECT * FROM archived_workout_plans WHERE user_email = ? AND folder_id IS NULL ORDER BY archived_at DESC');
  return stmt.all(userEmail) as ArchivedWorkoutPlan[];
};

export const unarchiveWorkoutPlan = (id: number) => {
  const stmt = db.prepare('DELETE FROM archived_workout_plans WHERE id = ?');
  return stmt.run(id);
};

export const movePlanToFolder = (planId: number, folderId: number | null) => {
  const stmt = db.prepare('UPDATE archived_workout_plans SET folder_id = ? WHERE id = ?');
  return stmt.run(folderId, planId);
};

export const deleteWorkoutFolder = (id: number) => {
  // This will set folder_id to NULL for all plans in this folder (due to ON DELETE SET NULL)
  const stmt = db.prepare('DELETE FROM workout_folders WHERE id = ?');
  return stmt.run(id);
};

// ===== REMINDER SETTINGS =====

export interface ReminderSettings {
  id?: number;
  enabled: number;
  message_24h: string;
  message_4h: string;
  updated_at?: string;
}

export const getReminderSettings = (): ReminderSettings => {
  const stmt = db.prepare('SELECT * FROM reminder_settings LIMIT 1');
  let settings = stmt.get() as ReminderSettings | undefined;
  
  // If no settings exist, create default ones
  if (!settings) {
    const insertStmt = db.prepare(`
      INSERT INTO reminder_settings (enabled, message_24h, message_4h)
      VALUES (1, 'תזכורת: יש לך אימון מחר ב-{time}', 'תזכורת: יש לך אימון בעוד 4 שעות')
    `);
    insertStmt.run();
    settings = stmt.get() as ReminderSettings;
  }
  
  return settings!;
};

export const updateReminderSettings = (settings: Partial<Omit<ReminderSettings, 'id' | 'updated_at'>>) => {
  const fields = [];
  const values = [];
  
  if (settings.enabled !== undefined) {
    fields.push('enabled = ?');
    values.push(settings.enabled);
  }
  if (settings.message_24h) {
    fields.push('message_24h = ?');
    values.push(settings.message_24h);
  }
  if (settings.message_4h) {
    fields.push('message_4h = ?');
    values.push(settings.message_4h);
  }
  
  if (fields.length === 0) return;
  
  const query = `UPDATE reminder_settings SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM reminder_settings LIMIT 1)`;
  const stmt = db.prepare(query);
  return stmt.run(...values);
};

export default db;


