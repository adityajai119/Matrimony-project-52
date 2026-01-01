import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-smart-rest',
    template: `
    <div class="rest-card" [class.needs-rest]="needsRest">
      <div class="rest-header">
        <span class="rest-icon">{{ needsRest ? '😴' : '💪' }}</span>
        <span class="rest-title">Smart Recovery</span>
      </div>

      <div class="fatigue-meter">
        <div class="meter-label">Fatigue Level</div>
        <div class="meter-bar">
          <div class="meter-fill" [style.width.%]="fatigueLevel" [class.high]="fatigueLevel > 70"></div>
        </div>
        <div class="meter-labels">
          <span>Fresh</span>
          <span>Tired</span>
          <span>Exhausted</span>
        </div>
      </div>

      <div class="recommendation" *ngIf="recommendation">
        <mat-icon>{{ recommendation.icon }}</mat-icon>
        <div class="rec-content">
          <h4>{{ recommendation.title }}</h4>
          <p>{{ recommendation.description }}</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat">
          <span class="stat-value">{{ workoutsThisWeek }}</span>
          <span class="stat-label">Workouts This Week</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ restDays }}</span>
          <span class="stat-label">Rest Days Taken</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ avgSleep }}h</span>
          <span class="stat-label">Avg Sleep</span>
        </div>
      </div>

      <div class="sleep-tracker" *ngIf="showSleepTracker">
        <h4>Log Last Night's Sleep</h4>
        <div class="sleep-input">
          <button *ngFor="let h of sleepHours" 
                  class="sleep-btn" 
                  [class.selected]="lastNightSleep === h"
                  (click)="logSleep(h)">
            {{ h }}h
          </button>
        </div>
      </div>

      <button class="toggle-sleep-btn" (click)="showSleepTracker = !showSleepTracker">
        <mat-icon>bedtime</mat-icon>
        {{ showSleepTracker ? 'Hide' : 'Log Sleep' }}
      </button>
    </div>
  `,
    styles: [`
    .rest-card {
      background: linear-gradient(145deg, rgba(0, 150, 136, 0.1), rgba(0, 100, 100, 0.15));
      border: 1px solid rgba(0, 150, 136, 0.25);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }

    .rest-card.needs-rest {
      border-color: rgba(239, 35, 60, 0.4);
      background: linear-gradient(145deg, rgba(239, 35, 60, 0.1), rgba(150, 20, 40, 0.15));
    }

    .rest-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .rest-icon {
      font-size: 28px;
    }

    .rest-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .fatigue-meter {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .meter-label {
      font-size: 12px;
      color: #6b7a8f;
      margin-bottom: 8px;
    }

    .meter-bar {
      height: 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      overflow: hidden;
    }

    .meter-fill {
      height: 100%;
      background: linear-gradient(90deg, #39ff14, #ffd700);
      border-radius: 6px;
      transition: width 0.5s ease;
    }

    .meter-fill.high {
      background: linear-gradient(90deg, #ffd700, #ef233c);
    }

    .meter-labels {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #6b7a8f;
      margin-top: 5px;
    }

    .recommendation {
      display: flex;
      gap: 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .recommendation mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #00bcd4;
    }

    .rec-content h4 {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 5px 0;
    }

    .rec-content p {
      font-size: 12px;
      color: #6b7a8f;
      margin: 0;
      line-height: 1.4;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }

    .stat {
      text-align: center;
      padding: 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 800;
      color: #00bcd4;
    }

    .stat-label {
      font-size: 10px;
      color: #6b7a8f;
    }

    .sleep-tracker {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .sleep-tracker h4 {
      font-size: 14px;
      color: #fff;
      margin: 0 0 10px 0;
    }

    .sleep-input {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .sleep-btn {
      padding: 8px 14px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #6b7a8f;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .sleep-btn.selected {
      background: rgba(0, 188, 212, 0.2);
      border-color: rgba(0, 188, 212, 0.5);
      color: #00bcd4;
    }

    .toggle-sleep-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.2);
      border: none;
      border-radius: 10px;
      color: #6b7a8f;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toggle-sleep-btn:hover {
      background: rgba(0, 188, 212, 0.1);
      color: #00bcd4;
    }
  `]
})
export class SmartRestComponent implements OnInit {
    @Input() fatigueLevel: number = 40;
    @Input() workoutsThisWeek: number = 4;
    @Input() restDays: number = 1;

    avgSleep = 7;
    lastNightSleep = 7;
    showSleepTracker = false;
    sleepHours = [4, 5, 6, 7, 8, 9, 10];

    recommendation: { icon: string; title: string; description: string } | null = null;

    get needsRest(): boolean {
        return this.fatigueLevel > 70 || (this.workoutsThisWeek >= 6 && this.restDays === 0);
    }

    ngOnInit(): void {
        this.calculateRecommendation();
    }

    calculateRecommendation(): void {
        if (this.fatigueLevel > 80) {
            this.recommendation = {
                icon: 'self_improvement',
                title: 'Take a Rest Day',
                description: 'Your body needs recovery. Consider yoga or light stretching today.'
            };
        } else if (this.fatigueLevel > 60) {
            this.recommendation = {
                icon: 'directions_walk',
                title: 'Light Activity Recommended',
                description: 'Go for a walk or do a low-intensity workout to aid recovery.'
            };
        } else if (this.avgSleep < 6) {
            this.recommendation = {
                icon: 'bedtime',
                title: 'Get More Sleep',
                description: 'Sleep is crucial for muscle recovery. Aim for 7-8 hours tonight.'
            };
        } else if (this.workoutsThisWeek >= 5 && this.restDays === 0) {
            this.recommendation = {
                icon: 'event_busy',
                title: 'Schedule a Rest Day',
                description: 'You\'ve been training hard! Take a day off to prevent burnout.'
            };
        } else {
            this.recommendation = {
                icon: 'fitness_center',
                title: 'Ready to Train!',
                description: 'Your recovery looks good. Time for a solid workout!'
            };
        }
    }

    logSleep(hours: number): void {
        this.lastNightSleep = hours;
        this.avgSleep = Math.round((this.avgSleep * 6 + hours) / 7);
        this.calculateRecommendation();
        // In real app, save to backend
    }
}
