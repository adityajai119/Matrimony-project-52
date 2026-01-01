import { Component, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-share-card',
  template: `
    <div class="share-card">
      <div class="share-header">
        <span class="share-icon">📧</span>
        <span class="share-title">Get the progress to gmail</span>
      </div>

      <div class="share-preview">
        <div class="preview-card">
          <div class="preview-header">
            <span class="app-name">⚡ LimitBreaker</span>
          </div>
          <div class="preview-content">
            <div class="power-display">
              <span class="power-label">Power Level</span>
              <span class="power-value">{{ powerLevel }}</span>
            </div>
            <div class="title-display">{{ title }}</div>
            <div class="stats-row">
              <span>🔥 {{ streak }} Day Streak</span>
              <span>💪 {{ exercisesCompleted }} Exercises</span>
            </div>
          </div>
        </div>
      </div>

      <div class="share-buttons">
        <button class="share-btn gmail" (click)="sendEmail()" [disabled]="sending">
          <span class="btn-icon">
             <mat-icon>mail</mat-icon>
          </span>
          {{ sending ? 'Sending...' : 'Send to Gmail' }}
        </button>
      </div>

      <p class="share-tip" *ngIf="sent">✅ Email sent successfully!</p>
    </div>
  `,
  styles: [`
    .share-card {
      background: var(--bg-card);
      border: 1px solid rgba(255, 107, 53, 0.2);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .share-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .share-icon {
      font-size: 24px;
    }

    .share-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .share-preview {
      margin-bottom: 20px;
    }

    .preview-card {
      background: linear-gradient(135deg, #1a1a2e, #0a0a1a);
      border: 2px solid rgba(255, 107, 53, 0.4);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }

    .preview-header {
      margin-bottom: 15px;
    }

    .app-name {
      font-size: 14px;
      color: #ffd700;
      font-weight: 600;
      letter-spacing: 2px;
    }

    .power-display {
      margin-bottom: 10px;
    }

    .power-label {
      display: block;
      font-size: 12px;
      color: #6b7a8f;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .power-value {
      font-size: 48px;
      font-weight: 900;
      background: linear-gradient(135deg, #ff6b35, #ffd700);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .title-display {
      font-size: 18px;
      color: #00b4d8;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 15px;
    }

    .stats-row {
      display: flex;
      justify-content: center;
      gap: 20px;
      font-size: 12px;
      color: #b8c5d9;
    }

    .share-buttons {
      display: flex;
      justify-content: center;
    }

    .share-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 12px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 11px;
      font-weight: 600;
    }

    .btn-icon {
      font-size: 20px;
    }

    .share-btn.gmail {
      background: linear-gradient(135deg, #EA4335 0%, #C5221F 100%);
      color: #fff;
      width: 100%;
      flex-direction: row;
      justify-content: center;
      gap: 12px;
      font-size: 15px;
      padding: 16px;
      border-radius: 14px;
      box-shadow: 0 4px 15px rgba(234, 67, 53, 0.3);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .share-btn.gmail::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: 0.5s;
    }

    .share-btn.gmail:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(234, 67, 53, 0.5);
    }

    .share-btn.gmail:hover::after {
      left: 100%;
    }

    .share-btn.gmail:active {
      transform: scale(0.98);
    }

    .share-btn:hover {
      transform: translateY(-2px);
      opacity: 0.9;
    }

    .share-tip {
      text-align: center;
      color: #39ff14;
      font-size: 14px;
      margin-top: 15px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class ShareCardComponent {
  @Input() powerLevel: number = 1;
  @Input() title: string = 'Rookie';
  @Input() streak: number = 0;
  @Input() exercisesCompleted: number = 0;

  sending = false;
  sent = false;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) { }

  sendEmail(): void {
    this.sending = true;
    this.apiService.sendProgressEmail().subscribe({
      next: (res) => {
        this.sending = false;
        this.sent = true;
        this.snackBar.open('📬 Power level report transmitted to your communicator!', 'Close', { duration: 3000, panelClass: ['dbz-snackbar'] });
        setTimeout(() => this.sent = false, 5000);
      },
      error: (err) => {
        this.sending = false;
        this.snackBar.open('💀 Transmission failed! Check your scouter settings.', 'Close', { duration: 4000, panelClass: ['dbz-snackbar'] });
        console.error(err);
      }
    });
  }
}
