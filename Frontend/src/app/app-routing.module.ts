import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { WorkoutRoutineComponent } from './components/workout-routine/workout-routine.component';
import { MealPlannerComponent } from './components/meal-planner/meal-planner.component';
import { ProgressTrackerComponent } from './components/progress-tracker/progress-tracker.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'workouts', component: WorkoutRoutineComponent, canActivate: [AuthGuard] },
  { path: 'meals', component: MealPlannerComponent, canActivate: [AuthGuard] },
  { path: 'progress', component: ProgressTrackerComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

