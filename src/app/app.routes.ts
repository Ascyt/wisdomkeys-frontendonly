import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RedirectGuard } from './redirect.guard';
import { RedirectingComponent } from './redirecting/redirecting.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { InitializeComponent } from './initialize/initialize.component';
import { PracticeComponent } from './practice/practice.component';
import { LoginComponent } from './loginsystem/login/login.component';
import { SignupComponent } from './loginsystem/signup/signup.component';
import { AccountComponent } from './loginsystem/account/account.component';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'initialize', component: InitializeComponent},
    {path: 'practice', component: PracticeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'account', component: AccountComponent},
    {path: '**', component: NotFoundComponent}
];
