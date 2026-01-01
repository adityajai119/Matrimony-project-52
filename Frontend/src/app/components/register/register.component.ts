import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { GoogleAuthStateService } from '../../services/google-auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  goals = ['weight loss', 'muscle gain', 'maintenance'];
  genders = ['Male', 'Female', 'Other'];
  hidePassword = true;
  loading = false;

  // Google Auth State
  isGoogleRegister = false;
  googleToken = '';
  googleUserName = '';

  // OTP State
  showOtpInput = false;
  otpValue = '';
  pendingEmail = '';
  otpTimer = 0;
  timerInterval: any;

  private googleSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private googleAuthState: GoogleAuthStateService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', [Validators.required]],
      height: ['', [Validators.required, Validators.min(1), Validators.max(300)]],
      weight: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      goal: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Subscribe to Google auth state changes (for when Google button is clicked on this page)
    this.googleSub = this.googleAuthState.googleData$.subscribe(data => {
      if (data && data.googleUser) {
        this.setupGoogleMode(data);
      }
    });

    // Check initial state (for navigation from login page)
    const existingData = this.googleAuthState.getGoogleData();
    if (existingData && existingData.googleUser) {
      this.setupGoogleMode(existingData);
    }
  }

  ngOnDestroy(): void {
    this.googleSub?.unsubscribe();
    this.clearTimer();
  }

  private setupGoogleMode(data: { googleUser: any; googleToken: string }): void {
    this.isGoogleRegister = true;
    this.googleToken = data.googleToken;
    this.googleUserName = data.googleUser.name || 'Warrior';

    // Pre-fill name and email from Google
    this.registerForm.patchValue({
      name: data.googleUser.name,
      email: data.googleUser.email
    });

    // Disable email field and remove password requirement for Google users
    this.registerForm.get('email')?.disable();
    this.registerForm.get('password')?.clearValidators();
    this.registerForm.get('password')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    const formData = this.registerForm.getRawValue();

    // Prepare OTP request data
    const otpData = {
      ...formData,
      isGoogleUser: this.isGoogleRegister,
      googleToken: this.isGoogleRegister ? this.googleToken : undefined
    };

    // Send OTP instead of directly registering
    this.apiService.sendOtp(otpData).subscribe({
      next: (res) => {
        this.showOtpInput = true;
        this.pendingEmail = formData.email;
        this.startTimer(600); // 10 minutes
        this.snackBar.open('📧 OTP sent to your email! Check your inbox, Warrior!', 'Close', {
          duration: 5000,
          panelClass: ['dbz-snackbar']
        });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(err.error?.error || '💀 Failed to send OTP! Try again.', 'Close', {
          duration: 5000,
          panelClass: ['dbz-snackbar']
        });
        this.loading = false;
      }
    });
  }

  verifyOtp(): void {
    if (!this.otpValue || this.otpValue.length !== 6) {
      this.snackBar.open('⚠️ Enter a valid 6-digit OTP!', 'Close', {
        duration: 3000,
        panelClass: ['dbz-snackbar']
      });
      return;
    }

    this.loading = true;

    this.apiService.verifyOtp(this.pendingEmail, this.otpValue).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.clearTimer();
        this.googleAuthState.clearGoogleData(); // Clear the service data
        this.snackBar.open('⚡ Email verified! Welcome, Warrior! Your training begins!', 'Close', {
          duration: 3000,
          panelClass: ['dbz-snackbar']
        });
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(err.error?.error || '💀 Invalid OTP! Try again.', 'Close', {
          duration: 3000,
          panelClass: ['dbz-snackbar']
        });
        this.loading = false;
      }
    });
  }

  resendOtp(): void {
    this.loading = true;

    this.apiService.resendOtp(this.pendingEmail).subscribe({
      next: () => {
        this.startTimer(600);
        this.snackBar.open('📧 New OTP sent! Check your email.', 'Close', {
          duration: 3000,
          panelClass: ['dbz-snackbar']
        });
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || '💀 Failed to resend OTP!', 'Close', {
          duration: 3000,
          panelClass: ['dbz-snackbar']
        });
        this.loading = false;
      }
    });
  }

  startTimer(seconds: number): void {
    this.clearTimer();
    this.otpTimer = seconds;
    this.timerInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        this.clearTimer();
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  goBackToForm(): void {
    this.showOtpInput = false;
    this.otpValue = '';
    this.clearTimer();
  }
}
