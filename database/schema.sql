-- MySQL Database Schema for Gnaneswar Fitness Platform

CREATE DATABASE IF NOT EXISTS gnaneswar_fitness;
USE gnaneswar_fitness;

-- Disable foreign key checks to allow drops
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS user_badges;
DROP TABLE IF EXISTS badges;
DROP TABLE IF EXISTS forum_replies;
DROP TABLE IF EXISTS forum_posts;
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS progress_entries;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS transformation_photos;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS blog_categories;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS nutrition_logs;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS nutrition_plans;
DROP TABLE IF EXISTS workout_logs;
DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS workout_days;
DROP TABLE IF EXISTS workout_programs;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('admin', 'client', 'lead') NOT NULL DEFAULT 'lead',
    avatar_url VARCHAR(500) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    email_verified TINYINT(1) NOT NULL DEFAULT 0,
    last_login DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Profiles Table
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    date_of_birth DATE NULL,
    gender ENUM('male', 'female', 'other') NULL,
    height_cm FLOAT NULL,
    weight_kg FLOAT NULL,
    target_weight_kg FLOAT NULL,
    fitness_goal ENUM('weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'flexibility', 'general_fitness') NULL,
    experience_level ENUM('beginner', 'intermediate', 'advanced') NULL,
    medical_conditions TEXT NULL,
    dietary_preferences ENUM('vegetarian', 'non_vegetarian', 'vegan', 'eggetarian') NULL,
    activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active') NULL,
    bio TEXT NULL,
    instagram_handle VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exercises Table
CREATE TABLE exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    muscle_group ENUM('chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body', 'cardio') NOT NULL,
    equipment VARCHAR(100) NULL,
    description TEXT NULL,
    instructions TEXT NULL,
    video_url VARCHAR(500) NULL,
    image_url VARCHAR(500) NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    calories_per_rep FLOAT NULL DEFAULT 0.0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_muscle (muscle_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Workout Programs Table
CREATE TABLE workout_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    duration_weeks INT NOT NULL DEFAULT 4,
    goal ENUM('weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'general_fitness') NULL,
    image_url VARCHAR(500) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Workout Days Table
CREATE TABLE workout_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    day_number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    focus_area VARCHAR(100) NULL,
    notes TEXT NULL,
    UNIQUE KEY uq_program_day (program_id, day_number),
    FOREIGN KEY (program_id) REFERENCES workout_programs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Workout Exercises Table
CREATE TABLE workout_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_day_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT NOT NULL DEFAULT 3,
    reps VARCHAR(50) NOT NULL DEFAULT '10',
    rest_seconds INT NOT NULL DEFAULT 60,
    order_index INT NOT NULL DEFAULT 0,
    notes TEXT NULL,
    superset_group INT NULL,
    FOREIGN KEY (workout_day_id) REFERENCES workout_days(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Workout Logs Table
CREATE TABLE workout_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    workout_date DATE NOT NULL,
    sets_completed INT NOT NULL,
    reps_completed VARCHAR(200) NULL,
    weight_kg FLOAT NULL,
    duration_minutes INT NULL,
    calories_burned FLOAT NULL,
    notes TEXT NULL,
    rating INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    INDEX idx_user_workout_date (user_id, workout_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nutrition Plans Table
CREATE TABLE nutrition_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    goal ENUM('weight_loss', 'muscle_gain', 'maintenance', 'endurance') NULL,
    daily_calories INT NULL,
    protein_grams FLOAT NULL,
    carbs_grams FLOAT NULL,
    fat_grams FLOAT NULL,
    diet_type ENUM('vegetarian', 'non_vegetarian', 'vegan', 'eggetarian') NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Meals Table
CREATE TABLE meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    meal_type ENUM('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack') NOT NULL,
    meal_order INT NOT NULL DEFAULT 0,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    foods TEXT NULL,
    calories INT NULL,
    protein_grams FLOAT NULL,
    carbs_grams FLOAT NULL,
    fat_grams FLOAT NULL,
    time_suggestion VARCHAR(50) NULL,
    FOREIGN KEY (plan_id) REFERENCES nutrition_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nutrition Logs Table
CREATE TABLE nutrition_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    log_date DATE NOT NULL,
    meal_type ENUM('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack') NOT NULL,
    food_items TEXT NOT NULL,
    calories INT NULL,
    protein_grams FLOAT NULL,
    carbs_grams FLOAT NULL,
    fat_grams FLOAT NULL,
    water_ml INT NULL DEFAULT 0,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_log_date (user_id, log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Time Slots Table
CREATE TABLE time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week INT NOT NULL, -- 0=Monday .. 6=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_type ENUM('consultation', 'training', 'assessment', 'follow_up') NOT NULL DEFAULT 'training',
    max_bookings INT NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Appointments Table
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    time_slot_id INT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type ENUM('consultation', 'training', 'assessment', 'follow_up') NOT NULL DEFAULT 'training',
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
    notes TEXT NULL,
    cancel_reason TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL,
    INDEX idx_user_appt_date (user_id, appointment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Subscriptions Table
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    plan_price FLOAT NOT NULL,
    billing_cycle ENUM('monthly', 'quarterly', 'yearly') NOT NULL DEFAULT 'monthly',
    status ENUM('active', 'expired', 'cancelled', 'past_due') NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew TINYINT(1) NOT NULL DEFAULT 1,
    razorpay_subscription_id VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments Table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subscription_id INT NULL,
    amount FLOAT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NULL,
    razorpay_order_id VARCHAR(255) NULL,
    razorpay_payment_id VARCHAR(255) NULL,
    razorpay_signature VARCHAR(500) NULL,
    invoice_number VARCHAR(50) NULL UNIQUE,
    description VARCHAR(500) NULL,
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Blog Categories Table
CREATE TABLE blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Blog Posts Table
CREATE TABLE blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(350) NOT NULL UNIQUE,
    excerpt VARCHAR(500) NULL,
    content TEXT NOT NULL,
    cover_image VARCHAR(500) NULL,
    category_id INT NULL,
    author_id INT NULL,
    status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    tags VARCHAR(500) NULL,
    views_count INT NOT NULL DEFAULT 0,
    likes_count INT NOT NULL DEFAULT 0,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    published_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_blog_slug (slug),
    INDEX idx_blog_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transformation Photos Table
CREATE TABLE transformation_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    client_name VARCHAR(200) NOT NULL,
    before_image VARCHAR(500) NOT NULL,
    after_image VARCHAR(500) NOT NULL,
    duration_weeks INT NULL,
    weight_lost_kg FLOAT NULL,
    muscle_gained_kg FLOAT NULL,
    description TEXT NULL,
    program_followed VARCHAR(200) NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_approved TINYINT(1) NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Testimonials Table
CREATE TABLE testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    client_name VARCHAR(200) NOT NULL,
    client_image VARCHAR(500) NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    program_name VARCHAR(200) NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_approved TINYINT(1) NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('info', 'success', 'warning', 'error', 'reminder', 'achievement') NOT NULL DEFAULT 'info',
    link VARCHAR(500) NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    read_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notif_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Progress Entries Table
CREATE TABLE progress_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entry_date DATE NOT NULL,
    weight_kg FLOAT NULL,
    body_fat_percentage FLOAT NULL,
    chest_cm FLOAT NULL,
    waist_cm FLOAT NULL,
    hips_cm FLOAT NULL,
    biceps_cm FLOAT NULL,
    thighs_cm FLOAT NULL,
    calves_cm FLOAT NULL,
    neck_cm FLOAT NULL,
    shoulders_cm FLOAT NULL,
    front_photo VARCHAR(500) NULL,
    side_photo VARCHAR(500) NULL,
    back_photo VARCHAR(500) NULL,
    notes TEXT NULL,
    energy_level INT NULL,
    sleep_hours FLOAT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_progress_date (user_id, entry_date),
    INDEX idx_user_progress_date (user_id, entry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contact Submissions Table
CREATE TABLE contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
    admin_notes TEXT NULL,
    replied_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contact_email (email),
    INDEX idx_contact_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Forum Posts Table
CREATE TABLE forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('general', 'workout', 'nutrition', 'motivation', 'progress', 'question') NOT NULL DEFAULT 'general',
    is_pinned TINYINT(1) NOT NULL DEFAULT 0,
    is_locked TINYINT(1) NOT NULL DEFAULT 0,
    views_count INT NOT NULL DEFAULT 0,
    likes_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_forum_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Forum Replies Table
CREATE TABLE forum_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    likes_count INT NOT NULL DEFAULT 0,
    is_best_answer TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Badges Table
CREATE TABLE badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    icon VARCHAR(100) NULL,
    category ENUM('workout', 'nutrition', 'consistency', 'community', 'milestone') NOT NULL,
    requirement_type VARCHAR(100) NULL,
    requirement_value INT NULL,
    points INT NOT NULL DEFAULT 10,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Badges Table
CREATE TABLE user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_badge (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==========================================
-- SEED DATA
-- ==========================================

-- Default admin user (email: gapbodybuilder@gmail.com, password: Kgap@123)
-- bcrypt hash for 'Kgap@123'
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, email_verified, is_active)
VALUES (1, 'gapbodybuilder@gmail.com', '$2b$12$H0hFUtQTIc4wx5QbhTQrA.6h8B8f9R4IMqqq04titUqFloPGWKjdK', 'Gnaneswar', '', '+916309764875', 'admin', 1, 1);

INSERT INTO user_profiles (user_id, bio, instagram_handle)
VALUES (1, 'Founder and Head Coach at Gnaneswar Fitness. Professional Bodybuilder and Nutritionist.', 'gnaneswar_bb');

-- Seed Badges
INSERT INTO badges (id, name, description, icon, category, requirement_type, requirement_value, points) VALUES
(1, 'First Step', 'Log your first workout', 'FaDumbbell', 'workout', 'workout_count', 1, 10),
(2, 'Dedicated Athlete', 'Log 10 workouts', 'FaCrown', 'workout', 'workout_count', 10, 50),
(3, 'Calorie Tracker', 'Log meals for 7 consecutive days', 'FaUtensils', 'nutrition', 'meal_strike', 7, 30),
(4, 'Transformation Champion', 'Record weight drop of 5kg', 'FaChartLine', 'milestone', 'weight_loss', 5, 100);

-- Seed Blog Categories
INSERT INTO blog_categories (id, name, slug) VALUES
(1, 'Workout Tips', 'workout-tips'),
(2, 'Nutrition & Diet', 'nutrition-diet'),
(3, 'Motivation & Mindset', 'motivation-mindset');

-- Seed Blog Posts
INSERT INTO blog_posts (id, title, slug, content, excerpt, category_id, author_id, status, views_count, published_at) VALUES
(1, 'Top 5 Exercises for Peak Bicep Development', 'top-5-exercises-biceps', 'Building impressive biceps is a primary goal for many gym-goers. While the basic curl is effective, targeting both the long and short heads of the biceps requires a strategic selection of exercises. 1. Barbell Curls, 2. Incline Dumbbell Curls, 3. Preacher Curls, 4. Hammer Curls, 5. Concentration Curls. Combine these in your routine with proper volume and progressive overload to unlock massive growth.', 'Unlock maximum arm growth with these scientifically-backed exercises for bicep peaks.', 1, 1, 'published', 145, NOW()),
(2, 'The Importance of Macros in Muscle Building', 'importance-macros-muscle-building', 'When it comes to altering body composition, tracking macronutrients (proteins, carbs, and fats) is much more important than simply counting calories. Protein provides the building blocks for muscle tissue repairs. Carbohydrates replenish glycogen levels to fuel intense training sessions. Fats support healthy hormone levels, which are critical for recovery.', 'Why you need to track macros, not just calories, to achieve a lean, muscular physique.', 2, 1, 'published', 98, NOW());

-- Seed Exercises
INSERT INTO exercises (id, name, muscle_group, equipment, description, instructions, difficulty, calories_per_rep) VALUES
(1, 'Flat Bench Press', 'chest', 'Barbell, Bench', 'A core movement for chest size and pressing power.', 'Lie flat, grip bar slightly wider than shoulder width, lower to mid-chest, push back up.', 'intermediate', 0.25),
(2, 'Incline Dumbbell Press', 'chest', 'Dumbbells, Incline Bench', 'Targets the upper pectorals.', 'Sit on 30-45 degree incline, push dumbbells from shoulder level to straight overhead.', 'intermediate', 0.22),
(3, 'Barbell Squat', 'legs', 'Barbell, Squat Rack', 'The king of all leg movements, builds quads, glutes, and hamstrings.', 'Rest bar on traps, stand shoulder width, bend knees and hips to lower down, stand back up.', 'advanced', 0.4),
(4, 'Pull-Ups', 'back', 'Pull-Up Bar', 'Builds lat width and upper back strength.', 'Hang with overhand grip, pull chest to bar, lower slowly under control.', 'intermediate', 0.3),
(5, 'Dumbbell Bicep Curl', 'arms', 'Dumbbells', 'Classic bicep isolation exercise.', 'Keep elbows close to torso, curl weight while rotating wrists outwards.', 'beginner', 0.1);

-- Seed Workout Programs
INSERT INTO workout_programs (id, name, description, difficulty, duration_weeks, goal, is_active, created_by) VALUES
(1, '4-Week Hypertrophy Starter', 'A classic upper/lower split designed to build muscle mass and increase strength.', 'intermediate', 4, 'muscle_gain', 1, 1);

-- Seed Workout Days
INSERT INTO workout_days (id, program_id, day_number, name, focus_area, notes) VALUES
(1, 1, 1, 'Day 1: Upper Body Power', 'Chest, Back, Shoulders, Arms', 'Focus on control and progressive overload.'),
(2, 1, 2, 'Day 2: Lower Body Power', 'Quads, Hamstrings, Calves', 'Ensure full depth on squats.');

-- Seed Workout Exercises
INSERT INTO workout_exercises (id, workout_day_id, exercise_id, sets, reps, rest_seconds, order_index) VALUES
(1, 1, 1, 4, '6-8', 120, 1),
(2, 1, 4, 4, '8-10', 90, 2),
(3, 1, 2, 3, '10-12', 90, 3),
(4, 1, 5, 3, '12', 60, 4),
(5, 2, 3, 4, '6-8', 150, 1);

-- Seed Nutrition Plans
INSERT INTO nutrition_plans (id, name, description, goal, daily_calories, protein_grams, carbs_grams, fat_grams, diet_type, is_active, created_by) VALUES
(1, 'Clean Bulk Plan 3000', 'Designed for optimal muscle gain with minimal fat accumulation.', 'muscle_gain', 3000, 180.0, 380.0, 80.0, 'non_vegetarian', 1, 1);

-- Seed Meals
INSERT INTO meals (plan_id, meal_type, meal_order, name, description, foods, calories, protein_grams, carbs_grams, fat_grams, time_suggestion) VALUES
(1, 'breakfast', 0, 'Breakfast Oats & Eggs', '100g Rolled Oats, 1 Banana, 4 Whole Eggs', 'Oats, Banana, Eggs', 750, 40.0, 85.0, 25.0, '08:00 AM'),
(1, 'lunch', 1, 'Post-Workout Chicken & Rice', '200g Chicken Breast, 150g Jasmine Rice, Broccoli', 'Chicken, Rice, Broccoli', 800, 60.0, 110.0, 10.0, '01:00 PM'),
(1, 'dinner', 2, 'Dinner Beef & Sweet Potato', '200g Lean Beef, 200g Sweet Potato, Asparagus', 'Beef, Sweet Potato, Asparagus', 850, 50.0, 95.0, 25.0, '08:00 PM'),
(1, 'evening_snack', 3, 'Pre-Bed Casein & Almonds', '1 Scoop Casein Protein, 30g Almonds', 'Casein, Almonds', 600, 30.0, 90.0, 20.0, '10:30 PM');

-- Seed Time Slots
INSERT INTO time_slots (id, day_of_week, start_time, end_time, slot_type, max_bookings, is_active) VALUES
(1, 0, '09:00:00', '10:00:00', 'consultation', 1, 1),
(2, 0, '10:00:00', '11:00:00', 'training', 2, 1),
(3, 1, '14:00:00', '15:00:00', 'training', 1, 1),
(4, 2, '16:00:00', '17:00:00', 'assessment', 1, 1);

-- Seed Testimonials
INSERT INTO testimonials (id, client_name, content, rating, program_name, is_featured, is_approved, display_order) VALUES
(1, 'Vikram Reddy', 'In 4 months, I lost 18 kg and gained more energy than I\'ve had in a decade. Gnaneswar\'s approach is methodical, motivating, and genuinely life-changing.', 5, 'Premium Coaching', 1, 1, 1),
(2, 'Sneha Patel', 'The nutrition plan alone was worth every rupee. I\'m eating more than ever, looking better than ever, and my business performance has skyrocketed.', 5, 'Elite Coaching', 1, 1, 2),
(3, 'Karthik Nair', 'Took 1st place in my weight class after just one prep cycle with GFP. The peak-week protocol was absolutely flawless.', 5, 'Competition Prep', 1, 1, 3);

-- Seed Transformation Photos
INSERT INTO transformation_photos (id, client_name, before_image, after_image, duration_weeks, weight_lost_kg, muscle_gained_kg, description, program_followed, is_featured, is_approved, display_order) VALUES
(1, 'Rahul M.', '/media1.jpg', '/media1.jpg', 16, 22.0, 0.0, 'Gnaneswar didn\'t just change my body — he rewired my entire relationship with food and fitness.', 'Starter Program', 1, 1, 1),
(2, 'Priya S.', '/media2.jpg', '/media2.jpg', 12, 0.0, 8.0, 'I went from "I can\'t do a pull-up" to competing in my first powerlifting meet. Unreal transformation.', 'Premium Coaching', 1, 1, 2),
(3, 'Arjun K.', '/media3.jpg', '/media3.jpg', 20, 30.0, 0.0, 'Lost 30 kg and found a version of myself I didn\'t know existed. This program is life-changing.', 'Elite Coaching', 1, 1, 3);
