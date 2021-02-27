import { take } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loadingLink = false;
  loadingUser = true;

  loginForm: FormGroup;

  constructor(
    public auth: AngularFireAuth,
    private fns: AngularFireFunctions,
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });
  }

  ngOnInit(): void {
    this.auth.user.pipe(take(1)).subscribe(async (user) => {
      if (user) {
        await this.auth.signOut();
        if (await this.isAccountActive(user.uid)) {
          this.router.navigate(['success']);
        }
      }
      this.loadingUser = false;
    });
  }

  async login(): Promise<void> {
    if (!this.loginForm.valid) {
      return;
    }
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    try {
      const credentials = await this.auth.signInWithEmailAndPassword(email, password);
      if (await this.isAccountActive(credentials.user.uid)) {
        this.auth.signOut();
        this.router.navigate(['success']);
        return;
      }
    } catch (error) {
      alert('Error iniciando sesión, verifique sus credenciales');
      return;
    }

    this.loadingLink = true;
    const link = await this.fns.httpsCallable('stripeOnboardAccount')(null).toPromise();
    window.location.href = link;
  }

  logout(): void {
    this.auth.signOut();
  }

  async isAccountActive(uid: string): Promise<boolean> {
    const owner = (await this.afs.collection('Owners').doc(uid).ref.get()).data() as any;
    return !!owner && !!owner.accountId && owner.isAccountActive;
  }

  get email(): AbstractControl {
    return this.loginForm.get('email');
  }
}
