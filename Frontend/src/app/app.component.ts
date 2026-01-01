import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'LimitBreaker 💪';

  // Power Up Animation
  showPowerUp = false;
  newPowerLevel = 1;
  newPowerTitle = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Can be called from child components via service
  triggerPowerUp(level: number, title: string): void {
    this.newPowerLevel = level;
    this.newPowerTitle = title;
    this.showPowerUp = true;
    setTimeout(() => this.showPowerUp = false, 3500);
  }
}

