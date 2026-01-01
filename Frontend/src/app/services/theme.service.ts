import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type PowerTheme = 'default' | 'super-saiyan' | 'ultra-instinct' | 'rage' | 'god-mode';

interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    gradient: string;
}

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private currentTheme = new BehaviorSubject<PowerTheme>('default');
    theme$ = this.currentTheme.asObservable();

    private themes: Record<PowerTheme, ThemeColors> = {
        'default': {
            primary: '#ff6b35',
            secondary: '#00b4d8',
            accent: '#ffd700',
            glow: 'rgba(255, 107, 53, 0.5)',
            gradient: 'linear-gradient(135deg, #ff6b35, #ffd700)'
        },
        'super-saiyan': {
            primary: '#ffd700',
            secondary: '#ffeb3b',
            accent: '#ff9800',
            glow: 'rgba(255, 215, 0, 0.7)',
            gradient: 'linear-gradient(135deg, #ffd700, #ff9800)'
        },
        'ultra-instinct': {
            primary: '#c0c0c0',
            secondary: '#00b4d8',
            accent: '#e0e0e0',
            glow: 'rgba(192, 192, 192, 0.6)',
            gradient: 'linear-gradient(135deg, #c0c0c0, #00b4d8)'
        },
        'rage': {
            primary: '#ef233c',
            secondary: '#ff6b35',
            accent: '#d90429',
            glow: 'rgba(239, 35, 60, 0.6)',
            gradient: 'linear-gradient(135deg, #ef233c, #ff6b35)'
        },
        'god-mode': {
            primary: '#9b59b6',
            secondary: '#3498db',
            accent: '#e91e63',
            glow: 'rgba(155, 89, 182, 0.6)',
            gradient: 'linear-gradient(135deg, #9b59b6, #e91e63)'
        }
    };

    constructor() {
        // Load saved theme
        const saved = localStorage.getItem('powerTheme') as PowerTheme;
        if (saved && this.themes[saved]) {
            this.setTheme(saved);
        }
    }

    setTheme(theme: PowerTheme): void {
        this.currentTheme.next(theme);
        localStorage.setItem('powerTheme', theme);
        this.applyTheme(theme);
    }

    getTheme(): PowerTheme {
        return this.currentTheme.value;
    }

    // Auto-select theme based on power level
    setThemeByPowerLevel(level: number): void {
        if (level >= 50) {
            this.setTheme('god-mode');
        } else if (level >= 30) {
            this.setTheme('ultra-instinct');
        } else if (level >= 15) {
            this.setTheme('super-saiyan');
        } else if (level >= 5) {
            this.setTheme('rage');
        } else {
            this.setTheme('default');
        }
    }

    private applyTheme(theme: PowerTheme): void {
        const colors = this.themes[theme];
        const root = document.documentElement;

        root.style.setProperty('--theme-primary', colors.primary);
        root.style.setProperty('--theme-secondary', colors.secondary);
        root.style.setProperty('--theme-accent', colors.accent);
        root.style.setProperty('--theme-glow', colors.glow);
        root.style.setProperty('--theme-gradient', colors.gradient);

        // Add theme class to body
        document.body.classList.remove('theme-default', 'theme-super-saiyan', 'theme-ultra-instinct', 'theme-rage', 'theme-god-mode');
        document.body.classList.add(`theme-${theme}`);
    }

    getThemeColors(theme?: PowerTheme): ThemeColors {
        return this.themes[theme || this.currentTheme.value];
    }

    getAllThemes(): PowerTheme[] {
        return Object.keys(this.themes) as PowerTheme[];
    }
}
