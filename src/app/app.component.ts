import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './services/firebase.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
  ) {}

  ngOnInit() {
    this.firebaseService.initFirebase();
    this.authService.autoLogin();
  }
}
