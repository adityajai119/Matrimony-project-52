import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GamificationService {
    private apiUrl = 'http://localhost:3000/api/game';

    constructor(private http: HttpClient) { }

    // Power Level
    getPowerLevel(): Observable<any> {
        return this.http.get(`${this.apiUrl}/power-level`);
    }

    addXP(xp_amount: number, reason: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/add-xp`, { xp_amount, reason });
    }

    // Achievements
    getAchievements(): Observable<any> {
        return this.http.get(`${this.apiUrl}/achievements`);
    }

    unlockAchievement(badge_type: string, badge_name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/achievements/unlock`, { badge_type, badge_name });
    }

    // Daily Challenge
    getDailyChallenge(): Observable<any> {
        return this.http.get(`${this.apiUrl}/daily-challenge`);
    }

    completeChallenge(): Observable<any> {
        return this.http.post(`${this.apiUrl}/daily-challenge/complete`, {});
    }

    // Water Tracker
    getWaterIntake(): Observable<any> {
        return this.http.get(`${this.apiUrl}/water`);
    }

    addWater(): Observable<any> {
        return this.http.post(`${this.apiUrl}/water/add`, {});
    }

    resetWater(): Observable<any> {
        return this.http.post(`${this.apiUrl}/water/reset`, {});
    }

    // Weight/Stats
    logWeight(weight: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/weight/log`, { weight });
    }

    getWeightHistory(): Observable<any> {
        return this.http.get(`${this.apiUrl}/weight/history`);
    }

    // Leaderboard
    getLeaderboard(): Observable<any> {
        return this.http.get(`${this.apiUrl}/leaderboard`);
    }
}
