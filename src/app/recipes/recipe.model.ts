import { Ingredient } from '../shared/ingredient.model';

export class Recipe {
  public isFromEdamam: boolean;
  public recipeId: number;
  public name: string;
  public instruction: string;
  public imagePath: string;
  public ingredients: Ingredient[];
  public externalUrl: string;
  public cuisineType: Cuisine[];
  public mealType: Meal[];

  constructor(
    name: string,
    desc: string,
    imagePath: string,
    ingredients: Ingredient[],
    externalUrl?: string,
    cuisineType?: Cuisine[],
    mealType?: Meal[],
    recipeId?: number,
    isFromEdamam?: boolean,
  ) {
    this.isFromEdamam = isFromEdamam || false;
    this.recipeId = recipeId;
    this.name = name;
    this.instruction = desc;
    this.imagePath = imagePath;
    this.ingredients = ingredients;
    this.externalUrl = externalUrl;
    this.cuisineType = cuisineType;
    this.mealType = mealType;
  }
}

export class RecipeAttachedTerm {
  public term: string;
  public recipe: Recipe;

  constructor(term: string, recipe: Recipe) {
    this.term = term;
    this.recipe = recipe;
  }
}

export enum Cuisine {
  American = 'american',
  Asian = 'asian',
  British = 'british',
  Caribbean = 'caribbean',
  Central_Europe = 'central europe',
  Chinese = 'chinese',
  Easter_Europe = 'easter europe',
  French = 'french',
  Indian = 'indian',
  Italian = 'italian',
  Japanese = 'japanese',
  Kosher = 'kosher',
  Mediterranean = 'mediterranean',
  Mexican = 'mexican',
  Nordic = 'nordic',
  South_American ='south american',
  South_East_Asian = 'south east asian',
  Others = 'others',
}

export enum Meal {
  Breakfast = 'breakfast',
  Lunch = 'lunch',
  Dinner = 'dinner',
  Snack = 'snack',
  Teatime = 'teatime',
}
