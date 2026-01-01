import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { WorkoutRoutineComponent } from './components/workout-routine/workout-routine.component';
import { MealPlannerComponent } from './components/meal-planner/meal-planner.component';
import { ProgressTrackerComponent } from './components/progress-tracker/progress-tracker.component';
import { AICoachComponent } from './components/ai-coach/ai-coach.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { ThreeSceneComponent } from './components/three-scene/three-scene.component';
import { ExerciseModelViewerComponent } from './components/exercise-model-viewer/exercise-model-viewer.component';
import { FitnessModelComponent } from './components/fitness-model/fitness-model.component';
import { PowerLevelComponent } from './components/power-level/power-level.component';
import { DailyChallengeComponent } from './components/daily-challenge/daily-challenge.component';
import { WaterTrackerComponent } from './components/water-tracker/water-tracker.component';
import { AchievementBadgesComponent } from './components/achievement-badges/achievement-badges.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { WorkoutTimerComponent } from './components/workout-timer/workout-timer.component';
import { PowerUpAnimationComponent } from './components/power-up-animation/power-up-animation.component';
import { ExerciseVideoComponent } from './components/exercise-video/exercise-video.component';
import { ShareCardComponent } from './components/share-card/share-card.component';
import { PowerAuraComponent } from './components/power-aura/power-aura.component';
import { StreakSaverComponent } from './components/streak-saver/streak-saver.component';
import { WorkoutMusicComponent } from './components/workout-music/workout-music.component';
import { SmartRestComponent } from './components/smart-rest/smart-rest.component';
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher.component';
import { FoodAnalysisComponent } from './components/food-analysis/food-analysis.component';
import { GoogleButtonComponent } from './components/google-button/google-button.component';
import { NgChartsModule } from 'ng2-charts';
import { MarkdownModule } from 'ngx-markdown';
import { ActivityGraphComponent } from './components/profile/activity-graph/activity-graph.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthGuard } from './guards/auth.guard';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ActivityGraphComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    WorkoutRoutineComponent,
    MealPlannerComponent,
    ProgressTrackerComponent,
    AICoachComponent,
    SkeletonComponent,
    ThreeSceneComponent,
    ExerciseModelViewerComponent,
    FitnessModelComponent,
    PowerLevelComponent,
    DailyChallengeComponent,
    WaterTrackerComponent,
    AchievementBadgesComponent,
    LeaderboardComponent,
    WorkoutTimerComponent,
    PowerUpAnimationComponent,
    ExerciseVideoComponent,
    ShareCardComponent,
    PowerAuraComponent,
    StreakSaverComponent,
    WorkoutMusicComponent,
    SmartRestComponent,
    ThemeSwitcherComponent,
    FoodAnalysisComponent,
    GoogleButtonComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTabsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    NgChartsModule,
    MarkdownModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

