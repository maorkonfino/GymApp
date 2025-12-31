import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import * as db from './database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ===== USERS =====

// Get all users (Admin only)
app.get('/api/users', (req: Request, res: Response) => {
  try {
    const users = db.getAllUsers();
    // Don't send passwords back
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Register new user
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, lastName, phone, email, password } = req.body;

    if (!name || !lastName || !phone || !email || !password) {
      return res.status(400).json({ error: 'כל השדות נדרשים' });
    }

    // Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'משתמש עם אימייל זה כבר קיים במערכת' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const fullName = `${name} ${lastName}`;
    const userId = db.createUser({ 
      email, 
      name: fullName, 
      phone,
      password: hashedPassword,
      role: 'kibbutz' 
    });
    
    const user = db.getUserById(userId);
    
    if (!user) {
      return res.status(500).json({ error: 'שגיאה ביצירת משתמש' });
    }

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'שגיאה בהרשמה' });
  }
});

// Refresh user data (get latest user info by email)
app.post('/api/auth/login-refresh', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'אימייל נדרש' });
    }

    const user = db.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'משתמש לא נמצא' });
    }

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'שגיאה ברענון נתונים' });
  }
});

// Login user
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'אימייל וסיסמה נדרשים' });
    }

    // Get user by email (includes password field)
    const user = db.getUserByEmail(email);
    
    if (!user || !user.password) {
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'שגיאה בהתחברות' });
  }
});

// Update user profile
app.put('/api/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    db.updateUser(parseInt(id), { name, email, phone, role });
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete user with ID:', id);
    
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    db.deleteUser(userId);
    console.log('User deleted successfully:', id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

// Get all users (admin only)
app.get('/api/users', (req: Request, res: Response) => {
  try {
    const users = db.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// ===== REGISTRATIONS =====

// Create registration
app.post('/api/registrations', (req: Request, res: Response) => {
  try {
    console.log('\n📝 NEW REGISTRATION REQUEST:', req.body);
    const { name, email, phone, date, startTime, endTime } = req.body;

    if (!name || !email || !phone || !date || !startTime || !endTime) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Helper function to parse time
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Check for duplicate registration (same user, date, and overlapping time)
    const existingRegistrations = db.getRegistrationsByDate(date);
    const newStartMinutes = parseTime(startTime);
    const newEndMinutes = parseTime(endTime);
    
    console.log('=== DUPLICATE CHECK START ===');
    console.log('New registration:', { email, date, startTime, endTime });
    console.log('Existing registrations for this date:', existingRegistrations.length);
    
    const duplicateRegistration = existingRegistrations.find((reg: any) => {
      // Skip temp emails (admin quick registrations)
      if (reg.email && reg.email.includes('@temp.com')) {
        console.log('  ⏭️  Skipping temp email:', reg.email);
        return false;
      }
      
      if (email && email.includes('@temp.com')) {
        console.log('  ⏭️  New registration is temp email:', email);
        return false;
      }
      
      console.log(`Comparing with existing registration:`, {
        existingEmail: `"${reg.email}"`,
        newEmail: `"${email}"`,
        existingTimes: `${reg.start_time}-${reg.end_time}`,
        newTimes: `${startTime}-${endTime}`
      });
      
      // Compare emails (case insensitive)
      const emailMatch = reg.email && email && reg.email.toLowerCase() === email.toLowerCase();
      
      if (!emailMatch) {
        console.log('  ✗ Different email');
        return false;
      }
      
      const existingStartMinutes = parseTime(reg.start_time);
      const existingEndMinutes = parseTime(reg.end_time);
      
      // Check if times overlap
      const hasOverlap = (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes);
      
      console.log('  ✓ Same email! Checking overlap:', {
        newStart: `${startTime} (${newStartMinutes}min)`,
        newEnd: `${endTime} (${newEndMinutes}min)`,
        existingStart: `${reg.start_time} (${existingStartMinutes}min)`,
        existingEnd: `${reg.end_time} (${existingEndMinutes}min)`,
        hasOverlap: hasOverlap ? '🔴 YES - DUPLICATE!' : '✅ NO'
      });
      
      return hasOverlap;
    });
    
    if (duplicateRegistration) {
      console.log('❌ DUPLICATE FOUND! Rejecting registration');
      console.log('=== DUPLICATE CHECK END ===');
      return res.status(400).json({ 
        error: 'כבר קיים רישום עבורך באותו התאריך ושעות חופפות' 
      });
    }
    
    console.log('✅ No duplicate found, proceeding with registration');
    console.log('=== DUPLICATE CHECK END ===');

    // Check if registration overlaps with "Closed for Seniors" time
    const registrationDate = new Date(date);
    const dayOfWeek = registrationDate.getDay(); // 0 = Sunday, 4 = Thursday
    
    if (dayOfWeek === 0 || dayOfWeek === 4) {
      const startMinutes = newStartMinutes;
      const endMinutes = newEndMinutes;
      const closedStart = 9 * 60; // 9:00
      const closedEnd = 10 * 60; // 10:00
      
      // Check if there's any overlap
      const hasOverlap = (startMinutes < closedEnd && endMinutes > closedStart);
      
      if (hasOverlap) {
        return res.status(400).json({ 
          error: 'הרישום חוסם את השעות 9:00-10:00 המיועדות לגיל השלישי בימים א\' וה\'' 
        });
      }
    }

    const id = db.createRegistration({
      full_name: name,
      email,
      phone,
      date,
      start_time: startTime,
      end_time: endTime
    });

    console.log('✅ Registration created successfully! ID:', id);
    res.status(201).json({ id, message: 'Registration created successfully' });
  } catch (error) {
    console.error('❌ Error creating registration:', error);
    res.status(500).json({ error: 'Failed to create registration' });
  }
});

// Get all registrations
app.get('/api/registrations', (req: Request, res: Response) => {
  try {
    const registrations = db.getAllRegistrations();
    res.json(registrations);
  } catch (error) {
    console.error('Error getting registrations:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

// Get registrations by date
app.get('/api/registrations/date/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const registrations = db.getRegistrationsByDate(date);
    res.json(registrations);
  } catch (error) {
    console.error('Error getting registrations by date:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

// Get registrations for a specific user (My Trainings)
app.get('/api/registrations/user/:email', (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const registrations = db.getRegistrationsByUser(email);
    res.json(registrations);
  } catch (error) {
    console.error('Error getting user registrations:', error);
    res.status(500).json({ error: 'Failed to get user registrations' });
  }
});

// Get registrations by date range
app.get('/api/registrations/range', (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const registrations = db.getRegistrationsByDateRange(start as string, end as string);
    res.json(registrations);
  } catch (error) {
    console.error('Error getting registrations by range:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

// Delete registration
app.delete('/api/registrations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.deleteRegistration(parseInt(id));
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

// Update registration
app.put('/api/registrations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.body;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }
    
    db.updateRegistration(parseInt(id), date, startTime, endTime);
    res.json({ message: 'Registration updated successfully' });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

// Delete old registrations (past dates)
app.delete('/api/registrations/cleanup/old', (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    
    db.deleteOldRegistrations(todayString);
    
    res.json({ 
      message: 'Old registrations cleaned up successfully'
    });
  } catch (error) {
    console.error('Error cleaning up old registrations:', error);
    res.status(500).json({ error: 'Failed to cleanup old registrations' });
  }
});

// ===== WORKOUT PLANS =====

// Get workout plan for user
app.get('/api/workout-plans/:email', (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const plan = db.getWorkoutPlan(email);
    
    if (!plan) {
      return res.json({ plan_content: '' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error getting workout plan:', error);
    res.status(500).json({ error: 'Failed to get workout plan' });
  }
});

// Get workout plan by userId (for admin)
app.get('/api/workout-plans/user/:userId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = db.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const plans = db.getWorkoutPlan(user.email);
    res.json(plans ? [plans] : []);
  } catch (error) {
    console.error('Error getting workout plan:', error);
    res.status(500).json({ error: 'Failed to get workout plan' });
  }
});

// Save workout plan
app.post('/api/workout-plans', (req: Request, res: Response) => {
  try {
    const { user_email, userId, plan_content, planData, created_by } = req.body;

    // Support both userId and user_email
    let email = user_email;
    if (userId) {
      const user = db.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      email = user.email;
    }

    if (!email) {
      return res.status(400).json({ error: 'user_email or userId is required' });
    }

    // Support both plan_content and planData (JSON string)
    const content = planData || plan_content || '';

    db.saveWorkoutPlan({ user_email: email, plan_content: content, created_by: created_by || email });
    res.json({ message: 'Workout plan saved successfully' });
  } catch (error) {
    console.error('Error saving workout plan:', error);
    res.status(500).json({ error: 'Failed to save workout plan' });
  }
});

// ===== WORKOUT ARCHIVE & FOLDERS =====

// Get archived workout plans for user
app.get('/api/workout-plans/archive/:email', (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    // Get folders with their plans
    const folders = db.getWorkoutFolders(email);
    const foldersWithPlans = folders.map(folder => ({
      ...folder,
      plans: db.getArchivedWorkoutPlansByFolder(email, folder.id!)
    }));
    
    // Get unorganized plans
    const unorganized = db.getUnorganizedArchivedPlans(email);
    
    res.json({
      folders: foldersWithPlans,
      unorganized
    });
  } catch (error) {
    console.error('Error getting archived plans:', error);
    res.status(500).json({ error: 'Failed to get archived plans' });
  }
});

// Create workout folder
app.post('/api/workout-plans/folders', (req: Request, res: Response) => {
  try {
    const { name, userEmail } = req.body;
    
    if (!name || !userEmail) {
      return res.status(400).json({ error: 'Name and userEmail are required' });
    }
    
    const folderId = db.createWorkoutFolder({ user_email: userEmail, name });
    res.json({ id: folderId, message: 'Folder created successfully' });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Archive workout plan
app.post('/api/workout-plans/archive', (req: Request, res: Response) => {
  try {
    const { userEmail, name, planContent, folderId } = req.body;
    
    if (!userEmail || !name || !planContent) {
      return res.status(400).json({ error: 'userEmail, name, and planContent are required' });
    }
    
    const planId = db.archiveWorkoutPlan({
      user_email: userEmail,
      name,
      plan_content: planContent,
      folder_id: folderId || null
    });
    
    res.json({ id: planId, message: 'Plan archived successfully' });
  } catch (error) {
    console.error('Error archiving plan:', error);
    res.status(500).json({ error: 'Failed to archive plan' });
  }
});

// Unarchive workout plan (restore to main view)
app.post('/api/workout-plans/unarchive/:planId', (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.planId);
    
    db.unarchiveWorkoutPlan(planId);
    res.json({ message: 'Plan unarchived successfully' });
  } catch (error) {
    console.error('Error unarchiving plan:', error);
    res.status(500).json({ error: 'Failed to unarchive plan' });
  }
});

// Move plan to folder
app.post('/api/workout-plans/move/:planId', (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.planId);
    const { folderId } = req.body;
    
    db.movePlanToFolder(planId, folderId || null);
    res.json({ message: 'Plan moved successfully' });
  } catch (error) {
    console.error('Error moving plan:', error);
    res.status(500).json({ error: 'Failed to move plan' });
  }
});

// Delete workout folder
app.delete('/api/workout-plans/folders/:folderId', (req: Request, res: Response) => {
  try {
    const folderId = parseInt(req.params.folderId);
    
    db.deleteWorkoutFolder(folderId);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// ===== NUTRITION GOALS =====

// Get nutrition goals for user
app.get('/api/nutrition-goals/:email', (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const goals = db.getNutritionGoals(email);
    
    if (!goals) {
      return res.json({
        regular_day_protein: 0,
        regular_day_fat: 0,
        regular_day_carbs: 0,
        loading_day_protein: 0,
        loading_day_fat: 0,
        loading_day_carbs: 0
      });
    }
    
    res.json(goals);
  } catch (error) {
    console.error('Error getting nutrition goals:', error);
    res.status(500).json({ error: 'Failed to get nutrition goals' });
  }
});

// Get nutrition goals by userId (for admin)
app.get('/api/nutrition-goals/user/:userId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = db.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const goals = db.getNutritionGoals(user.email);
    res.json(goals ? [goals] : []);
  } catch (error) {
    console.error('Error getting nutrition goals:', error);
    res.status(500).json({ error: 'Failed to get nutrition goals' });
  }
});

// Save nutrition goals
app.post('/api/nutrition-goals', (req: Request, res: Response) => {
  try {
    const {
      user_email,
      userId,
      regular_day_protein,
      regular_day_fat,
      regular_day_carbs,
      loading_day_protein,
      loading_day_fat,
      loading_day_carbs,
      normalProtein,
      normalFat,
      normalCarbs,
      loadingProtein,
      loadingFat,
      loadingCarbs,
      updated_by
    } = req.body;

    // Support both userId and user_email
    let email = user_email;
    if (userId) {
      const user = db.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      email = user.email;
    }

    if (!email) {
      return res.status(400).json({ error: 'user_email or userId is required' });
    }

    // Support both naming conventions
    db.saveNutritionGoals({
      user_email: email,
      regular_day_protein: normalProtein || regular_day_protein || 0,
      regular_day_fat: normalFat || regular_day_fat || 0,
      regular_day_carbs: normalCarbs || regular_day_carbs || 0,
      loading_day_protein: loadingProtein || loading_day_protein || 0,
      loading_day_fat: loadingFat || loading_day_fat || 0,
      loading_day_carbs: loadingCarbs || loading_day_carbs || 0,
      updated_by: updated_by || email
    });

    res.json({ message: 'Nutrition goals saved successfully' });
  } catch (error) {
    console.error('Error saving nutrition goals:', error);
    res.status(500).json({ error: 'Failed to save nutrition goals' });
  }
});

// ===== DAILY TRACKING =====

// Get daily tracking for user (date range)
app.get('/api/daily-tracking/:email', (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { start, end } = req.query;
    
    // If no date range provided, get all entries for the user
    if (!start || !end) {
      const tracking = db.getAllDailyTracking(email);
      return res.json(tracking);
    }

    const tracking = db.getDailyTracking(email, start as string, end as string);
    res.json(tracking);
  } catch (error) {
    console.error('Error getting daily tracking:', error);
    res.status(500).json({ error: 'Failed to get daily tracking' });
  }
});

// Save daily tracking
app.post('/api/daily-tracking', (req: Request, res: Response) => {
  try {
    const { userEmail, entries } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    // Support both single entry and array of entries
    if (Array.isArray(entries)) {
      // Save multiple entries
      entries.forEach((entry: any) => {
        db.saveDailyTracking({
          user_email: userEmail,
          date: entry.date,
          morning_weight: entry.morning_weight,
          total_calories: entry.calories,
          protein: entry.protein,
          fat: entry.fat,
          carbs: entry.carbs,
          steps: entry.steps,
          notes: entry.notes
        });
      });
    } else {
      // Support old format for backward compatibility
      const {
        user_email,
        date,
        morning_weight,
        total_calories,
        protein,
        fat,
        carbs,
        steps,
        notes
      } = req.body;

      if (!user_email || !date) {
        return res.status(400).json({ error: 'user_email and date are required' });
      }

      db.saveDailyTracking({
        user_email,
        date,
        morning_weight,
        total_calories,
        protein,
        fat,
        carbs,
        steps,
        notes
      });
    }

    res.json({ message: 'Daily tracking saved successfully' });
  } catch (error) {
    console.error('Error saving daily tracking:', error);
    res.status(500).json({ error: 'Failed to save daily tracking' });
  }
});

// Delete daily tracking
app.delete('/api/daily-tracking/:email/:date', (req: Request, res: Response) => {
  try {
    const { email, date } = req.params;
    db.deleteDailyTracking(email, date);
    res.json({ message: 'Daily tracking deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily tracking:', error);
    res.status(500).json({ error: 'Failed to delete daily tracking' });
  }
});

// Get reminder settings
app.get('/api/reminder-settings', (req: Request, res: Response) => {
  try {
    const settings = db.getReminderSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching reminder settings:', error);
    res.status(500).json({ error: 'Failed to fetch reminder settings' });
  }
});

// Update reminder settings
app.put('/api/reminder-settings', (req: Request, res: Response) => {
  try {
    const { enabled, message_24h, message_4h } = req.body;
    db.updateReminderSettings({ enabled, message_24h, message_4h });
    res.json({ message: 'Reminder settings updated successfully' });
  } catch (error) {
    console.error('Error updating reminder settings:', error);
    res.status(500).json({ error: 'Failed to update reminder settings' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});

export default app;

