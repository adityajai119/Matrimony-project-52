import { Exercise } from '../types';

const exerciseLibrary: { [key: string]: Exercise[] } = {
  'weight loss': [
    { name: 'Cardio Warm-up', sets: 1, reps: '10 minutes', instructions: 'Light jogging or brisk walking' },
    { name: 'Burpees', sets: 3, reps: '10-15', instructions: 'Full body exercise: squat, jump, push-up, jump' },
    { name: 'Jumping Jacks', sets: 3, reps: '30-50', instructions: 'Stand with feet together, jump while raising arms' },
    { name: 'Mountain Climbers', sets: 3, reps: '20-30', instructions: 'In plank position, alternate bringing knees to chest' },
    { name: 'High Knees', sets: 3, reps: '30 seconds', instructions: 'Run in place, bringing knees up high' },
    { name: 'Plank', sets: 3, reps: '30-60 seconds', instructions: 'Hold plank position, keep body straight' },
    { name: 'Squats', sets: 3, reps: '15-20', instructions: 'Lower body until thighs parallel to floor' },
    { name: 'Lunges', sets: 3, reps: '12 each leg', instructions: 'Step forward, lower back knee toward ground' }
  ],
  'muscle gain': [
    { name: 'Push-ups', sets: 4, reps: '10-15', instructions: 'Keep body straight, lower chest to ground' },
    { name: 'Pull-ups/Chin-ups', sets: 4, reps: '8-12', instructions: 'Hang from bar, pull body up until chin over bar' },
    { name: 'Dumbbell Shoulder Press', sets: 4, reps: '8-12', instructions: 'Press weights overhead, control descent' },
    { name: 'Barbell/Dumbbell Rows', sets: 4, reps: '8-12', instructions: 'Bend over, pull weight to lower chest' },
    { name: 'Squats', sets: 4, reps: '8-12', instructions: 'Lower until thighs parallel, drive through heels' },
    { name: 'Deadlifts', sets: 4, reps: '6-10', instructions: 'Lift weight from ground, keep back straight' },
    { name: 'Bench Press', sets: 4, reps: '8-12', instructions: 'Lower bar to chest, press up explosively' },
    { name: 'Bicep Curls', sets: 3, reps: '10-12', instructions: 'Curl weight to shoulders, control descent' },
    { name: 'Tricep Dips', sets: 3, reps: '10-15', instructions: 'Lower body by bending arms, push back up' }
  ],
  'maintenance': [
    { name: 'Warm-up Cardio', sets: 1, reps: '5-10 minutes', instructions: 'Light jogging or cycling' },
    { name: 'Push-ups', sets: 3, reps: '10-15', instructions: 'Standard push-up form' },
    { name: 'Squats', sets: 3, reps: '12-15', instructions: 'Bodyweight squats' },
    { name: 'Plank', sets: 3, reps: '30-45 seconds', instructions: 'Hold plank position' },
    { name: 'Lunges', sets: 3, reps: '10 each leg', instructions: 'Alternating forward lunges' },
    { name: 'Bicep Curls', sets: 3, reps: '12-15', instructions: 'Light weights or resistance bands' },
    { name: 'Stretching', sets: 1, reps: '10 minutes', instructions: 'Full body stretching routine' }
  ]
};

export function generateWorkoutForGoal(goal: string, day: string): Exercise[] {
  const exercises = exerciseLibrary[goal] || exerciseLibrary['maintenance'];
  
  // Rotate exercises based on day to provide variety
  const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
  const selectedExercises: Exercise[] = [];
  
  // Select 4-6 exercises per day
  const numExercises = goal === 'muscle gain' ? 5 : 4;
  
  for (let i = 0; i < numExercises; i++) {
    const exerciseIndex = (dayIndex * numExercises + i) % exercises.length;
    selectedExercises.push(exercises[exerciseIndex]);
  }
  
  return selectedExercises;
}

