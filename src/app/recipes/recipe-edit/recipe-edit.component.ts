import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ref, uploadBytesResumable } from 'firebase/storage';

import { RecipeService } from '../recipe.service';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { FirebaseService } from '../../services/firebase.service';
import { FIREBASE_STORAGE_ENDPOINT, FIREBASE_STORAGE_SUFFIX } from '../../shared/constants';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  recipeForm: FormGroup;
  hovering = false;
  isUploadingImage = false;
  isLocalImage;

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
    });
  }

  onSubmit() {
    // const newRecipe = new Recipe(
    //   this.recipeForm.value['name'],
    //   this.recipeForm.value['instruction'],
    //   this.recipeForm.value['imagePath'],
    //   this.recipeForm.value['ingredients']);
    if (this.editMode) {
      this.recipeService.updateRecipe(this.id, this.withIsLocalImage(this.recipeForm.value));
    } else {
      const newRecipe = this.withIsLocalImage(this.recipeForm.value);
      newRecipe.cuisineType = ['other'];
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

  private withIsLocalImage(recipe) {
    const isLocalImage = this.isLocalImage !== undefined ? this.isLocalImage : true;
    return Object.assign(recipe, { isLocalImage });
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeInstruction = '';
    let recipeIngredients = new FormArray([]);

    if (this.editMode) {
      const recipe = this.recipeService.getRecipe(this.id);
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
