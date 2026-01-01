import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  goals = ['weight loss', 'muscle gain', 'maintenance'];
  genders = ['Male', 'Female', 'Other'];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', [Validators.required]],
      height: ['', [Validators.required, Validators.min(1), Validators.max(300)]],
      weight: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      goal: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.apiService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          goal: profile.goal
        });
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('💀 Scouter malfunction! Failed to read your power level', 'Close', { duration: 5000, panelClass: ['dbz-snackbar'] });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.apiService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.snackBar.open('👑 Warrior profile updated!', 'Close', { duration: 3000, panelClass: ['dbz-snackbar'] });
          this.loading = false;
        },
        error: (err) => {
          this.snackBar.open('💀 Ki disruption! Profile update failed', 'Close', { duration: 5000, panelClass: ['dbz-snackbar'] });
          this.loading = false;
        }
      });
    }
  }

  calculateBMI(): string {
    const height = this.profileForm.get('height')?.value;
    const weight = this.profileForm.get('weight')?.value;
    if (!height || !weight) return '--';
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  }

  getBMIStatus(): { label: string; class: string } {
    const bmi = parseFloat(this.calculateBMI());
    if (isNaN(bmi)) return { label: 'Enter data', class: '' };
    if (bmi < 18.5) return { label: 'Underweight', class: 'underweight' };
    if (bmi < 25) return { label: 'Normal', class: 'normal' };
    if (bmi < 30) return { label: 'Overweight', class: 'overweight' };
    return { label: 'Obese', class: 'obese' };
  }

  calculateDailyCalories(): string {
    const age = this.profileForm.get('age')?.value;
    const height = this.profileForm.get('height')?.value;
    const weight = this.profileForm.get('weight')?.value;
    const gender = this.profileForm.get('gender')?.value;
    const goal = this.profileForm.get('goal')?.value;

    if (!age || !height || !weight || !gender) return '--';

    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === 'Male' ? 5 : -161;

    // Activity multiplier (moderate)
    let calories = bmr * 1.55;

    // Goal adjustment
    if (goal === 'weight loss') calories -= 400;
    if (goal === 'muscle gain') calories += 300;

    return Math.round(calories).toString();
  }
}

