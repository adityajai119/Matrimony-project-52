import { Component, OnInit } from '@angular/core';
import { GamificationService } from '../../services/gamification.service';

@Component({
    selector: 'app-daily-challenge',
    template: `
    <div class="challenge-card" *ngIf="challenge" [class.completed]="challenge.completed">
      <div class="challenge-header">
        <div class="challenge-icon">🎯</div>
        <div class="challenge-title">Daily Challenge</div>
        <div class="xp-badge">+{{ challenge.xp_reward }} XP</div>
      </div>
      
      <p class="challenge-text">{{ challenge.challenge_text }}</p>
      
      <button 
        class="complete-btn" 
        *ngIf="!challenge.completed"
        (click)="completeChallenge()"
        [disabled]="completing">
        <span *ngIf="!completing">Complete Challenge</span>
        <span *ngIf="completing">Completing...</span>
      </button>

      <div class="completed-banner" *ngIf="challenge.completed">
        <span>✅ Completed!</span>
      </div>
    </div>
  `,
    styles: [`
    .challenge-card {
      background: linear-gradient(145deg, rgba(0, 180, 216, 0.15), rgba(57, 255, 20, 0.1));
      border: 1px solid rgba(0, 180, 216, 0.3);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .challenge-card.completed {
      opacity: 0.7;
      border-color: rgba(57, 255, 20, 0.5);
    }

    .challenge-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
    }

    .challenge-icon {
      font-size: 28px;
    }

    .challenge-title {
      flex: 1;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .xp-badge {
      background: linear-gradient(135deg, #ff6b35, #ffd700);
      color: #000;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }

    .challenge-text {
      color: #b8c5d9;
      font-size: 18px;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .complete-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #00b4d8, #39ff14);
      border: none;
      border-radius: 12px;
      color: #000;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .complete-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(0, 180, 216, 0.5);
    }

    .complete-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .completed-banner {
      text-align: center;
      padding: 14px;
      background: rgba(57, 255, 20, 0.2);
      border-radius: 12px;
      color: #39ff14;
      font-weight: 600;
      font-size: 16px;
    }
  `]
})
export class DailyChallengeComponent implements OnInit {
    challenge: any = null;
    completing = false;

    constructor(private gamificationService: GamificationService) { }

    ngOnInit(): void {
        this.loadChallenge();
    }

    loadChallenge(): void {
        this.gamificationService.getDailyChallenge().subscribe({
            next: (data) => {
                this.challenge = data;
            },
            error: (err) => console.error('Error loading challenge:', err)
        });
    }

    completeChallenge(): void {
        this.completing = true;
        this.gamificationService.completeChallenge().subscribe({
            next: (data) => {
                this.challenge.completed = true;
                this.completing = false;
                // Could trigger a power-up animation here
            },
            error: (err) => {
                console.error('Error completing challenge:', err);
                this.completing = false;
            }
        });
    }
}
