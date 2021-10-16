import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import { EDAMAM_DOMAIN } from '../shared/constants';
import { Ingredient } from '../shared/ingredient.model';
import { MOCK_EDAMAM_RESULTS } from './mock-edamam-results';

const ACCESS_POINT = `https://${EDAMAM_DOMAIN}/api/recipes/v2`;
const APP_ID = 'fd59a4e5';
const APP_KEY = '291713e5ce66880ebae0e0e60c58fabb';

const useMock = true;

@Injectable({ providedIn: 'root' })
export class EdamamService {
  constructor(
    private http: HttpClient,
    private recipeService: RecipeService
  ) {}

  searchRecipeInEdamamAPI(query: string): Observable<Recipe[]> {
    if (useMock) {
      // @ts-ignore
      return of(MOCK_EDAMAM_RESULTS);
    }

    const params = new HttpParams()
      .set('type', 'public')
      .set('q', query)
      .set('app_id', APP_ID)
      .set('app_key', APP_KEY);
    return this.http
      .get(ACCESS_POINT, { params })
      .pipe(
        map((res: any)=> {
          const ret: Recipe[] = [];
          res.hits.forEach(({ recipe }) => {
            ret.push(new Recipe(
              recipe.label,
              '',
              recipe.image,
              recipe.ingredients?.map(ing =>
                new Ingredient(
                  ing.food,
                  ing.quantity,
                  ing.measure,
                  ing.text,
                )
              ),
              recipe.url,
              recipe.cuisineType,
              recipe.mealType,
              null,
              true,
            ));
          });
          return ret;
        })
      );
  }
}
