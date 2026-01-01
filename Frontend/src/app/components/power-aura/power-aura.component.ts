import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-power-aura',
    template: `
    <div class="aura-container" [class]="'rank-' + rank">
      <div class="aura-ring ring-1"></div>
      <div class="aura-ring ring-2"></div>
      <div class="aura-ring ring-3"></div>
      <div class="aura-particles">
        <div *ngFor="let p of particles" class="particle" [style.--delay]="p.delay + 's'" [style.--x]="p.x + 'px'"></div>
      </div>
      <div class="avatar-wrapper">
        <ng-content></ng-content>
      </div>
      <div class="power-badge">{{ powerLevel }}</div>
    </div>
  `,
    styles: [`
    .aura-container {
      position: relative;
      display: inline-block;
      padding: 20px;
    }

    .aura-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      opacity: 0.5;
      pointer-events: none;
    }

    .ring-1 {
      width: 140%;
      height: 140%;
      border: 2px solid var(--aura-color, #ff6b35);
      animation: pulse1 2s ease-in-out infinite;
    }

    .ring-2 {
      width: 160%;
      height: 160%;
      border: 1px solid var(--aura-color, #ff6b35);
      animation: pulse2 2s ease-in-out infinite 0.3s;
    }

    .ring-3 {
      width: 180%;
      height: 180%;
      border: 1px solid var(--aura-color, #ff6b35);
      animation: pulse3 2s ease-in-out infinite 0.6s;
    }

    @keyframes pulse1 {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
      50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.3; }
    }

    @keyframes pulse2 {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
      50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.2; }
    }

    @keyframes pulse3 {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
      50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.1; }
    }

    /* Rank Colors */
    .rank-rookie { --aura-color: #6b7a8f; }
    .rank-fighter { --aura-color: #39ff14; }
    .rank-warrior { --aura-color: #ff6b35; }
    .rank-elite { --aura-color: #ffd700; }
    .rank-legend { --aura-color: #9b59b6; }
    .rank-god { --aura-color: #e91e63; }

    /* Elite and above get extra effects */
    .rank-elite .ring-1,
    .rank-legend .ring-1,
    .rank-god .ring-1 {
      box-shadow: 0 0 20px var(--aura-color), inset 0 0 20px var(--aura-color);
    }

    .rank-legend .aura-particles,
    .rank-god .aura-particles {
      display: block;
    }

    .aura-particles {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--aura-color);
      border-radius: 50%;
      left: calc(50% + var(--x));
      bottom: 20%;
      animation: float 2s ease-in-out infinite;
      animation-delay: var(--delay);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); opacity: 0; }
      50% { transform: translateY(-60px); opacity: 1; }
    }

    .avatar-wrapper {
      position: relative;
      z-index: 10;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 20px var(--aura-color);
    }

    .power-badge {
      position: absolute;
      bottom: 5px;
      right: 5px;
      background: var(--aura-color);
      color: #000;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 12px;
      z-index: 20;
      box-shadow: 0 0 10px var(--aura-color);
    }

    /* God mode special effect */
    .rank-god .avatar-wrapper {
      animation: godGlow 1s ease-in-out infinite alternate;
    }

    @keyframes godGlow {
      0% { box-shadow: 0 0 20px #e91e63, 0 0 40px #9b59b6; }
      100% { box-shadow: 0 0 30px #e91e63, 0 0 60px #9b59b6; }
    }
  `]
})
export class PowerAuraComponent {
    @Input() powerLevel: number = 1;
    @Input() rank: string = 'rookie';

    particles = [
        { delay: 0, x: -30 },
        { delay: 0.3, x: -15 },
        { delay: 0.6, x: 0 },
        { delay: 0.9, x: 15 },
        { delay: 1.2, x: 30 }
    ];
}
