import { Component, OnInit } from '@angular/core';
import { DataStorageService } from '../services/data-storage.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {

  constructor(
    private dataStorageService: DataStorageService,
  ) { }

  ngOnInit() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

}
