import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { AIService } from '../../services/ai.service';
import { GamificationService } from '../../services/gamification.service';
import { VoiceCoachService } from '../../services/voice-coach.service';

@Component({
  selector: 'app-workout-routine',
  templateUrl: './workout-routine.component.html',
  styleUrls: ['./workout-routine.component.css']
})
export class WorkoutRoutineComponent implements OnInit {
  workouts: any[] = [];
  selectedDay: string = 'Monday';
  selectedDayIndex: number = 0;
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  loading = false;

  constructor(
    private apiService: ApiService,
    private aiService: AIService,
    private snackBar: MatSnackBar,
    private gamificationService: GamificationService,
    private voiceCoach: VoiceCoachService
  ) { }

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.loading = true;
    this.apiService.getWorkouts().subscribe({
      next: (data) => {
        this.workouts = data;
        if (this.workouts.length > 0) {
          this.selectedDay = this.workouts[0].day;
        }
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('💀 Scouter Error! Failed to load training regimen', 'Close', { duration: 5000, panelClass: ['dbz-snackbar'] });
        this.loading = false;
      }
    });
  }

  getCurrentDayWorkout(): any {
    return this.workouts.find(w => w.day === this.selectedDay);
  }

  toggleExercise(day: string, index: number): void {
    const workout = this.workouts.find(w => w.day === day);
    if (!workout) return;

    // Toggle status locally
    const status = workout.completed_status.exercises;
    const wasCompleted = status[index];
    status[index] = !status[index];

    // Update backend
    this.apiService.updateWorkoutStatus(workout.id, workout.completed_status).subscribe({
      next: (response: any) => {
        // Add XP if exercise was just completed (not un-completed)
        if (!wasCompleted && status[index]) {
          // Voice announcement
          this.voiceCoach.announceExerciseComplete();

          this.gamificationService.addXP(10, 'exercise_complete').subscribe({
            next: (xpData) => {
              if (xpData.leveled_up) {
                this.voiceCoach.announceLevelUp(xpData.power_level, xpData.title);
                this.snackBar.open(`⚡ POWER UP! Your power level is now ${xpData.power_level}!`, 'Close', { duration: 4000, panelClass: ['dbz-snackbar'] });
              } else {
                this.snackBar.open(`🔥 +10 Ki! Training logged, Warrior!`, 'Close', { duration: 2000, panelClass: ['dbz-snackbar'] });
              }
            }
          });
        } else {
          this.snackBar.open('💪 Training progress saved!', 'Close', { duration: 2000, panelClass: ['dbz-snackbar'] });
        }
      },
      error: (err: any) => {
        this.snackBar.open('💀 Ki disruption! Failed to save progress', 'Close', { duration: 3000, panelClass: ['dbz-snackbar'] });
        // Revert local change on error
        status[index] = !status[index];
      }
    });
  }

  getCompletedExercisesCount(day: string): number {
    const workout = this.workouts.find(w => w.day === day);
    if (!workout || !workout.completed_status || !workout.completed_status.exercises) return 0;
    return Object.values(workout.completed_status.exercises).filter((v: any) => v).length;
  }

  getTotalExercisesCount(day: string): number {
    const workout = this.workouts.find(w => w.day === day);
    if (!workout || !workout.exercises) return 0;
    return workout.exercises.length;
  }

  onDayChange(index: number): void {
    this.selectedDayIndex = index;
    this.selectedDay = this.days[index];
  }

  getProgressPercentage(day: string): number {
    const total = this.getTotalExercisesCount(day);
    if (total === 0) return 0;
    return Math.round((this.getCompletedExercisesCount(day) / total) * 100);
  }

  getProgressDashArray(day: string): string {
    const percentage = this.getProgressPercentage(day);
    return `${percentage}, 100`;
  }

  regenerateWorkout() {
    this.loading = true;
    this.aiService.generateWorkout('home').subscribe({
      next: (workout: any) => {
        const currentWorkout = this.getCurrentDayWorkout();
        if (currentWorkout && workout.workout?.exercises) {
          this.apiService.updateWorkout(currentWorkout.day, workout.workout.exercises).subscribe({
            next: () => {
              this.snackBar.open('🐉 Shenron has granted your new training regimen!', 'Close', { duration: 3000, panelClass: ['dbz-snackbar'] });
              // Reload workouts to refresh the display
              this.loadWorkouts();
            },
            error: (err) => {
              this.snackBar.open('💀 Failed to save training regimen!', 'Close', { duration: 5000, panelClass: ['dbz-snackbar'] });
              this.loading = false;
            }
          });
        } else {
          this.snackBar.open('💀 Invalid workout data from Shenron!', 'Close', { duration: 3000, panelClass: ['dbz-snackbar'] });
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.snackBar.open('💀 Shenron could not grant your wish!', 'Close', { duration: 3000, panelClass: ['dbz-snackbar'] });
        this.loading = false;
      }
    });
  }
}
