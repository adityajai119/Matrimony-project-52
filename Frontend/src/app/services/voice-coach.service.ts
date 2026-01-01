import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class VoiceCoachService {
    private synth: SpeechSynthesis;
    private voice: SpeechSynthesisVoice | null = null;
    private enabled = true;
    private volume = 1;

    // Motivational phrases
    private motivationalPhrases = [
        "You got this!",
        "Keep pushing!",
        "Almost there!",
        "Don't give up!",
        "You're doing amazing!",
        "Feel the power!",
        "One more!",
        "Stay strong!",
        "This is your moment!",
        "Power through it!"
    ];

    constructor() {
        this.synth = window.speechSynthesis;
        this.loadVoice();
    }

    private loadVoice(): void {
        // Wait for voices to load
        if (this.synth.getVoices().length > 0) {
            this.selectVoice();
        } else {
            this.synth.onvoiceschanged = () => this.selectVoice();
        }
    }

    private selectVoice(): void {
        const voices = this.synth.getVoices();
        // Prefer English voices
        this.voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
            || voices.find(v => v.lang.startsWith('en'))
            || voices[0];
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    speak(text: string, priority: boolean = false): void {
        if (!this.enabled) return;

        if (priority) {
            this.synth.cancel(); // Stop current speech
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.volume = this.volume;
        utterance.rate = 1.1; // Slightly faster for energy
        utterance.pitch = 1.0;

        this.synth.speak(utterance);
    }

    // === WORKOUT ANNOUNCEMENTS ===

    announceExercise(name: string, sets: number, reps: string): void {
        this.speak(`Time for ${name}. ${sets} sets of ${reps} reps. Let's go!`, true);
    }

    announceSet(currentSet: number, totalSets: number): void {
        if (currentSet === totalSets) {
            this.speak(`Final set! Give it everything!`, true);
        } else {
            this.speak(`Set ${currentSet} of ${totalSets}. ${this.getRandomMotivation()}`, true);
        }
    }

    announceRepsRemaining(reps: number): void {
        if (reps <= 3) {
            this.speak(`${reps} more! ${this.getRandomMotivation()}`);
        }
    }

    announceRestStart(seconds: number): void {
        this.speak(`Rest time. ${seconds} seconds. Breathe.`, true);
    }

    announceRestWarning(seconds: number): void {
        if (seconds <= 5) {
            this.speak(`${seconds} seconds!`);
        } else if (seconds === 10) {
            this.speak(`10 seconds. Get ready!`);
        }
    }

    announceRestEnd(): void {
        this.speak(`Time's up! Let's go!`, true);
    }

    announceExerciseComplete(): void {
        this.speak(`Exercise complete! ${this.getRandomMotivation()}`, true);
    }

    announceWorkoutComplete(): void {
        this.speak(`Workout complete! You crushed it! Power level increasing!`, true);
    }

    announceLevelUp(level: number, title: string): void {
        this.speak(`Level up! You are now Power Level ${level}! ${title} status unlocked!`, true);
    }

    announceStreak(days: number): void {
        if (days === 7) {
            this.speak(`One week streak! You're on fire!`, true);
        } else if (days === 30) {
            this.speak(`30 day streak! Legendary dedication!`, true);
        } else if (days % 10 === 0) {
            this.speak(`${days} day streak! Unstoppable!`, true);
        }
    }

    // === CUSTOM SPEECH ===

    motivate(): void {
        this.speak(this.getRandomMotivation());
    }

    private getRandomMotivation(): string {
        return this.motivationalPhrases[Math.floor(Math.random() * this.motivationalPhrases.length)];
    }

    countdown(from: number, callback?: () => void): void {
        let count = from;
        const interval = setInterval(() => {
            this.speak(count.toString(), true);
            count--;
            if (count < 0) {
                clearInterval(interval);
                this.speak("Go!", true);
                if (callback) callback();
            }
        }, 1000);
    }
}
