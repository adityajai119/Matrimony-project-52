import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AIService {
    private apiUrl = 'http://localhost:3000/api/ai';

    constructor(private http: HttpClient) { }

    chat(message: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/chat`, { message });
    }

    generateWorkout(type: 'gym' | 'home'): Observable<any> {
        return this.http.post(`${this.apiUrl}/generate-workout`, { type });
    }

    generateMealPlan(): Observable<any> {
        return this.http.post(`${this.apiUrl}/generate-meal`, {});
    }

    swapMeal(currentMeal: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/swap-meal`, { currentMeal });
    }

    getHealthAnalysis(): Observable<any> {
        return this.http.get(`${this.apiUrl}/analysis`);
    }

    updateFatigue(level: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/fatigue`, { level });
    }

    getGroceryList(day: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/grocery-list/${day}`);
    }

    getPlaylistRecommendation(workoutType: string, mood: string, fatigueLevel: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/playlist`, { workoutType, mood, fatigueLevel });
    }

    parseVoiceIntent(transcript: string, currentPlaylist: any[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/voice-intent`, { transcript, currentPlaylist });
    }
}
