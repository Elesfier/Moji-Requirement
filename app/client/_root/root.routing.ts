
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent, LoginGuard } from './login/index';
import { RegisterComponent } from './register/index';
import { ContentGuard } from '../_content/index';

const CONTENT_PATH: string = 'moji';

const appRoutes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    { path: 'register', component: RegisterComponent },
    { path: CONTENT_PATH, loadChildren: '../_content/content.module#ContentModule' },
    { path: '**', redirectTo: 'site' }
];

export const RootRouting = RouterModule.forRoot(appRoutes);
