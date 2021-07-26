import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ShoppingListComponent } from './shopping-list.component';
import { ShoppingEditComponent } from './shopping-edit/shopping-edit.component';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../auth/auth.guard';
import { StoreMapComponent } from './store-map/store-map.component';

@NgModule({
  declarations: [
    ShoppingListComponent,
    ShoppingEditComponent,
    StoreMapComponent
  ],
  imports: [
    FormsModule,
    RouterModule.forChild([
      { path: '', component: ShoppingListComponent, canActivate: [AuthGuard], },
    ]),
    SharedModule
  ]
})
export class ShoppingListModule {}
