
import { Routes, RouterModule } from '@angular/router';
import { ContentGuard } from './content.guard';
import { ContentComponent } from './content.component';
import { modules } from '../content/index';

const contentRoutes: Routes = [
    {
      path: '',
      component: ContentComponent,
      canActivate: [ContentGuard],
      children: modules.routes
    },
    { path: '**', redirectTo: '' },
];

export const ContentRouting = RouterModule.forChild(contentRoutes);
