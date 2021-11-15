import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ref, uploadBytesResumable } from 'firebase/storage';

import { RecipeService } from '../recipe.service';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { FirebaseService } from '../../services/firebase.service';
import { Cuisine, Meal } from '../recipe.model';
import { FIREBASE_STORAGE_ENDPOINT, FIREBASE_STORAGE_SUFFIX } from '../../shared/constants';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  recipe;
  recipeForm: FormGroup;
  hovering = false;
  isUploadingImage = false;
  isLocalImage;
  cuisineTypes = {};
  cuisineTypeDropdownOpen = false;
  mealTypes = {};
  mealTypeDropdownOpen = false;

  get ingredientsControls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private router: Router,
    private firebaseSerivce: FirebaseService,
    private dataStorageService: DataStorageService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null;
      this.initForm();
      this.setCuisineTypes();
      this.setMealTypes();
    });
  }

  onSubmit() {
    // const newRecipe = new Recipe(
    //   this.recipeForm.value['name'],
    //   this.recipeForm.value['instruction'],
    //   this.recipeForm.value['imagePath'],
    //   this.recipeForm.value['ingredients']);
    if (this.editMode) {
      this.recipeService.updateRecipe(this.id, this.withAllFields(this.recipeForm.value));
    } else {
      const newRecipe = this.withAllFields(this.recipeForm.value);
      // newRecipe.cuisineType = ['other'];
      this.recipeService.addRecipe(newRecipe);
    }
    this.dataStorageService.storeRecipes();
    this.onCancel();
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        name: new FormControl(null, Validators.required),
        amount: new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/)
        ]),
        unit: new FormControl(null)
      })
    );
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onHover(h) {
    this.hovering = h;
  }

  uploadImageFromLocal(event) {
    if (!this.isUploadingImage) {
      const file = event.target.files?.[0];
      if (file) {
        const imageRef = ref(this.firebaseSerivce.storage, `userImages/${file.name}`);
        this.isUploadingImage = true;
        const uploadTask = uploadBytesResumable(imageRef, event.target.files[0]);
        uploadTask.on(
          'state_changed',
          () => {},
          () => { this.isUploadingImage = false; },
          () => {
            this.isUploadingImage = false;
            const fileUrl = FIREBASE_STORAGE_ENDPOINT + file.name + FIREBASE_STORAGE_SUFFIX;
            this.recipeForm.get('imagePath').patchValue(fileUrl);
            this.isLocalImage = true;
          });
      }
    }
  }

  setCuisineTypes() {
    Object.values(Cuisine).forEach(c => {
      this.cuisineTypes[c] = this.recipe.cuisineType.indexOf(c) > -1;
    });
  }

  setMealTypes() {
    Object.values(Meal).forEach(c => {
      this.mealTypes[c] = this.recipe.mealType.indexOf(c) > -1;
    });
  }

  private withAllFields(recipe) {
    const isLocalImage = this.isLocalImage !== undefined ? this.isLocalImage : true;
    const cuisineType = [];
    Object.keys(this.cuisineTypes).forEach(c => {
      if (this.cuisineTypes[c]) {
        cuisineType.push(c);
      }
    });
    const mealType = [];
    Object.keys(this.mealTypes).forEach(c => {
      if (this.mealTypes[c]) {
        mealType.push(c);
      }
    });
    return Object.assign(recipe, { isLocalImage, cuisineType, mealType });
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeInstruction = '';
    let recipeIngredients = new FormArray([]);

    if (this.editMode) {
      const recipe = this.recipeService.getRecipe(this.id);
      this.recipe = recipe;
      recipeName = recipe.name;
      recipeImagePath = recipe.imagePath;
      recipeInstruction = recipe.instruction;
      this.isLocalImage = recipe.isLocalImage;
      if (recipe['ingredients']) {
        for (let ingredient of recipe.ingredients) {
          recipeIngredients.push(
            new FormGroup({
              name: new FormControl(ingredient.name, Validators.required),
              amount: new FormControl(ingredient.amount, [
                Validators.required,
                Validators.pattern(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/)
              ]),
              unit: new FormControl(ingredient.unit)
            })
          );
        }
      }
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName, Validators.required),
      imagePath: new FormControl(recipeImagePath, Validators.required),
      instruction: new FormControl(recipeInstruction),
      ingredients: recipeIngredients
    });
  }
}
