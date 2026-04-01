import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },

  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home, pathMatch: 'full' },
    ],
  },
];
