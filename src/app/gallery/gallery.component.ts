import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStorageService } from '../services/data-storage.service';
import { RecipeService } from '../recipes/recipe.service';
import { Recipe } from '../recipes/recipe.model';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  recipes: Recipe[];

  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private dataStorageService: DataStorageService,
  ) {}

  responsiveOptions:any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  ngOnInit() {
    this.dataStorageService.fetchRecipes().subscribe(() => {
      this.recipes = this.recipeService.getRecipes().filter(r => r.isLocalImage || r.isLocalImage === undefined);
    });
  }

  toRecipeDetail(item) {
    this.router.navigateByUrl(`/recipes/${item.recipeId}`);
  }
}
