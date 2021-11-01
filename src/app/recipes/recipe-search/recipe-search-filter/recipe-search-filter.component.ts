import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-recipe-search-filter',
  templateUrl: './recipe-search-filter.component.html',
  styleUrls: ['./recipe-search-filter.component.css'],
})
export class RecipeSearchFilterComponent {
  @Input() filters = [];
  @Output() confirm: EventEmitter<any> = new EventEmitter<any>();
}
