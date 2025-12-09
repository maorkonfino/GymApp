import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import crypto from 'crypto';
import cron from 'node-cron';
import * as db from './database-postgres';
import { sendWorkoutReminderEmail, sendPasswordResetEmail } from './services/emailService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
db.initDatabase().then(() => {
  console.log('✅ Database initialized successfully');
}).catch((error) => {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ===== USERS =====

// Get all users (Admin only)
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await db.getAllUsers();
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

    console.log('📝 Registration attempt:', {
      name,
      lastName,
      email,
      emailLower: email.toLowerCase(),
      passwordLength: password?.length,
      passwordSample: password?.substring(0, 3) + '***'
    });

    if (!name || !lastName || !phone || !email || !password) {
      return res.status(400).json({ error: 'כל השדות נדרשים' });
    }

    // Check if user already exists (case-insensitive)
    const normalizedEmail = email.toLowerCase();
    const existingUser = await db.getUserByEmail(normalizedEmail);
    if (existingUser) {
      console.log('❌ User already exists:', normalizedEmail);
      return res.status(400).json({ error: 'משתמש עם אימייל זה כבר קיים במערכת' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Password hashed:', {
      originalLength: password.length,
      hashedLength: hashedPassword.length,
      hashedPrefix: hashedPassword.substring(0, 20)
    });

    // Create new user
    const fullName = `${name} ${lastName}`;
    const userId = await db.createUser({ 
      email: normalizedEmail, 
      name: fullName, 
      phone,
      password: hashedPassword,
      role: 'kibbutz' 
    });
    
    console.log('👤 User created with ID:', userId);
    
    const user = await db.getUserById(userId);
    
    if (!user) {
      console.log('❌ Failed to retrieve created user');
      return res.status(500).json({ error: 'שגיאה ביצירת משתמש' });
    }

    console.log('✅ Registration successful:', {
      userId: user.id,
      email: user.email,
      name: user.name,
      hasPassword: !!user.password
    });

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

    const user = await db.getUserByEmail(email.toLowerCase());
    
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

    console.log('🔐 Login attempt:', {
      email,
      emailLower: email.toLowerCase(),
      passwordLength: password?.length
    });

    if (!email || !password) {
      return res.status(400).json({ error: 'אימייל וסיסמה נדרשים' });
    }

    // Get user by email (case-insensitive)
    const user = await db.getUserByEmail(email.toLowerCase());
    
    console.log('👤 User found:', {
      found: !!user,
      hasPassword: !!user?.password,
      userEmail: user?.email,
      userName: user?.name
    });
    
    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('🔑 Password validation:', {
      isValid: isPasswordValid,
      providedPassword: password,
      hashedPasswordPrefix: user.password.substring(0, 20)
    });
    
    if (!isPasswordValid) {
      console.log('❌ Password invalid');
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }

    console.log('✅ Login successful for:', user.email);
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'שגיאה בהתחברות' });
  }
});

// Update user profile
app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    await db.updateUser(parseInt(id), { name, email, phone, role });
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Forgot Password - Send reset email
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'אימייל נדרש' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await db.getUserByEmail(normalizedEmail);
    
    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return res.json({ message: 'אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await db.createPasswordResetToken(normalizedEmail, resetToken, expiresAt);

    // Create reset URL
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetURL = `${frontendURL}/reset-password?token=${resetToken}`;

    // Send email using SendGrid via emailService
    await sendPasswordResetEmail(normalizedEmail, user.name, resetURL);
    
    console.log('✅ Password reset email sent to:', normalizedEmail);
    res.json({ message: 'אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'שגיאה בשליחת המייל' });
  }
});

// Reset Password - Update password with token
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'טוקן וסיסמה חדשה נדרשים' });
    }

    // Get token from database
    const tokenData = await db.getPasswordResetToken(token);
    
    if (!tokenData) {
      return res.status(400).json({ error: 'טוקן לא תקף או שפג תוקפו' });
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expires_at)) {
      return res.status(400).json({ error: 'טוקן פג תוקף' });
    }

    // Check if token was already used
    if (tokenData.used) {
      return res.status(400).json({ error: 'טוקן כבר נוצל' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await db.getUserByEmail(tokenData.email);
    if (!user) {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }

    await db.updateUser(user.id!, { password: hashedPassword } as any);

    // Mark token as used
    await db.markTokenAsUsed(token);

    // Clean up expired tokens
    await db.deleteExpiredTokens();

    console.log('✅ Password reset successfully for:', tokenData.email);
    res.json({ message: 'הסיסמה אופסה בהצלחה' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'שגיאה באיפוס הסיסמה' });
  }
});

// TEMPORARY: Admin password reset endpoint
app.post('/api/admin/reset-user-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword, adminSecret } = req.body;

    // Simple secret check (you should replace with proper admin authentication)
    if (adminSecret !== 'BEAST_ADMIN_2024') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password required' });
    }

    const user = await db.getUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.updateUser(user.id!, { password: hashedPassword } as any);

    console.log('✅ Admin reset password for:', email);
    res.json({ message: 'Password updated successfully', user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ===== REGISTRATIONS =====

// Create registration
app.post('/api/registrations', async (req: Request, res: Response) => {
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
    const existingRegistrations = await db.getRegistrationsByDate(date);
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

    const id = await db.createRegistration({
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
app.get('/api/registrations', async (req: Request, res: Response) => {
  try {
    const registrations = await db.getAllRegistrations();
    res.json(registrations);
  } catch (error) {
    console.error('Error getting registrations:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

// Get registrations by date
app.get('/api/registrations/date/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const registrations = await db.getRegistrationsByDate(date);
    res.json(registrations);
  } catch (error) {
    console.error('Error getting registrations by date:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

// Get registrations for a specific user (My Trainings)
app.get('/api/registrations/user/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const registrations = await db.getRegistrationsByUser(email);
    res.json(registrations);
  } catch (error) {
    console.error('Error getting user registrations:', error);
    res.status(500).json({ error: 'Failed to get user registrations' });
  }
});

// Get registrations by date range
app.get('/api/registrations/range', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const registrations = await db.getRegistrationsByDateRange(start as string, end as string);
    res.json(registrations);
  } catch (error) {
    console.error('Error getting registrations by range:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

// Delete registration
app.delete('/api/registrations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.deleteRegistration(parseInt(id));
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

// Delete old registrations
app.delete('/api/registrations/cleanup/old', async (req: Request, res: Response) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    await db.deleteOldRegistrations(today);
    res.json({ message: 'Old registrations cleaned up successfully' });
  } catch (error) {
    console.error('Error cleaning up old registrations:', error);
    res.status(500).json({ error: 'Failed to clean up old registrations' });
  }
});

// ===== WORKOUT PLANS =====

// Get workout plan for user
app.get('/api/workout-plans/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const plan = await db.getWorkoutPlan(email);
    
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
app.get('/api/workout-plans/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await db.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const plans = await db.getWorkoutPlan(user.email);
    res.json(plans ? [plans] : []);
  } catch (error) {
    console.error('Error getting workout plan:', error);
    res.status(500).json({ error: 'Failed to get workout plan' });
  }
});

// Save workout plan
app.post('/api/workout-plans', async (req: Request, res: Response) => {
  try {
    const { user_email, userId, plan_content, planData, created_by } = req.body;

    // Support both userId and user_email
    let email = user_email;
    if (userId) {
      const user = await db.getUserById(userId);
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

    await db.saveWorkoutPlan({ user_email: email, plan_content: content, created_by: created_by || email });
    res.json({ message: 'Workout plan saved successfully' });
  } catch (error) {
    console.error('Error saving workout plan:', error);
    res.status(500).json({ error: 'Failed to save workout plan' });
  }
});

// ===== NUTRITION GOALS =====

// Get nutrition goals for user
app.get('/api/nutrition-goals/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const goals = await db.getNutritionGoals(email);
    
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
app.get('/api/nutrition-goals/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await db.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const goals = await db.getNutritionGoals(user.email);
    res.json(goals ? [goals] : []);
  } catch (error) {
    console.error('Error getting nutrition goals:', error);
    res.status(500).json({ error: 'Failed to get nutrition goals' });
  }
});

// Save nutrition goals
app.post('/api/nutrition-goals', async (req: Request, res: Response) => {
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
      const user = await db.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      email = user.email;
    }

    if (!email) {
      return res.status(400).json({ error: 'user_email or userId is required' });
    }

    // Support both naming conventions
    await db.saveNutritionGoals({
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
app.get('/api/daily-tracking/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { start, end } = req.query;
    
    // If no date range provided, get all entries for the user
    if (!start || !end) {
      const tracking = await db.getAllDailyTracking(email);
      return res.json(tracking);
    }

    const tracking = await db.getDailyTracking(email, start as string, end as string);
    res.json(tracking);
  } catch (error) {
    console.error('Error getting daily tracking:', error);
    res.status(500).json({ error: 'Failed to get daily tracking' });
  }
});

// Save daily tracking
app.post('/api/daily-tracking', async (req: Request, res: Response) => {
  try {
    const { userEmail, entries } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    // Support both single entry and array of entries
    if (Array.isArray(entries)) {
      // Save multiple entries
      for (const entry of entries) {
        await db.saveDailyTracking({
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
      }
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

      await db.saveDailyTracking({
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
app.delete('/api/daily-tracking/:email/:date', async (req: Request, res: Response) => {
  try {
    const { email, date } = req.params;
    await db.deleteDailyTracking(email, date);
    res.json({ message: 'Daily tracking deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily tracking:', error);
    res.status(500).json({ error: 'Failed to delete daily tracking' });
  }
});

// TEMPORARY: Update password endpoint
app.post('/api/admin/update-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password required' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await db.updateUser(user.id!, { password: hashedPassword } as any);
    
    res.json({ message: 'Password updated successfully', email });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// ===== WORKOUT REMINDERS CRON JOB =====

// Function to send workout reminders
const sendWorkoutReminders = async () => {
  try {
    console.log('🔔 Checking for workout reminders...');
    
    // Get current time and 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Format dates for query
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`📅 Checking for workouts on ${tomorrowDateStr}`);
    
    // Get all registrations for tomorrow that haven't been reminded
    const registrations = await db.getRegistrationsByDateRange(tomorrowDateStr, tomorrowDateStr);
    
    if (registrations.length === 0) {
      console.log('📭 No workouts found for tomorrow');
      return;
    }
    
    console.log(`📬 Found ${registrations.length} workouts for tomorrow`);
    
    // Send reminder for each registration that hasn't been reminded yet
    for (const reg of registrations) {
      // Check if reminder already sent
      if (reg.reminder_24h_sent) {
        console.log(`⏭️  Reminder already sent for ${reg.email} at ${reg.start_time}`);
        continue;
      }
      
      try {
        // Send email
        await sendWorkoutReminderEmail(
          reg.email,
          reg.full_name,
          reg.date,
          reg.start_time,
          reg.end_time
        );
        
        // Mark as sent
        await db.updateRegistrationReminderStatus(reg.id!, '24h');
        console.log(`✅ Sent reminder to ${reg.email} for ${reg.start_time}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder to ${reg.email}:`, error);
      }
    }
    
    console.log('✅ Workout reminders check completed');
  } catch (error) {
    console.error('❌ Error in sendWorkoutReminders:', error);
  }
};

// Run reminder check every hour at minute 0
// Format: "0 * * * *" means: at minute 0 of every hour
cron.schedule('0 * * * *', sendWorkoutReminders, {
  timezone: 'Asia/Jerusalem'
});

console.log('⏰ Workout reminders cron job scheduled (runs every hour) via SendGrid');

// Also run once on startup (after a small delay to ensure DB is ready)
setTimeout(() => {
  console.log('🚀 Running initial workout reminders check...');
  sendWorkoutReminders();
}, 5000);

// Temporary Admin Password Reset Endpoint (for debugging)
app.post('/api/admin/reset-user-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword, adminSecret } = req.body;

    // Simple admin secret check
    if (adminSecret !== 'BEAST_ADMIN_2024') {
      console.log('❌ Invalid admin secret');
      return res.status(403).json({ error: 'אין הרשאה' });
    }

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'אימייל וסיסמה חדשה נדרשים' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await db.getUserByEmail(normalizedEmail);

    if (!user) {
      console.log('❌ User not found:', normalizedEmail);
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.updateUser(user.id!, { password: hashedPassword } as any);

    console.log(`✅ Password reset successfully for: ${normalizedEmail}`);
    res.json({ 
      success: true,
      message: 'הסיסמה אופסה בהצלחה',
      user: user.name,
      email: normalizedEmail 
    });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({ error: 'שגיאה באיפוס הסיסמה' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

