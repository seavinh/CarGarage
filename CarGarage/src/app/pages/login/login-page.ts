import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  login = output<{ emailOrUsername: string; password: string }>();
  register = output<{ name: string; email: string; username: string; password: string }>();
  serverError = input<string>('');
  isLoading = input<boolean>(false);

  mode = signal<'login' | 'register'>('login');
  error = signal<string>('');

  loginCreds = { emailOrUsername: '', password: '' };
  registerData = { name: '', email: '', username: '', password: '', confirmPassword: '' };

  onLogin() {
    this.error.set('');
    if (!this.loginCreds.emailOrUsername.trim()) {
      this.error.set('Email or username is required');
      return;
    }
    if (!this.loginCreds.password) {
      this.error.set('Password is required');
      return;
    }
    this.login.emit(this.loginCreds);
  }

  onRegister() {
    this.error.set('');
    if (!this.registerData.name.trim()) {
      this.error.set('Full name is required');
      return;
    }
    if (!this.registerData.email.trim()) {
      this.error.set('Email is required');
      return;
    }
    if (!this.registerData.username.trim()) {
      this.error.set('Username is required');
      return;
    }
    if (!this.registerData.password) {
      this.error.set('Password is required');
      return;
    }
    if (this.registerData.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    const { confirmPassword, ...data } = this.registerData;
    this.register.emit(data);
  }

  switchMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.error.set('');
  }
}
