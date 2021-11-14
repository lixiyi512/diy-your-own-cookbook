import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
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
    SharedModule,
    GalleriaModule
  ]
})
export class GalleryModule {}
