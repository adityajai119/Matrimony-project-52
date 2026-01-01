import { Component, OnInit } from '@angular/core';
import { GamificationService } from '../../services/gamification.service';

@Component({
    selector: 'app-achievement-badges',
    template: `
    <div class="badges-card">
      <div class="badges-header">
        <span class="badges-icon">🏆</span>
        <span class="badges-title">Achievements</span>
        <span class="badges-count">{{ unlockedCount }}/{{ badges.length }}</span>
      </div>
      
      <div class="badges-grid">
        <div 
          *ngFor="let badge of badges"
          class="badge"
          [class.unlocked]="badge.unlocked"
          [title]="badge.description">
          <mat-icon class="badge-mat-icon">{{ badge.icon }}</mat-icon>
          <span class="badge-name">{{ badge.name }}</span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .badges-card {
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .badges-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .badges-icon {
      font-size: 24px;
    }

    .badges-title {
      flex: 1;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .badges-count {
      font-size: 14px;
      color: #ffd700;
      font-weight: 600;
    }

    .badges-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }

    .badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      opacity: 0.4;
      filter: grayscale(100%);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .badge.unlocked {
      opacity: 1;
      filter: grayscale(0%);
      background: linear-gradient(145deg, rgba(255, 215, 0, 0.2), rgba(255, 107, 53, 0.15));
      border: 1px solid rgba(255, 215, 0, 0.3);
      animation: badgeGlow 2s ease-in-out infinite;
    }

    @keyframes badgeGlow {
      0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
      50% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
    }

    .badge:hover {
      transform: scale(1.05);
    }

    .badge-mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #ffd700;
    }

    .badge-name {
      font-size: 10px;
      color: #b8c5d9;
      text-align: center;
      line-height: 1.2;
    }

    .badge.unlocked .badge-name {
      color: #fff;
    }

    @media (max-width: 768px) {
      .badges-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `]
})
export class AchievementBadgesComponent implements OnInit {
    badges: any[] = [];
    unlockedCount = 0;

    constructor(private gamificationService: GamificationService) { }

    ngOnInit(): void {
        this.loadAchievements();
    }

    loadAchievements(): void {
        this.gamificationService.getAchievements().subscribe({
            next: (data) => {
                this.badges = data;
                this.unlockedCount = data.filter((b: any) => b.unlocked).length;
            },
            error: (err) => console.error('Error loading achievements:', err)
        });
    }
}
