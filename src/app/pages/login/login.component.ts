import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButton,
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';

  constructor(private authService: AuthService) {
  }

  async register() {
    await this.authService.register(this.username);
  }
}
