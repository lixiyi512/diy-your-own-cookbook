import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Recipe, RecipeAttachedTerm } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

@Injectable()
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  // private recipes: Recipe[] = [
  //   new Recipe(
  //     'Tasty Schnitzel',
  //     'A super-tasty Schnitzel - just awesome!',
  //     'https://upload.wikimedia.org/wikipedia/commons/7/72/Schnitzel.JPG',
  //     [new Ingredient('Meat', 1), new Ingredient('French Fries', 20)]
  //   ),
  //   new Recipe(
  //     'Big Fat Burger',
  //     'What else you need to say?',
  //     'https://upload.wikimedia.org/wikipedia/commons/b/be/Burger_King_Angus_Bacon_%26_Cheese_Steak_Burger.jpg',
  //     [new Ingredient('Buns', 2), new Ingredient('Meat', 1)]
  //   )
  // ];
  private recipes: Recipe[] = [];
  private recipePool: RecipeAttachedTerm[] = [];

  constructor(private slService: ShoppingListService) {}

  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
    this.recipePool = this.buildRecipePool(recipes);
  }

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(index: number) {
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }

  addRecipe(recipe: Recipe) {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
    this.recipePool = this.buildRecipePool(this.recipes);
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
    this.recipePool = this.buildRecipePool(this.recipes);
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
    this.recipePool = this.buildRecipePool(this.recipes);
  }

  buildRecipePool(recipes: Recipe[]): RecipeAttachedTerm[] {
    return recipes.reduce((accu: RecipeAttachedTerm[], curr: Recipe) => {
      curr.name.split(' ').forEach((term) => {
        accu.push({
          term,
          recipe: curr,
        });
      });
      curr.ingredients.map(i => i.name).forEach((name) => {
        name.split(' ').forEach(term => {
          accu.push({
            term,
            recipe: curr,
          });
        });
      });
      return accu;
    }, [] as RecipeAttachedTerm[]);
  }

  getRecipePool(): RecipeAttachedTerm[] {
    return this.recipePool;
  }

  addMissingFields(recipes): Recipe[] {
    return recipes.map((recipe) => ({
      ...recipe,
      cuisineType: recipe.cuisineType?.length ? recipe.cuisineType : ['others'],
      mealType: recipe.mealType?.length ? recipe.mealType : ['others'],
    }));
  }
}
