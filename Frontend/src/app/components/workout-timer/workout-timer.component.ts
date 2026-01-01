import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-workout-timer',
    template: `
    <div class="timer-card" [class.active]="isRunning" [class.rest]="isResting">
      <div class="timer-header">
        <span class="timer-icon">{{ isResting ? '😤' : '⏱️' }}</span>
        <span class="timer-title">{{ isResting ? 'REST TIME' : 'Workout Timer' }}</span>
      </div>

      <div class="timer-display">
        <span class="time-value">{{ formatTime(currentTime) }}</span>
      </div>

      <div class="timer-controls">
        <button class="control-btn start" *ngIf="!isRunning" (click)="startTimer()">
          <mat-icon>play_arrow</mat-icon>
          Start
        </button>
        <button class="control-btn pause" *ngIf="isRunning" (click)="pauseTimer()">
          <mat-icon>pause</mat-icon>
          Pause
        </button>
        <button class="control-btn reset" (click)="resetTimer()">
          <mat-icon>refresh</mat-icon>
          Reset
        </button>
      </div>

      <div class="rest-presets">
        <span class="preset-label">Quick Rest:</span>
        <button class="preset-btn" (click)="startRest(30)">30s</button>
        <button class="preset-btn" (click)="startRest(60)">60s</button>
        <button class="preset-btn" (click)="startRest(90)">90s</button>
      </div>
    </div>
  `,
    styles: [`
    .timer-card {
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }

    .timer-card.active {
      border-color: rgba(255, 107, 53, 0.5);
      box-shadow: 0 0 20px rgba(255, 107, 53, 0.2);
    }

    .timer-card.rest {
      border-color: rgba(0, 180, 216, 0.5);
      background: linear-gradient(145deg, rgba(0, 180, 216, 0.1), rgba(0, 100, 150, 0.15));
    }

    .timer-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .timer-icon {
      font-size: 24px;
    }

    .timer-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .timer-display {
      text-align: center;
      margin: 20px 0;
    }

    .time-value {
      font-size: 64px;
      font-weight: 800;
      font-family: 'Courier New', monospace;
      color: #fff;
      text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
    }

    .timer-card.rest .time-value {
      color: #00b4d8;
      text-shadow: 0 0 20px rgba(0, 180, 216, 0.5);
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .timer-controls {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 20px;
    }

    .control-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .control-btn.start {
      background: linear-gradient(135deg, #39ff14, #00b4d8);
      color: #000;
    }

    .control-btn.pause {
      background: linear-gradient(135deg, #ff6b35, #ffd700);
      color: #000;
    }

    .control-btn.reset {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .control-btn:hover {
      transform: translateY(-2px);
    }

    .rest-presets {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .preset-label {
      font-size: 12px;
      color: #6b7a8f;
    }

    .preset-btn {
      padding: 8px 16px;
      background: rgba(0, 180, 216, 0.2);
      border: 1px solid rgba(0, 180, 216, 0.3);
      border-radius: 8px;
      color: #00b4d8;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .preset-btn:hover {
      background: rgba(0, 180, 216, 0.3);
    }
  `]
})
export class WorkoutTimerComponent {
    @Output() timerComplete = new EventEmitter<void>();

    currentTime = 0;
    isRunning = false;
    isResting = false;
    private intervalId: any = null;

    startTimer(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.intervalId = setInterval(() => {
            if (this.isResting) {
                this.currentTime--;
                if (this.currentTime <= 0) {
                    this.playSound('complete');
                    this.resetTimer();
                    this.timerComplete.emit();
                } else if (this.currentTime <= 3) {
                    this.playSound('beep');
                }
            } else {
                this.currentTime++;
            }
        }, 1000);
    }

    pauseTimer(): void {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    resetTimer(): void {
        this.pauseTimer();
        this.currentTime = 0;
        this.isResting = false;
    }

    startRest(seconds: number): void {
        this.resetTimer();
        this.currentTime = seconds;
        this.isResting = true;
        this.playSound('rest');
        this.startTimer();
    }

    formatTime(seconds: number): string {
        const mins = Math.floor(Math.abs(seconds) / 60);
        const secs = Math.abs(seconds) % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    private playSound(type: 'beep' | 'complete' | 'rest'): void {
        // Web Audio API for sounds
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'beep') {
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'complete') {
            oscillator.frequency.value = 1200;
            gainNode.gain.value = 0.5;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } else if (type === 'rest') {
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    }
}
