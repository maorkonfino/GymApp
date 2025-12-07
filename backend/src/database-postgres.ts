import { Pool, PoolClient } from 'pg';

// Create PostgreSQL connection pool with SSL configuration for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reminder_24h_sent INTEGER DEFAULT 0,
        reminder_4h_sent INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS workout_plans (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL,
        plan_content TEXT NOT NULL,
        created_by TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nutrition_goals (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL UNIQUE,
        regular_day_protein REAL DEFAULT 0,
        regular_day_fat REAL DEFAULT 0,
        regular_day_carbs REAL DEFAULT 0,
        loading_day_protein REAL DEFAULT 0,
        loading_day_fat REAL DEFAULT 0,
        loading_day_carbs REAL DEFAULT 0,
        updated_by TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_tracking (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL,
        date TEXT NOT NULL,
        morning_weight REAL,
        total_calories REAL,
        protein REAL,
        fat REAL,
        carbs REAL,
        steps INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_email, date)
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'kibbutz',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ===== INTERFACES =====

export interface Registration {
  id?: number;
  full_name: string;
  phone: string;
  email: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  reminder_24h_sent?: number;
  reminder_4h_sent?: number;
}

export interface WorkoutPlan {
  id?: number;
  user_email: string;
  plan_content: string;
  created_by: string;
  updated_at?: string;
}

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

export interface User {
  id?: number;
  email: string;
  name: string;
  phone: string;
  password?: string;
  role: 'admin' | 'vip' | 'kibbutz' | 'beast';
  created_at?: string;
}

// ===== REGISTRATIONS =====

export const createRegistration = async (registration: Omit<Registration, 'id' | 'created_at'>): Promise<number> => {
  const query = `
    INSERT INTO registrations (full_name, phone, email, date, start_time, end_time)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
  
  const result = await pool.query(query, [
    registration.full_name,
    registration.phone,
    registration.email,
    registration.date,
    registration.start_time,
    registration.end_time
  ]);
  
  return result.rows[0].id;
};

export const getRegistrationsByDate = async (date: string): Promise<Registration[]> => {
  const query = `
    SELECT * FROM registrations 
    WHERE date = $1
    ORDER BY start_time
  `;
  
  const result = await pool.query(query, [date]);
  return result.rows;
};

export const getRegistrationsByDateRange = async (startDate: string, endDate: string): Promise<Registration[]> => {
  const query = `
    SELECT * FROM registrations 
    WHERE date >= $1 AND date <= $2
    ORDER BY date, start_time
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

export const getRegistrationCountByDateTime = async (date: string, time: string): Promise<number> => {
  const query = `
    SELECT COUNT(*) as count FROM registrations 
    WHERE date = $1 AND start_time <= $2 AND end_time > $2
  `;
  
  const result = await pool.query(query, [date, time, time]);
  return parseInt(result.rows[0].count);
};

export const getAllRegistrations = async (): Promise<Registration[]> => {
  const query = `
    SELECT * FROM registrations 
    ORDER BY date, start_time
  `;
  
  const result = await pool.query(query);
  return result.rows;
};

export const deleteRegistration = async (id: number): Promise<void> => {
  const query = 'DELETE FROM registrations WHERE id = $1';
  await pool.query(query, [id]);
};

export const getRegistrationsByUser = async (email: string): Promise<Registration[]> => {
  const query = `
    SELECT * FROM registrations 
    WHERE email = $1
    ORDER BY date, start_time
  `;
  
  const result = await pool.query(query, [email]);
  return result.rows;
};

export const getRegistrationsForReminders = async (
  hoursBeforeMin: number,
  hoursBeforeMax: number,
  reminderType: '24h' | '4h'
): Promise<Registration[]> => {
  const reminderField = reminderType === '24h' ? 'reminder_24h_sent' : 'reminder_4h_sent';
  
  const query = `
    SELECT * FROM registrations 
    WHERE ${reminderField} = 0
    AND (date || ' ' || start_time)::timestamp 
    BETWEEN NOW() + interval '${hoursBeforeMin} hours' 
    AND NOW() + interval '${hoursBeforeMax} hours'
    ORDER BY date, start_time
  `;
  
  const result = await pool.query(query);
  return result.rows;
};

export const markReminderSent = async (id: number, reminderType: '24h' | '4h'): Promise<void> => {
  const reminderField = reminderType === '24h' ? 'reminder_24h_sent' : 'reminder_4h_sent';
  const query = `UPDATE registrations SET ${reminderField} = 1 WHERE id = $1`;
  await pool.query(query, [id]);
};

// ===== WORKOUT PLANS =====

export const getWorkoutPlan = async (userEmail: string): Promise<WorkoutPlan | undefined> => {
  const query = 'SELECT * FROM workout_plans WHERE user_email = $1';
  const result = await pool.query(query, [userEmail]);
  return result.rows[0];
};

export const saveWorkoutPlan = async (plan: Omit<WorkoutPlan, 'id' | 'updated_at'>): Promise<void> => {
  const existing = await getWorkoutPlan(plan.user_email);
  
  if (existing) {
    const query = `
      UPDATE workout_plans 
      SET plan_content = $1, created_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_email = $3
    `;
    await pool.query(query, [plan.plan_content, plan.created_by, plan.user_email]);
  } else {
    const query = `
      INSERT INTO workout_plans (user_email, plan_content, created_by)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [plan.user_email, plan.plan_content, plan.created_by]);
  }
};

// ===== NUTRITION GOALS =====

export const getNutritionGoals = async (userEmail: string): Promise<NutritionGoals | undefined> => {
  const query = 'SELECT * FROM nutrition_goals WHERE user_email = $1';
  const result = await pool.query(query, [userEmail]);
  return result.rows[0];
};

export const saveNutritionGoals = async (goals: Omit<NutritionGoals, 'id' | 'updated_at'>): Promise<void> => {
  const existing = await getNutritionGoals(goals.user_email);
  
  if (existing) {
    const query = `
      UPDATE nutrition_goals 
      SET regular_day_protein = $1, regular_day_fat = $2, regular_day_carbs = $3,
          loading_day_protein = $4, loading_day_fat = $5, loading_day_carbs = $6,
          updated_by = $7, updated_at = CURRENT_TIMESTAMP
      WHERE user_email = $8
    `;
    await pool.query(query, [
      goals.regular_day_protein, goals.regular_day_fat, goals.regular_day_carbs,
      goals.loading_day_protein, goals.loading_day_fat, goals.loading_day_carbs,
      goals.updated_by, goals.user_email
    ]);
  } else {
    const query = `
      INSERT INTO nutrition_goals (user_email, regular_day_protein, regular_day_fat, regular_day_carbs,
                                   loading_day_protein, loading_day_fat, loading_day_carbs, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await pool.query(query, [
      goals.user_email, goals.regular_day_protein, goals.regular_day_fat, goals.regular_day_carbs,
      goals.loading_day_protein, goals.loading_day_fat, goals.loading_day_carbs, goals.updated_by
    ]);
  }
};

// ===== DAILY TRACKING =====

export const getDailyTracking = async (userEmail: string, startDate: string, endDate: string): Promise<DailyTracking[]> => {
  const query = `
    SELECT * FROM daily_tracking 
    WHERE user_email = $1 AND date >= $2 AND date <= $3
    ORDER BY date DESC
  `;
  const result = await pool.query(query, [userEmail, startDate, endDate]);
  return result.rows;
};

export const getAllDailyTracking = async (userEmail: string): Promise<DailyTracking[]> => {
  const query = 'SELECT * FROM daily_tracking WHERE user_email = $1 ORDER BY date DESC';
  const result = await pool.query(query, [userEmail]);
  return result.rows;
};

export const getDailyTrackingByDate = async (userEmail: string, date: string): Promise<DailyTracking | undefined> => {
  const query = 'SELECT * FROM daily_tracking WHERE user_email = $1 AND date = $2';
  const result = await pool.query(query, [userEmail, date]);
  return result.rows[0];
};

export const saveDailyTracking = async (tracking: Omit<DailyTracking, 'id' | 'created_at'>): Promise<void> => {
  const existing = await getDailyTrackingByDate(tracking.user_email, tracking.date);
  
  if (existing) {
    const query = `
      UPDATE daily_tracking 
      SET morning_weight = $1, total_calories = $2, protein = $3, fat = $4, carbs = $5, steps = $6, notes = $7
      WHERE user_email = $8 AND date = $9
    `;
    await pool.query(query, [
      tracking.morning_weight, tracking.total_calories, tracking.protein, 
      tracking.fat, tracking.carbs, tracking.steps, tracking.notes,
      tracking.user_email, tracking.date
    ]);
  } else {
    const query = `
      INSERT INTO daily_tracking (user_email, date, morning_weight, total_calories, protein, fat, carbs, steps, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    await pool.query(query, [
      tracking.user_email, tracking.date, tracking.morning_weight, tracking.total_calories,
      tracking.protein, tracking.fat, tracking.carbs, tracking.steps, tracking.notes
    ]);
  }
};

export const deleteDailyTracking = async (userEmail: string, date: string): Promise<void> => {
  const query = 'DELETE FROM daily_tracking WHERE user_email = $1 AND date = $2';
  await pool.query(query, [userEmail, date]);
};

// ===== USER MANAGEMENT =====

export const createUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<number> => {
  const query = `
    INSERT INTO users (email, name, phone, password, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  
  const result = await pool.query(query, [user.email, user.name, user.phone, user.password || '', user.role]);
  return result.rows[0].id;
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const getUserById = async (id: number | bigint): Promise<User | undefined> => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const getAllUsers = async (): Promise<User[]> => {
  const query = 'SELECT * FROM users ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
};

export const updateUser = async (id: number, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<void> => {
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  if (updates.name) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.email) {
    fields.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.phone) {
    fields.push(`phone = $${paramIndex++}`);
    values.push(updates.phone);
  }
  if (updates.role) {
    fields.push(`role = $${paramIndex++}`);
    values.push(updates.role);
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
  await pool.query(query, values);
};

export default pool;

