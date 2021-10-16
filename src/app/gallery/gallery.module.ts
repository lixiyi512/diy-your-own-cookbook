import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GalleryComponent } from './gallery.component';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../auth/auth.guard';

@NgModule({
  declarations: [
    GalleryComponent
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: GalleryComponent, canActivate: [AuthGuard], },
    ]),
    SharedModule
  ]
})
export class GalleryModule {}
