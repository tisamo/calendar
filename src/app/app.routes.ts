import {Routes} from '@angular/router';
import {signInGuard} from './guards/sign-in..guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [signInGuard],
    loadComponent: () => import('./pages/home/home.component').then((mod => mod.HomeComponent))
  },
  {path: 'login', loadComponent: () => import('./pages/login/login.component').then((mod => mod.LoginComponent))},
  {path: '**', redirectTo: '/'}

];