import { Component, OnInit } from '@angular/core';
import { GamificationService } from '../../services/gamification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-water-tracker',
  template: `
    <div class="water-card">
      <div class="water-header">
        <span class="water-icon">💧</span>
        <span class="water-title">Hydration</span>
        <div class="header-actions">
           <span class="water-count">{{ waterIntake }}/{{ goal }}</span>
           <button mat-icon-button (click)="resetWater()" class="refresh-btn" matTooltip="Reset Daily Water">
             <mat-icon>refresh</mat-icon>
           </button>
        </div>
      </div>
      
      <div class="glasses-grid">
        <div 
          *ngFor="let glass of glasses; let i = index"
          class="glass"
          [class.filled]="i < waterIntake"
          [class.next]="i === waterIntake"
          (click)="addWater()">
          <span class="glass-icon">{{ i < waterIntake ? '💧' : '🥛' }}</span>
        </div>
      </div>

      <div class="water-progress">
        <div class="progress-fill" [style.width.%]="(waterIntake / goal) * 100"></div>
      </div>

      <p class="water-tip" *ngIf="waterIntake < goal">
        {{ goal - waterIntake }} more glasses to go!
      </p>
      <p class="water-complete" *ngIf="waterIntake >= goal">
        🎉 Goal reached! Great hydration!
      </p>
    </div>
  `,
  styles: [`
    .water-card {
      background: linear-gradient(145deg, rgba(0, 180, 216, 0.1), rgba(0, 100, 150, 0.15));
      border: 1px solid rgba(0, 180, 216, 0.25);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .water-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
    }

    .water-icon {
      font-size: 24px;
    }

    .water-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .water-count {
      font-size: 18px;
      font-weight: 700;
      color: #00b4d8;
    }

    .refresh-btn {
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
    }

    .refresh-btn:hover {
      color: #00b4d8;
      transform: rotate(180deg);
    }

    .glasses-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 8px;
      margin-bottom: 15px;
    }

    .glass {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 20px;
    }

    .glass:hover {
      transform: scale(1.1);
      background: rgba(0, 180, 216, 0.2);
    }

    .glass.filled {
      background: rgba(0, 180, 216, 0.3);
      animation: fillPop 0.3s ease;
    }

    .glass.next {
      animation: pulse 1.5s ease-in-out infinite;
      border: 1px dashed rgba(0, 180, 216, 0.5);
    }

    @keyframes fillPop {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .water-progress {
      height: 6px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00b4d8, #39ff14);
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .water-tip {
      text-align: center;
      color: #6b7a8f;
      font-size: 13px;
      margin: 0;
    }

    .water-complete {
      text-align: center;
      color: #39ff14;
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }
  `]
})
export class WaterTrackerComponent implements OnInit {
  waterIntake = 0;
  goal = 8;
  glasses = Array(8).fill(0);

  constructor(
    private gamificationService: GamificationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadWater();
  }

  loadWater(): void {
    this.gamificationService.getWaterIntake().subscribe({
      next: (data) => {
        this.waterIntake = data.water_intake;
        this.goal = data.goal;
      },
      error: (err) => console.error('Error loading water:', err)
    });
  }

  addWater(): void {
    if (this.waterIntake < this.goal) {
      this.gamificationService.addWater().subscribe({
        next: (data) => {
          this.waterIntake = data.water_intake;
        },
        error: (err) => console.error('Error adding water:', err)
      });
    }
  }

  resetWater(): void {
    const snackBarRef = this.snackBar.open('💧 Reset your Hydration Energy, Warrior?', '🔥 RESET', {
      duration: 5000,
      panelClass: ['dbz-snackbar']
    });

    snackBarRef.onAction().subscribe(() => {
      this.gamificationService.resetWater().subscribe({
        next: () => {
          this.waterIntake = 0;
          this.snackBar.open('⚡ Ki Energy Restored! Train harder!', '', { duration: 2000, panelClass: ['dbz-snackbar'] });
        },
        error: (err) => console.error('Error resetting water:', err)
      });
    });
  }
}
