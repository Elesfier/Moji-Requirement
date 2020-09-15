
import { RequirementsComponent } from './requirements/requirements.component';
import { ProjectsComponent } from './projects/projects.component';
import { ReviewComponent } from './review/review.component';
import { AdminComponent } from './admin/admin.component';

const ContentRoutes = [
  {
    path: 'projects',
    component: ProjectsComponent,
    default: true
  },
  {
    path: 'requirements',
    component: RequirementsComponent
  },
  {
    path: 'reviews',
    component: ReviewComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  }
];

export const AdminRoute = {
    path: 'admin',
    component: AdminComponent
};

class Modules
{
  public components = [];
  public routes = [];

  constructor ()
  {
    this.routes = [].concat(ContentRoutes);
    this.getComponents();
  }

  private getComponents ()
  {
    let checkers = [ this.routes ];
    for (let i = 0; i < checkers.length; ++i)
    {
      if (checkers[i])
      {
        checkers = checkers.concat(checkers[i].map(function(item){
          return item['children'];
        }));

        this.components = this.components.concat(checkers[i].map(function(item){
          
          return item['component'];
        }));
      }
    }

  }
}

export const modules = new Modules();