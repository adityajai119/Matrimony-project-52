import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseConfig } from '../../config/firebase';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoogleAuthStateService } from '../../services/google-auth-state.service';

@Component({
    selector: 'app-google-button',
    templateUrl: './google-button.component.html',
    styleUrls: ['./google-button.component.css']
})
export class GoogleButtonComponent {
    constructor(
        private apiService: ApiService,
        private router: Router,
        private snackBar: MatSnackBar,
        private googleAuthState: GoogleAuthStateService
    ) {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
    }

    async continueWithGoogle() {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const token = await user.getIdToken();

            this.apiService.googleLogin(token).subscribe({
                next: (res) => {
                    if (res.isNewUser) {
                        // DBZ-themed notification
                        this.snackBar.open('⚡ State your power stats, Warrior! Complete your profile!', 'Close', {
                            duration: 5000,
                            panelClass: ['dbz-snackbar']
                        });

                        // Vegeta Voice using Web Speech API
                        this.speakVegeta('State your power level, Warrior! Fill in your stats to begin training!');

                        // Store Google data in service (more reliable than router state)
                        this.googleAuthState.setGoogleData({
                            googleUser: res.user,
                            googleToken: res.token
                        });

                        this.router.navigate(['/register']);
                    } else {
                        localStorage.setItem('token', res.token);
                        this.snackBar.open(`💪 Welcome back, ${res.user.name}! Ready to train?`, 'Close', {
                            duration: 3000,
                            panelClass: ['dbz-snackbar']
                        });
                        this.router.navigate(['/dashboard']);
                    }
                },
                error: (err) => {
                    console.error('Login failed', err);
                    this.snackBar.open('💀 Scouter malfunction! Google Login Failed', 'Close', {
                        duration: 3000,
                        panelClass: ['dbz-snackbar']
                    });
                }
            });

        } catch (error) {
            console.error('Firebase Auth Error', error);
            this.snackBar.open('💀 You cancelled the battle! Try again, Warrior.', 'Close', {
                duration: 3000,
                panelClass: ['dbz-snackbar']
            });
        }
    }

    private speakVegeta(message: string): void {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.pitch = 0.8;  // Deep, commanding voice
            utterance.volume = 1;

            // Try to find a deep/male voice
            const voices = speechSynthesis.getVoices();
            const maleVoice = voices.find(v => v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('David'));
            if (maleVoice) {
                utterance.voice = maleVoice;
            }

            speechSynthesis.speak(utterance);
        }
    }
}
