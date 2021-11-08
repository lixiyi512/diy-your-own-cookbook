import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBYISN_mgDWfuRw8PXh5ikKNodGhH34YnU',
  authDomain: 'dyi-cookbook.firebaseapp.com',
  databaseURL: 'https://dyi-cookbook-default-rtdb.firebaseio.com',
  projectId: 'dyi-cookbook',
  storageBucket: 'dyi-cookbook.appspot.com',
  messagingSenderId: '833622842087',
  appId: '1:833622842087:web:3168cf6756b020c51fe042',
  measurementId: 'G-JLKP1RXJE3'
};

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  public app;
  public storage;

  initFirebase() {
    this.app = initializeApp(firebaseConfig);
    this.storage = getStorage(this.app);
  }
}
