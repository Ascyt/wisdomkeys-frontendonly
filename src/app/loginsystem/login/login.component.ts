import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendService } from '../../backend.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgbTooltip],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string|undefined = undefined;

  constructor(public backendService:BackendService, private router:Router) {
    this.error = undefined;
  }
  
  onSubmit() {
    this.backendService.login(this.username, this.password)
      .then((response) => {
        this.router.navigate(['/']);
        setTimeout(() => {
          window.location.reload();
        });
      })
      .catch((error) => {
          this.error = error.error || 'Login failed';
          console.error('Error: Login failed', error);
      });
  }
}