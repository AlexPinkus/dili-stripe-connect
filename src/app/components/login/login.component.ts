import firebase from 'firebase/app';

import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loading = false;

  constructor(
    public auth: AngularFireAuth,
    private fns: AngularFireFunctions
  ) {}

  async login(): Promise<void> {
    await this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

    this.loading = true;
    const link = await this.fns
      .httpsCallable('stripeOnboardAccount')(null)
      .toPromise();
    this.loading = false;
    window.location.href = link;
  }

  logout(): void {
    this.auth.signOut();
  }
}
