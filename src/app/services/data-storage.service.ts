import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap, take, exhaustMap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';

interface UserData {
  email: string;
  id: string;
  recipes: Recipe[];
}

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(
    private http: HttpClient,
    private recipeService: RecipeService
  ) {}

  storeRecipes() {
    const { email, id } = JSON.parse(localStorage.getItem('userData'));
    // Don't pass recipeId to back end
    const recipes = this.recipeService.getRecipes().map(({ recipeId, isFromEdamam, ...props}) => props);
    this.http
      .put(
        `https://dyi-cookbook-default-rtdb.firebaseio.com/users/${id}/recipes.json`,
        recipes
      )
      .subscribe(response => {
        console.log(response);
      });
  }

  fetchRecipes() {
    const { id } = JSON.parse(localStorage.getItem('userData'));
    return this.http
      .get<Recipe[]>(
        `https://dyi-cookbook-default-rtdb.firebaseio.com/users/${id}/recipes.json`
      )
      .pipe(
        map(recipes => {
          if (!recipes) {
            return [];
          }
          // recipeId from front end only
          return recipes.map((recipe, recipeId) => {
            return {
              ...recipe,
              recipeId,
              isFromEdamam: false,
              ingredients: recipe.ingredients ? recipe.ingredients : []
            };
          });
        }),
        tap(recipes => {
          this.recipeService.setRecipes(recipes);
        })
      );
  }
}
