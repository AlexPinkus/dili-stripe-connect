import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  errorMessage = '';
  loading = false;
  loginForm: FormGroup;

  constructor(public auth: AngularFireAuth, private fns: AngularFireFunctions, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });
  }

  async login(): Promise<void> {
    if (!this.loginForm.valid) {
      return;
    }
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    try {
      await this.auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      alert('Error iniciando sesión, verifique sus credenciales');
      return;
    }

    this.loading = true;
    const link = await this.fns.httpsCallable('stripeOnboardAccount')(null).toPromise();
    this.loading = false;
    window.location.href = link;
  }

  logout(): void {
    this.auth.signOut();
  }

  get email(): AbstractControl {
    return this.loginForm.get('email');
  }
}
