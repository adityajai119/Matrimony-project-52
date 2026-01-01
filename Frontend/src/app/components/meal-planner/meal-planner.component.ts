import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { AIService } from '../../services/ai.service';
import { GamificationService } from '../../services/gamification.service';

@Component({
  selector: 'app-meal-planner',
  templateUrl: './meal-planner.component.html',
  styleUrls: ['./meal-planner.component.css']
})
export class MealPlannerComponent implements OnInit {
  mealPlans: any[] = [];
  selectedDay: string = 'Monday';
  selectedDayIndex: number = 0;
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  loading = false;

  constructor(
    private apiService: ApiService,
    private aiService: AIService,
    private snackBar: MatSnackBar,
    private gamificationService: GamificationService
  ) { }

  ngOnInit(): void {
    this.loadMeals();
  }

  loadMeals(): void {
    this.loading = true;
    this.apiService.getMeals().subscribe({
      next: (data) => {
        this.mealPlans = data;
        if (this.mealPlans.length > 0) {
          this.selectedDay = this.mealPlans[0].day;
        }
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('💀 Scouter Error! Failed to load meal plans', 'Close', { duration: 5000, panelClass: ['dbz-snackbar'] });
        this.loading = false;
      }
    });
  }

  getCurrentDayMealPlan(): any {
    return this.mealPlans.find(m => m.day === this.selectedDay);
  }

  toggleMeal(day: string, mealType: string, snackIndex?: number): void {
    const mealPlan = this.mealPlans.find(m => m.day === day);
    if (!mealPlan) return;

    let currentStatus = false;
    if (mealType === 'snack' && snackIndex !== undefined) {
      currentStatus = mealPlan.completed_status.meals.snacks?.[snackIndex.toString()] || false;
    } else {
      currentStatus = mealPlan.completed_status.meals[mealType] || false;
    }

    const newStatus = !currentStatus;

    this.apiService.updateMealStatus(day, mealType, newStatus, snackIndex).subscribe({
      next: (response) => {
        mealPlan.completed_status = response.completed_status;
        // Add XP if meal was just completed
        if (newStatus) {
          this.gamificationService.addXP(5, 'meal_complete').subscribe({
            next: (xpData) => {
              if (xpData.leveled_up) {
                this.snackBar.open(`⚡ POWER UP! Power Level ${xpData.power_level}!`, 'Close', { duration: 4000, panelClass: ['dbz-snackbar'] });
              } else {
                this.snackBar.open(`🍗 +5 Ki! Senzu Bean consumed!`, 'Close', { duration: 2000, panelClass: ['dbz-snackbar'] });
              }
            }
          });
        } else {
          this.snackBar.open('🍗 Meal status updated, Warrior!', 'Close', { duration: 2000, panelClass: ['dbz-snackbar'] });
        }
      },
      error: (err) => {
        this.snackBar.open('💀 Ki disruption! Failed to update meal', 'Close', { duration: 5000, panelClass: ['dbz-snackbar'] });
      }
    });
  }

  getCompletedMealsCount(day: string): number {
    const mealPlan = this.mealPlans.find(m => m.day === day);
    if (!mealPlan) return 0;

    let count = 0;
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    mealTypes.forEach(type => {
      if (mealPlan.completed_status.meals[type]) count++;
    });

    if (mealPlan.completed_status.meals.snacks) {
      count += Object.values(mealPlan.completed_status.meals.snacks).filter((v: any) => v).length;
    }

    return count;
  }

  getTotalMealsCount(day: string): number {
    const mealPlan = this.mealPlans.find(m => m.day === day);
    if (!mealPlan) return 0;
    return 3 + (mealPlan.meals.snacks?.length || 0); // breakfast, lunch, dinner + snacks
  }

  getCaloriesConsumed(day: string): number {
    const mealPlan = this.mealPlans.find(m => m.day === day);
    if (!mealPlan) return 0;

    let calories = 0;
    if (mealPlan.completed_status.meals.breakfast) {
      calories += mealPlan.meals.breakfast.calories;
    }
    if (mealPlan.completed_status.meals.lunch) {
      calories += mealPlan.meals.lunch.calories;
    }
    if (mealPlan.completed_status.meals.dinner) {
      calories += mealPlan.meals.dinner.calories;
    }

    if (mealPlan.completed_status.meals.snacks) {
      Object.keys(mealPlan.completed_status.meals.snacks).forEach(index => {
        if (mealPlan.completed_status.meals.snacks[index]) {
          calories += mealPlan.meals.snacks[parseInt(index)].calories;
        }
      });
    }

    return calories;
  }

  onDayChange(index: number): void {
    this.selectedDayIndex = index;
    this.selectedDay = this.days[index];
  }

  getCalorieProgressPercentage(day: string): number {
    const mealPlan = this.mealPlans.find(m => m.day === day);
    if (!mealPlan) return 0;
    const consumed = this.getCaloriesConsumed(day);
    const target = mealPlan.meals.totalCalories;
    if (target === 0) return 0;
    return Math.min(100, (consumed / target) * 100);
  }

  regenerateMealPlan() {
    this.loading = true;
    this.aiService.generateMealPlan().subscribe({
      next: (plan: any) => {
        const currentPlan = this.getCurrentDayMealPlan();
        if (currentPlan) {
          currentPlan.meals = plan.mealPlan; // Ensure structure
          this.snackBar.open('Meal plan regenerated by AI!', 'Close', { duration: 3000 });
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.snackBar.open('Failed to generate meal plan', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  triggerSmartSwap(mealName: string) {
    this.snackBar.open(`🍱 Asking Shenron for a "${mealName}" alternative...`, 'Close', { duration: 2000, panelClass: ['dbz-snackbar'] });
    this.aiService.swapMeal(mealName).subscribe({
      next: (res: any) => {
        this.snackBar.open(`🌱 Shenron suggests: ${res.alternative.name}`, 'View Details', { duration: 5000, panelClass: ['dbz-snackbar'] })
          .onAction().subscribe(() => {
            alert(`Alternative: ${res.alternative.name}\nCal: ${res.alternative.calories}\nReason: ${res.alternative.reason}`);
          });
      },
      error: (err: any) => {
        this.snackBar.open('💀 Shenron could not swap this meal!', 'Close', { duration: 3000, panelClass: ['dbz-snackbar'] });
      }
    });
  }

  exportGroceryList() {
    this.aiService.getGroceryList(this.selectedDay).subscribe({
      next: (res: any) => {
        // Trigger download or show modal
        const blob = new Blob([res.list], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grocery_list_${this.selectedDay}.txt`;
        a.click();
      }
    });
  }

  onMealLogged(meal: any): void {
    // Award XP for logging a real meal with AI
    this.gamificationService.addXP(20, 'Smart Food Scan').subscribe({
      next: (xpData) => {
        if (xpData.leveled_up) {
          this.snackBar.open(`⚡ POWER UP! Power Level ${xpData.power_level}!`, 'Close', { duration: 4000, panelClass: ['dbz-snackbar'] });
        } else {
          this.snackBar.open(`🔥 +20 Ki! Scanned ${meal.name}!`, 'Close', { duration: 2000, panelClass: ['dbz-snackbar'] });
        }
      }
    });
  }
}

