import { Component, OnInit } from '@angular/core';
import { GamificationService } from '../../services/gamification.service';

@Component({
    selector: 'app-power-level',
    template: `
    <div class="power-level-card" *ngIf="powerData">
      <div class="power-header">
        <div class="power-icon">⚡</div>
        <div class="power-info">
          <span class="power-title">{{ powerData.title }}</span>
          <span class="power-label">Power Level</span>
        </div>
        <div class="power-number">{{ powerData.power_level }}</div>
      </div>
      
      <div class="xp-section">
        <div class="xp-bar">
          <div class="xp-fill" [style.width.%]="powerData.xp_progress_percent"></div>
          <div class="xp-glow"></div>
        </div>
        <div class="xp-text">
          <span>{{ powerData.xp_points }} XP</span>
          <span>Next: {{ powerData.xp_for_next_level }} XP</span>
        </div>
      </div>

      <!-- Progress % (kept as requested) -->
      <div class="progress-section" *ngIf="progressPercent !== null">
        <span class="progress-label">Weekly Progress</span>
        <span class="progress-value">{{ progressPercent }}%</span>
      </div>
    </div>
  `,
    styles: [`
    .power-level-card {
      background: linear-gradient(145deg, rgba(255, 107, 53, 0.15), rgba(255, 215, 0, 0.1));
      border: 1px solid rgba(255, 107, 53, 0.3);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
    }

    .power-level-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
      animation: rotate 10s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .power-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    .power-icon {
      font-size: 40px;
      filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .power-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .power-title {
      font-size: 22px;
      font-weight: 700;
      background: linear-gradient(135deg, #ff6b35, #ffd700);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .power-label {
      font-size: 12px;
      color: #b8c5d9;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .power-number {
      font-size: 48px;
      font-weight: 800;
      color: #ffd700;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    .xp-section {
      position: relative;
      z-index: 1;
    }

    .xp-bar {
      height: 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }

    .xp-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff6b35, #ffd700);
      border-radius: 6px;
      transition: width 0.5s ease;
      position: relative;
    }

    .xp-glow {
      position: absolute;
      top: 0;
      right: 0;
      width: 20px;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5));
      animation: shimmer 2s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%, 100% { opacity: 0; transform: translateX(-20px); }
      50% { opacity: 1; transform: translateX(0); }
    }

    .xp-text {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      color: #b8c5d9;
    }

    .progress-section {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 1;
    }

    .progress-label {
      color: #b8c5d9;
      font-size: 14px;
    }

    .progress-value {
      color: #00b4d8;
      font-weight: 600;
      font-size: 14px;
    }
  `]
})
export class PowerLevelComponent implements OnInit {
    powerData: any = null;
    progressPercent: number | null = null;

    constructor(private gamificationService: GamificationService) { }

    ngOnInit(): void {
        this.loadPowerLevel();
    }

    loadPowerLevel(): void {
        this.gamificationService.getPowerLevel().subscribe({
            next: (data) => {
                this.powerData = data;
            },
            error: (err) => console.error('Error loading power level:', err)
        });
    }

    setProgressPercent(percent: number): void {
        this.progressPercent = percent;
    }
}
