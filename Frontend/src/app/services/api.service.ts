import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  // Auth
  googleLogin(token: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/google-login`, { token });
  }

  googleRegister(data: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/google-register`, data);
  }

  // OTP Verification
  sendOtp(data: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/send-otp`, data);
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/verify-otp`, { email, otp });
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/resend-otp`, { email });
  }

  // Profile
  getProfile(): Observable<any> {
    return this.http.get(`${API_URL}/profile`);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${API_URL}/profile`, profileData);
  }

  getActivityLog(): Observable<any> {
    return this.http.get(`${API_URL}/profile/activity-log`);
  }

  sendProgressEmail(): Observable<any> {
    return this.http.post(`${API_URL}/profile/email-progress`, {});
  }

  // Workouts
  getWorkouts(): Observable<any> {
    return this.http.get(`${API_URL}/workouts`);
  }

  getWorkoutByDay(day: string): Observable<any> {
    return this.http.get(`${API_URL}/workouts/${day}`);
  }

  updateExerciseStatus(day: string, exerciseIndex: number, completed: boolean): Observable<any> {
    return this.http.patch(`${API_URL}/workouts/${day}/exercises/${exerciseIndex}`, { completed });
  }

  // Update workout status
  updateWorkoutStatus(id: number, status: any): Observable<any> {
    return this.http.put(`${API_URL}/workouts/${id}/status`, status);
  }

  // Update full workout (e.g. after AI regen)
  updateWorkout(day: string, exercises: any[]): Observable<any> {
    return this.http.put(`${API_URL}/workouts/${day}`, { exercises });
  }

  // Meals
  getMeals(): Observable<any> {
    return this.http.get(`${API_URL}/meals`);
  }

  getMealByDay(day: string): Observable<any> {
    return this.http.get(`${API_URL}/meals/${day}`);
  }

  updateMealStatus(day: string, mealType: string, completed: boolean, snackIndex?: number): Observable<any> {
    const body: any = { completed };
    if (mealType === 'snack' && snackIndex !== undefined) {
      body.snackIndex = snackIndex;
    }
    return this.http.patch(`${API_URL}/meals/${day}/meals/${mealType}`, body);
  }

  // Progress
  getProgress(): Observable<any> {
    return this.http.get(`${API_URL}/progress`);
  }

  // AI Food Analysis
  analyzeFood(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${API_URL}/ai/analyze-food`, formData);
  }
}

