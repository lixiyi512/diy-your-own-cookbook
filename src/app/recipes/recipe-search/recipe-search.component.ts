import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeAttachedTerm, Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { EdamamService } from '../../services/edamam.service';

@Component({
  selector: 'app-recipe-search',
  templateUrl: './recipe-search.component.html',
  styleUrls: ['./recipe-search.component.css'],
})
export class RecipeSearchComponent {
  public searchResults: RecipeAttachedTerm[] = [];
  public searchInput: string;

  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private edamamService: EdamamService,
  ) {}

  search() {
    const results = [];
    if (this.searchInput !== '') {
      const pool = this.recipeService.getRecipePool();
      this.searchInRecipePool(this.searchInput.split(' '), pool, results);
      this.searchInEdamam(this.searchInput, results);
    }
    this.searchResults = results;
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
      console.log(res);
      results.push(...res.map(r => this.convertToRecipeAttachedTerm(r)));
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

  private convertToRecipeAttachedTerm(r) {
    return new RecipeAttachedTerm('', r);
  }
}
