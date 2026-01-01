import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-power-up-animation',
    template: `
    <div class="power-up-overlay" *ngIf="showAnimation" (click)="dismiss()">
      <div class="power-up-container">
        <!-- Energy burst background -->
        <div class="energy-burst"></div>
        
        <!-- Particle effects -->
        <div class="particles">
          <div *ngFor="let p of particles" class="particle" [style.--delay]="p.delay + 's'" [style.--angle]="p.angle + 'deg'"></div>
        </div>

        <!-- Main content -->
        <div class="power-up-content">
          <div class="aura"></div>
          <div class="level-badge">
            <span class="level-number">{{ newLevel }}</span>
          </div>
          <h1 class="power-up-title">LEVEL UP!</h1>
          <p class="power-up-subtitle">Power Level {{ newLevel }}</p>
          <p class="new-title" *ngIf="newTitle">{{ newTitle }}</p>
        </div>

        <!-- Lightning effects -->
        <div class="lightning lightning-1"></div>
        <div class="lightning lightning-2"></div>
      </div>
    </div>
  `,
    styles: [`
    .power-up-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .power-up-container {
      position: relative;
      width: 400px;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .energy-burst {
      position: absolute;
      width: 300%;
      height: 300%;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 107, 53, 0.2) 30%, transparent 70%);
      animation: burst 1.5s ease-out infinite;
    }

    @keyframes burst {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    .aura {
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 107, 53, 0.4) 50%, transparent 70%);
      animation: auraGlow 0.5s ease-in-out infinite alternate;
    }

    @keyframes auraGlow {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.2); opacity: 1; }
    }

    .particles {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .particle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 8px;
      background: #ffd700;
      border-radius: 50%;
      box-shadow: 0 0 10px #ffd700, 0 0 20px #ff6b35;
      animation: particleFly 1s ease-out forwards;
      animation-delay: var(--delay);
      transform: rotate(var(--angle)) translateY(0);
    }

    @keyframes particleFly {
      0% { transform: rotate(var(--angle)) translateY(0); opacity: 1; }
      100% { transform: rotate(var(--angle)) translateY(-200px); opacity: 0; }
    }

    .power-up-content {
      position: relative;
      text-align: center;
      z-index: 10;
    }

    .level-badge {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #ff6b35, #ffd700);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 107, 53, 0.5);
      animation: badgePulse 0.5s ease-in-out infinite alternate;
    }

    @keyframes badgePulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.1); }
    }

    .level-number {
      font-size: 48px;
      font-weight: 900;
      color: #000;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .power-up-title {
      font-size: 48px;
      font-weight: 900;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 8px;
      margin: 0;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 107, 53, 0.6);
      animation: titlePop 0.5s ease-out;
    }

    @keyframes titlePop {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }

    .power-up-subtitle {
      font-size: 18px;
      color: #ffd700;
      margin: 10px 0;
      letter-spacing: 2px;
    }

    .new-title {
      font-size: 24px;
      font-weight: 700;
      color: #00b4d8;
      text-transform: uppercase;
      margin-top: 15px;
      animation: titleSlide 0.5s ease-out 0.3s both;
    }

    @keyframes titleSlide {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .lightning {
      position: absolute;
      width: 4px;
      height: 150px;
      background: linear-gradient(to bottom, transparent, #ffd700, transparent);
      opacity: 0;
      animation: lightning 0.2s ease-in-out infinite;
    }

    .lightning-1 {
      top: -100px;
      left: 30%;
      transform: rotate(-15deg);
      animation-delay: 0.1s;
    }

    .lightning-2 {
      top: -80px;
      right: 25%;
      transform: rotate(10deg);
      animation-delay: 0.3s;
    }

    @keyframes lightning {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }
  `]
})
export class PowerUpAnimationComponent implements OnChanges {
    @Input() trigger: boolean = false;
    @Input() newLevel: number = 1;
    @Input() newTitle: string = '';

    showAnimation = false;
    particles: { delay: number; angle: number }[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['trigger'] && this.trigger) {
            this.playAnimation();
        }
    }

    playAnimation(): void {
        // Generate particles
        this.particles = [];
        for (let i = 0; i < 24; i++) {
            this.particles.push({
                delay: Math.random() * 0.5,
                angle: i * 15
            });
        }

        this.showAnimation = true;

        // Auto dismiss after 3 seconds
        setTimeout(() => {
            this.dismiss();
        }, 3000);
    }

    dismiss(): void {
        this.showAnimation = false;
    }
}
