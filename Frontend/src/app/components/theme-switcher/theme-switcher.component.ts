import { Component, OnInit } from '@angular/core';
import { ThemeService, PowerTheme } from '../../services/theme.service';

@Component({
    selector: 'app-theme-switcher',
    template: `
    <div class="theme-switcher">
      <div class="switcher-header">
        <span class="switcher-icon">🎨</span>
        <span class="switcher-title">Power Mode</span>
      </div>

      <div class="theme-grid">
        <button 
          *ngFor="let theme of themes"
          class="theme-btn"
          [class.active]="currentTheme === theme.id"
          [style.--theme-color]="theme.color"
          (click)="selectTheme(theme.id)">
          <span class="theme-emoji">{{ theme.emoji }}</span>
          <span class="theme-name">{{ theme.name }}</span>
          <span class="theme-level" *ngIf="theme.minLevel">Lvl {{ theme.minLevel }}+</span>
        </button>
      </div>

      <p class="auto-hint">
        <mat-icon>auto_awesome</mat-icon>
        Theme auto-changes with your Power Level!
      </p>
    </div>
  `,
    styles: [`
    .theme-switcher {
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .switcher-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .switcher-icon {
      font-size: 24px;
    }

    .switcher-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .theme-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }

    .theme-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 15px 10px;
      background: rgba(0, 0, 0, 0.3);
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .theme-btn:hover {
      background: rgba(var(--theme-color), 0.2);
      border-color: var(--theme-color);
    }

    .theme-btn.active {
      background: rgba(var(--theme-color), 0.2);
      border-color: var(--theme-color);
      box-shadow: 0 0 15px var(--theme-color);
    }

    .theme-emoji {
      font-size: 28px;
    }

    .theme-name {
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      text-align: center;
    }

    .theme-level {
      font-size: 9px;
      color: #6b7a8f;
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 6px;
      border-radius: 8px;
    }

    .auto-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      font-size: 11px;
      color: #6b7a8f;
      margin: 0;
    }

    .auto-hint mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
  `]
})
export class ThemeSwitcherComponent implements OnInit {
    currentTheme: PowerTheme = 'default';

    themes = [
        { id: 'default' as PowerTheme, name: 'Default', emoji: '⚡', color: '255, 107, 53', minLevel: 0 },
        { id: 'rage' as PowerTheme, name: 'Rage', emoji: '🔴', color: '239, 35, 60', minLevel: 5 },
        { id: 'super-saiyan' as PowerTheme, name: 'Super Saiyan', emoji: '🌟', color: '255, 215, 0', minLevel: 15 },
        { id: 'ultra-instinct' as PowerTheme, name: 'Ultra Instinct', emoji: '🔮', color: '192, 192, 192', minLevel: 30 },
        { id: 'god-mode' as PowerTheme, name: 'God Mode', emoji: '👑', color: '155, 89, 182', minLevel: 50 }
    ];

    constructor(private themeService: ThemeService) { }

    ngOnInit(): void {
        this.themeService.theme$.subscribe(theme => {
            this.currentTheme = theme;
        });
    }

    selectTheme(theme: PowerTheme): void {
        this.themeService.setTheme(theme);
    }
}
