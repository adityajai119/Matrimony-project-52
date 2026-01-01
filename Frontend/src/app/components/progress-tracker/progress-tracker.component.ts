import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.css']
})
export class ProgressTrackerComponent implements OnInit {
  progressData: any = null;
  loading = false;

  // Chart.js Configuration
  barChartData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Exercises',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(56, 239, 125, 0.7)',
        borderColor: '#38ef7d',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      },
      {
        label: 'Meals',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(242, 153, 74, 0.7)',
        borderColor: '#f2994a',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#c8c8d8',
          font: { family: 'Inter', size: 12 },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#16213e',
        titleColor: '#fff',
        bodyColor: '#c8c8d8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9a9ab0', font: { family: 'Inter', size: 11 } }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#9a9ab0',
          font: { family: 'Inter', size: 11 },
          callback: (value) => value + '%'
        }
      }
    }
  };

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadProgress();
  }

  loadProgress(): void {
    this.loading = true;
    this.apiService.getProgress().subscribe({
      next: (data) => {
        this.progressData = data;
        this.updateChartData();
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('💀 Scouter offline! Failed to analyze your power growth', 'Close', { duration: 5000, panelClass: ['dbz-snackbar'] });
        this.loading = false;
      }
    });
  }

  updateChartData(): void {
    if (this.progressData?.dailyStats) {
      const exerciseData = this.progressData.dailyStats.map((day: any) =>
        day.totalExercises > 0 ? Math.round((day.exercisesCompleted / day.totalExercises) * 100) : 0
      );
      const mealData = this.progressData.dailyStats.map((day: any) =>
        day.totalMeals > 0 ? Math.round((day.mealsCompleted / day.totalMeals) * 100) : 0
      );

      this.barChartData = {
        labels: this.progressData.dailyStats.map((d: any) => d.day.substring(0, 3)),
        datasets: [
          { ...this.barChartData.datasets[0], data: exerciseData },
          { ...this.barChartData.datasets[1], data: mealData }
        ]
      };
    }
  }

  getExerciseProgressPercentage(): number {
    if (!this.progressData || this.progressData.weeklyStats.totalExercises === 0) return 0;
    return (this.progressData.weeklyStats.exercisesCompleted / this.progressData.weeklyStats.totalExercises) * 100;
  }

  getMealProgressPercentage(): number {
    if (!this.progressData || this.progressData.weeklyStats.totalMeals === 0) return 0;
    return (this.progressData.weeklyStats.mealsCompleted / this.progressData.weeklyStats.totalMeals) * 100;
  }

  getCalorieProgressPercentage(): number {
    if (!this.progressData || this.progressData.weeklyStats.caloriesTarget === 0) return 0;
    return (this.progressData.weeklyStats.caloriesConsumed / this.progressData.weeklyStats.caloriesTarget) * 100;
  }

  getBarHeight(completed: number, total: number): number {
    if (total === 0) return 5;
    return Math.max(5, (completed / total) * 100);
  }

  getDayScore(day: any): number {
    const exerciseScore = day.totalExercises > 0 ? (day.exercisesCompleted / day.totalExercises) : 0;
    const mealScore = day.totalMeals > 0 ? (day.mealsCompleted / day.totalMeals) : 0;
    return Math.round(((exerciseScore + mealScore) / 2) * 100);
  }

  getDayScoreClass(day: any): string {
    const score = this.getDayScore(day);
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'low';
  }
}


