import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup-component.html',
  styleUrls: ['./signup-component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  newUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.authService.signup(this.signupForm.value).subscribe({
        next: (user: User) => {
          this.newUser = user;
          console.log('Signup successful', user);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          if (error.message === 'Email already in use') {
            this.errorMessage =
              'Email already in use. Please login or signup with a different email.';
          } else {
            this.errorMessage = 'Signup failed. Please try again.';
          }
        },
      });
    }
  }
}
