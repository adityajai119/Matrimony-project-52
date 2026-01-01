import { Component, OnInit } from '@angular/core';
import { GamificationService } from '../../services/gamification.service';

@Component({
    selector: 'app-leaderboard',
    template: `
    <div class="leaderboard-card">
      <div class="leaderboard-header">
        <span class="leaderboard-icon">👑</span>
        <span class="leaderboard-title">Leaderboard</span>
      </div>
      
      <div class="leaderboard-list">
        <div 
          *ngFor="let user of leaderboard"
          class="leaderboard-item"
          [class.current-user]="user.is_current_user"
          [class.top-three]="user.rank <= 3">
          
          <div class="rank">
            <span *ngIf="user.rank === 1">🥇</span>
            <span *ngIf="user.rank === 2">🥈</span>
            <span *ngIf="user.rank === 3">🥉</span>
            <span *ngIf="user.rank > 3">#{{ user.rank }}</span>
          </div>
          
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-title">{{ user.title }}</span>
          </div>
          
          <div class="user-power">
            <span class="power-value">{{ user.power_level }}</span>
            <span class="power-label">PWR</span>
          </div>
        </div>
      </div>

      <div class="your-rank" *ngIf="currentUserRank > 10">
        Your Rank: #{{ currentUserRank }}
      </div>
    </div>
  `,
    styles: [`
    .leaderboard-card {
      background: var(--bg-card);
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .leaderboard-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .leaderboard-icon {
      font-size: 24px;
    }

    .leaderboard-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .leaderboard-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .leaderboard-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .leaderboard-item.current-user {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 215, 0, 0.15));
      border: 1px solid rgba(255, 107, 53, 0.3);
    }

    .leaderboard-item.top-three {
      border-left: 3px solid #ffd700;
    }

    .rank {
      width: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      color: #ffd700;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    .user-title {
      font-size: 11px;
      color: #6b7a8f;
      text-transform: uppercase;
    }

    .user-power {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .power-value {
      font-size: 20px;
      font-weight: 800;
      color: #ff6b35;
    }

    .power-label {
      font-size: 10px;
      color: #6b7a8f;
      text-transform: uppercase;
    }

    .your-rank {
      text-align: center;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: #b8c5d9;
      font-size: 14px;
    }
  `]
})
export class LeaderboardComponent implements OnInit {
    leaderboard: any[] = [];
    currentUserRank = 0;

    constructor(private gamificationService: GamificationService) { }

    ngOnInit(): void {
        this.loadLeaderboard();
    }

    loadLeaderboard(): void {
        this.gamificationService.getLeaderboard().subscribe({
            next: (data) => {
                this.leaderboard = data.leaderboard;
                this.currentUserRank = data.current_user_rank;
            },
            error: (err) => console.error('Error loading leaderboard:', err)
        });
    }
}
