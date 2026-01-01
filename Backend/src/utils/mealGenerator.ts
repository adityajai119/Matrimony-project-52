import { Meal, DailyMeals } from '../types';

const mealLibrary: { [key: string]: { [key: string]: Meal[] } } = {
  'weight loss': {
    breakfast: [
      { name: 'Greek Yogurt with Berries', calories: 250, description: '1 cup Greek yogurt, 1/2 cup mixed berries' },
      { name: 'Oatmeal with Banana', calories: 300, description: '1 cup cooked oatmeal, 1 medium banana' },
      { name: 'Scrambled Eggs with Vegetables', calories: 280, description: '2 eggs, mixed vegetables, whole grain toast' }
    ],
    lunch: [
      { name: 'Grilled Chicken Salad', calories: 350, description: '4oz grilled chicken, mixed greens, light dressing' },
      { name: 'Quinoa Bowl with Vegetables', calories: 400, description: '1 cup quinoa, roasted vegetables, olive oil' },
      { name: 'Turkey Wrap', calories: 380, description: 'Whole grain wrap, 3oz turkey, vegetables' }
    ],
    dinner: [
      { name: 'Baked Salmon with Vegetables', calories: 450, description: '5oz salmon, steamed broccoli, sweet potato' },
      { name: 'Lean Beef Stir-fry', calories: 420, description: '4oz lean beef, mixed vegetables, brown rice' },
      { name: 'Grilled Chicken with Quinoa', calories: 440, description: '5oz chicken breast, 1 cup quinoa, vegetables' }
    ],
    snacks: [
      { name: 'Apple with Almond Butter', calories: 200, description: '1 medium apple, 1 tbsp almond butter' },
      { name: 'Carrot Sticks with Hummus', calories: 150, description: 'Carrot sticks, 2 tbsp hummus' },
      { name: 'Protein Shake', calories: 180, description: '1 scoop protein powder, water or almond milk' }
    ]
  },
  'muscle gain': {
    breakfast: [
      { name: 'Protein Pancakes', calories: 550, description: '3 protein pancakes, 2 eggs, 1 banana' },
      { name: 'Egg Scramble with Toast', calories: 600, description: '4 eggs, whole grain toast, avocado' },
      { name: 'Oatmeal with Protein', calories: 580, description: '1.5 cups oatmeal, protein powder, nuts' }
    ],
    lunch: [
      { name: 'Chicken and Rice Bowl', calories: 650, description: '6oz chicken, 1.5 cups rice, vegetables' },
      { name: 'Beef and Sweet Potato', calories: 680, description: '6oz lean beef, large sweet potato, vegetables' },
      { name: 'Salmon with Pasta', calories: 620, description: '6oz salmon, whole grain pasta, vegetables' }
    ],
    dinner: [
      { name: 'Steak with Potatoes', calories: 750, description: '8oz steak, baked potato, vegetables' },
      { name: 'Chicken Pasta', calories: 720, description: '8oz chicken, pasta, marinara sauce' },
      { name: 'Pork with Rice', calories: 700, description: '7oz pork, 1.5 cups rice, vegetables' }
    ],
    snacks: [
      { name: 'Protein Shake with Banana', calories: 350, description: '2 scoops protein, banana, milk' },
      { name: 'Greek Yogurt with Nuts', calories: 300, description: '1.5 cups Greek yogurt, mixed nuts' },
      { name: 'Peanut Butter Sandwich', calories: 400, description: 'Whole grain bread, 2 tbsp peanut butter' }
    ]
  },
  'maintenance': {
    breakfast: [
      { name: 'Avocado Toast with Eggs', calories: 450, description: '2 slices whole grain toast, avocado, 2 eggs' },
      { name: 'Smoothie Bowl', calories: 420, description: 'Mixed fruits, Greek yogurt, granola' },
      { name: 'Breakfast Burrito', calories: 480, description: 'Whole grain tortilla, eggs, beans, vegetables' }
    ],
    lunch: [
      { name: 'Chicken Salad Wrap', calories: 500, description: '5oz chicken, whole grain wrap, vegetables' },
      { name: 'Pasta with Vegetables', calories: 520, description: 'Whole grain pasta, vegetables, olive oil' },
      { name: 'Quinoa Salad Bowl', calories: 480, description: 'Quinoa, mixed vegetables, feta cheese' }
    ],
    dinner: [
      { name: 'Grilled Chicken with Vegetables', calories: 550, description: '6oz chicken, roasted vegetables, rice' },
      { name: 'Fish with Quinoa', calories: 530, description: '6oz fish, quinoa, steamed vegetables' },
      { name: 'Vegetable Stir-fry with Tofu', calories: 510, description: 'Tofu, mixed vegetables, brown rice' }
    ],
    snacks: [
      { name: 'Mixed Nuts', calories: 250, description: '1/4 cup mixed nuts' },
      { name: 'Fruit and Yogurt', calories: 200, description: '1 cup Greek yogurt, mixed fruits' },
      { name: 'Trail Mix', calories: 220, description: 'Nuts, dried fruits, seeds' }
    ]
  }
};

export function generateMealPlanForGoal(goal: string, day: string): DailyMeals {
  const meals = mealLibrary[goal] || mealLibrary['maintenance'];
  const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
  
  // Rotate meals based on day
  const breakfast = meals.breakfast[dayIndex % meals.breakfast.length];
  const lunch = meals.lunch[dayIndex % meals.lunch.length];
  const dinner = meals.dinner[dayIndex % meals.dinner.length];
  const snacks = [
    meals.snacks[dayIndex % meals.snacks.length],
    meals.snacks[(dayIndex + 1) % meals.snacks.length]
  ];
  
  const totalCalories = breakfast.calories + lunch.calories + dinner.calories + 
    snacks.reduce((sum, snack) => sum + snack.calories, 0);
  
  return {
    breakfast,
    lunch,
    dinner,
    snacks,
    totalCalories
  };
}

