import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeAttachedTerm, Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { EdamamService } from '../../services/edamam.service';
import { DataStorageService } from '../../services/data-storage.service';

@Component({
  selector: 'app-recipe-search',
  templateUrl: './recipe-search.component.html',
  styleUrls: ['./recipe-search.component.css'],
})
export class RecipeSearchComponent {
  public searchResults: RecipeAttachedTerm[] = [];
  public backupResults: RecipeAttachedTerm[] = [];
  public searchInput: string;
  public filters = [];

  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private edamamService: EdamamService,
    private dataStorageService: DataStorageService
  ) {
    this.router.events.subscribe(() => {
      this.searchResults = [];
    })
  }

  search() {
    const results = [];
    if (this.searchInput !== '') {
      const pool = this.recipeService.getRecipePool();
      this.searchInRecipePool(this.searchInput.split(' '), pool, results);
      this.searchInEdamam(this.searchInput, results);
    }
  }

  onKeyUp(e) {
    if (this.searchInput === '') {
      this.searchResults = [];
      return;
    }
    if (e.code === 'Enter') {
      this.search();
    }
  }

  searchInRecipePool(word: string[], pool: RecipeAttachedTerm[], res: RecipeAttachedTerm[]) {
    const resIds = [];
    pool.forEach(element => {
      if (resIds.indexOf(element.recipe.recipeId) === -1) {
        word.forEach(w => {
          if (w !== '' && element.term.toLowerCase().indexOf(w.toLowerCase()) > -1) {
            res.push(element);
            resIds.push(element.recipe.recipeId);
          }
        });
      }
    });
  }

  searchInEdamam(input, results) {
    this.edamamService.searchRecipeInEdamamAPI(input).subscribe((res) => {
      results.push(...res.map(r => this.convertToRecipeAttachedTerm(r)));
      this.searchResults = results;
      this.backupResults = this.searchResults;
      this.buildFilters(results);
    })
  }

  clickTitle(recipe: Recipe) {
    if (recipe.isFromEdamam) {
      window.open(recipe.externalUrl, '_blank').focus();
    } else {
      this.searchResults = [];
      this.router.navigateByUrl(`/recipes/${recipe.recipeId}`);
    }
  }

  addToLocal(rcp: Recipe) {
    rcp.isFromEdamam = false;
    rcp.isLocalImage = false;
    rcp.recipeId = this.recipeService.getRecipes().length;
    this.recipeService.addRecipe(rcp);
    this.dataStorageService.storeRecipes();
  }

  buildFilters(recipes: RecipeAttachedTerm[]) {
    if (recipes.length) {
      const res = [
        {
          name: 'Cuisines',
          isOpen: false,
          values: {},
        },
        {
          name: 'Meal Types',
          isOpen: false,
          values: {},
        },
      ];
      recipes.forEach(({ recipe }) => {
        recipe.cuisineType?.forEach(c => this.addElementTo(c, res[0].values));
        recipe?.mealType?.forEach(m => this.addElementTo(m, res[1].values));
      });
      this.filters = res;
    } else {
      this.filters = [];
    }
  }

  onFilterResults(filters) {
    if (filters.every(filter => this.allPropertiesAreFalse(filter.values))) {
      this.searchResults = this.backupResults;
      return;
    }
    this.searchResults = this.backupResults.filter(({ recipe }) => {
      return recipe.cuisineType.some(c => filters[0].values[c]) || recipe.mealType.some(m => filters[1].values[m]);
    });
  }

  private addElementTo(key, obj) {
    if (obj[key] === undefined) {
      obj[key] = false;
    }
  }

  private allPropertiesAreFalse(obj) {
    return Object.keys(obj).every((k) => !obj[k])
  }

  private convertToRecipeAttachedTerm(r) {
    return new RecipeAttachedTerm('', r);
  }
}
