import { Component, OnInit } from '@angular/core';
import { GamificationService } from '../../services/gamification.service';

@Component({
    selector: 'app-streak-saver',
    template: `
    <div class="streak-saver-card">
      <div class="saver-header">
        <span class="saver-icon">🛡️</span>
        <span class="saver-title">Streak Shield</span>
      </div>

      <div class="shields-display">
        <div class="shield-info">
          <span class="shield-count">{{ shields }}</span>
          <span class="shield-label">Shields Available</span>
        </div>
        <div class="shield-icons">
          <span *ngFor="let s of shieldArray; let i = index" 
                class="shield-icon" 
                [class.active]="i < shields">🛡️</span>
        </div>
      </div>

      <p class="saver-description">
        Shields protect your streak if you miss a day. Get 1 free shield per month, or buy more with XP!
      </p>

      <div class="buy-section" *ngIf="shields < 3">
        <button class="buy-btn" (click)="buyShield()" [disabled]="buying || xpBalance < 500">
          <span class="xp-cost">500 XP</span>
          <span>Buy Shield</span>
        </button>
        <p class="xp-balance">Your XP: {{ xpBalance }}</p>
      </div>

      <div class="max-shields" *ngIf="shields >= 3">
        <mat-icon>check_circle</mat-icon>
        <span>Maximum shields reached!</span>
      </div>

      <div class="shield-history" *ngIf="lastUsed">
        <mat-icon>history</mat-icon>
        <span>Last used: {{ lastUsed | date:'mediumDate' }}</span>
      </div>
    </div>
  `,
    styles: [`
    .streak-saver-card {
      background: linear-gradient(145deg, rgba(155, 89, 182, 0.15), rgba(142, 68, 173, 0.1));
      border: 1px solid rgba(155, 89, 182, 0.3);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .saver-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .saver-icon {
      font-size: 28px;
    }

    .saver-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .shields-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .shield-info {
      display: flex;
      flex-direction: column;
    }

    .shield-count {
      font-size: 36px;
      font-weight: 800;
      color: #9b59b6;
    }

    .shield-label {
      font-size: 12px;
      color: #6b7a8f;
    }

    .shield-icons {
      display: flex;
      gap: 5px;
    }

    .shield-icon {
      font-size: 28px;
      opacity: 0.2;
      filter: grayscale(100%);
      transition: all 0.3s ease;
    }

    .shield-icon.active {
      opacity: 1;
      filter: grayscale(0%);
      animation: shieldPulse 2s ease-in-out infinite;
    }

    @keyframes shieldPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .saver-description {
      font-size: 13px;
      color: #6b7a8f;
      line-height: 1.5;
      margin-bottom: 15px;
    }

    .buy-section {
      text-align: center;
    }

    .buy-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #9b59b6, #8e44ad);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .buy-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(155, 89, 182, 0.5);
    }

    .buy-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .xp-cost {
      font-size: 20px;
      font-weight: 800;
    }

    .xp-balance {
      font-size: 12px;
      color: #6b7a8f;
      margin-top: 10px;
    }

    .max-shields {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #39ff14;
      font-weight: 600;
    }

    .shield-history {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      margin-top: 15px;
      font-size: 12px;
      color: #6b7a8f;
    }

    .shield-history mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class StreakSaverComponent implements OnInit {
    shields = 1;
    xpBalance = 0;
    buying = false;
    lastUsed: Date | null = null;
    shieldArray = [0, 1, 2];

    constructor(private gamificationService: GamificationService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.gamificationService.getPowerLevel().subscribe({
            next: (data) => {
                this.xpBalance = data.xp_points;
            }
        });
        // In a real app, load shields from backend
        const savedShields = localStorage.getItem('streakShields');
        this.shields = savedShields ? parseInt(savedShields) : 1;
    }

    buyShield(): void {
        if (this.xpBalance < 500 || this.shields >= 3) return;

        this.buying = true;
        // In real app, call backend API
        setTimeout(() => {
            this.shields++;
            this.xpBalance -= 500;
            localStorage.setItem('streakShields', this.shields.toString());
            this.buying = false;
        }, 1000);
    }
}
