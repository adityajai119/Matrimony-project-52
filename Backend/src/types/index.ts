export interface User {
  id?: number;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: 'weight loss' | 'muscle gain' | 'maintenance';
  email: string;
  password?: string;
  role?: 'user' | 'trainer' | 'admin';
  created_at?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  instructions: string;
}

export interface Meal {
  name: string;
  calories: number;
  description: string;
}

export interface DailyMeals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
  totalCalories: number;
}

export interface CompletedStatus {
  exercises: { [key: string]: boolean };
  meals: { [key: string]: boolean };
}

export interface WorkoutMealPlan {
  id?: number;
  user_id: number;
  day: string;
  exercises: Exercise[];
  meals: DailyMeals;
  completed_status: CompletedStatus;
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: 'weight loss' | 'muscle gain' | 'maintenance';
  email: string;
  password: string;
}

