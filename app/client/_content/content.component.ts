
import { Component, ViewChild, AfterContentInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  LocalStorageService,
  SimpleLoaderComponent,
  SimpleNavigationComponent
} from '../_common/index';
import { modules, AdminRoute } from '../content/index';

@Component({
    templateUrl: 'content.component.html'
})

export class ContentComponent
{
  @ViewChild('contentLoader', {static: false})
  public $loader: SimpleLoaderComponent;

  @ViewChild('mainContentNavigation', {static: false})
  public $navigation: SimpleNavigationComponent;

  private brand: string = 'Moji - Requirements Management';
  private baseLink: string = '/moji';

  routes: any = modules.routes;

  constructor (private localStorageService: LocalStorageService)
  {
  }

  private adminRoute = AdminRoute;

  ngOnInit() {
    console.log(JSON.parse(localStorage.getItem('IS_ADMIN')));
    if (JSON.parse(localStorage.getItem('IS_ADMIN')) !== true) {
      let index = -1;
      this.routes.forEach((route, i)=>{
        if (route.path == "admin") {
          this.adminRoute = route;
          index = i;
        }
      });
      if (index !== -1)
        this.routes.splice(index);
    } else {
      let index = -1;
      this.routes.forEach((route, i)=>{
        if (route.path == "admin") {
          this.adminRoute = route;
          index = i;
        }
      });
      if (index === -1 && this.adminRoute)
        this.routes.push(this.adminRoute);
    }
  }

  ngAfterViewInit ()
  { 
    this.routes.forEach(route => {
      if (route.default) {
        this.$navigation.navigate(route.path);
      }
    });
  }

  onActivate ($event)
  {
    //TODO Rozwiazanie tymczasowe
    setTimeout((()=>{
      if (this.$loader) this.$loader.stop();
    }).bind(this), 100);
  }

  onDeactivate ($event)
  {
    if (this.$loader) this.$loader.start();
  }

  removeToken ()
  {
    this.localStorageService.rev('IS_ADMIN');
    return this.localStorageService.rev('MOJI_TOKEN');
  }

}
