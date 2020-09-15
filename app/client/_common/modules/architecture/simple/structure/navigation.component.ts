
import { Component, Input, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'simple-navigation',
  //[FIXME]: in one css file for Simple
  styles: [`
    .navbar {
      margin-top: 20px;
      -webkit-box-shadow: inset 0 1px 3px rgba(0,0,0,.05), 0 1px 0 rgba(255,255,255,.1) !important;
      box-shadow: inset 0 1px 3px rgba(0,0,0,.05), 0 1px 0 rgba(255,255,255,.1) !important;
      background-image: -webkit-linear-gradient(top,#e8e8e8 0,#f5f5f5 100%) !important;
      background-image: -webkit-gradient(linear,left top,left bottom,from(#e8e8e8),to(#f5f5f5)) !important;
      background-image: linear-gradient(to bottom,#e8e8e8 0,#f5f5f5 100%) !important;
      border: 1px solid #e3e3e3 !important;
      border-radius: 2px;
      background-color: #f5f5f5 !important;
      background-repeat: repeat-x !important;
    }

    .navbar-default { border-width: 0; box-shadow: none; }

    .navbar .container {
      border-width: 0;
      box-shadow: none;
    }

    .navbar .container .navbat-header {
      border-width: 0;
      box-shadow: none;
    }

    .navbar-brand { position: relative; z-index: 2; }

    .navbar-nav.navbar-right .btn { position: relative; z-index: 2; padding: 4px 20px; margin: 10px auto; }

    .navbar .navbar-collapse { position: relative; }
    .navbar .navbar-collapse .navbar-right > li { padding-right: 9px; }
    .navbar .navbar-collapse .navbar-right > li:last-child { padding-right: 27px; }

    .navbar li>a:hover,li>a:focus,li>a:active
    {
      background-position: 0 -31px;
    }

    .navbar .nav-collapse { position: absolute; z-index: 1; top: 0; left: 0; right: 0; bottom: 0; margin: 0; padding-right: 120px; padding-left: 80px; width: 100%; }
    .navbar.navbar-default .nav-collapse { background-color: #f8f8f8; }
    .navbar.navbar-inverse .nav-collapse { background-color: #222; }
    .navbar .nav-collapse .navbar-form { border-width: 0; box-shadow: none; }
    .nav-collapse>li { float: right; }

    @media screen and (max-width: 767px) {
        .navbar .navbar-collapse .navbar-right > li { padding-left: 15px; padding-right: 15px; }
        .navbar .navbar-collapse .navbar-right > li:last-child { padding-right: 15px; }

        .navbar .nav-collapse { margin: 7.5px auto; padding: 0; }
        .navbar .nav-collapse .navbar-form { margin: 0; }
        .nav-collapse>li { float: none; }
    }
  `],
  template: `
    <nav class="navbar navbar-default">
      <div class="container-fluid">

        <div class="navbar-header">
          <button
            type="button"
            class="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <span class="navbar-brand" href="javascript:;">{{brand}}</span>
        </div>

        <div class="collapse navbar-collapse" id="navbar-collapse">
          <ul class="nav navbar-nav navbar-right">
            <li *ngFor="let route of cutRecurringPaths(routes);">
              <a
                role="button"
                [routerLink]="[ (route.addWithoutBase)?(''):(baseLink + '/') + route.path ]"
                class="btn btn-default"
                [attr.linkRouter]="route.path">
                {{route.path.charAt(0).toUpperCase() + route.path.slice(1)}}
              </a>
            </li>
            <li>
              <a
                role="button"
                (click)="onClickLastButton($event)"
                [routerLink]="linkLastButton"
                class="btn btn-default">
                {{labelLastButton}}
              </a>
            </li>
          </ul>
        </div>

      </div>
    </nav>
  `
})
export class SimpleNavigationComponent
{
  @Input('brand') brand: string = '';
  @Input('base-link') baseLink: string = '';
  @Input('routes') routes: any[] = [];
  @Input('link-last-button') linkLastButton: any[] = [];
  @Input('label-last-button') labelLastButton: string = 'Logout';

  @Output('on-click-last-button') onClickLastButtonNavigation = new EventEmitter();

  //[TODO]: add logo simple near brand
  //[TODO]: changing the brand

  constructor(private element: ElementRef) {}

  //[FIXME]: Pipe chyba do tego powinnienem uzyc
  private cutRecurringPaths (routes: any[])
  {
    let newRoutes = [];
    routes.forEach((route)=>{
      if (newRoutes.length == 0 || route.path != newRoutes[newRoutes.length-1].path) 
        newRoutes.push(route);
    });
    return newRoutes;
  }

  public navigate (linkRouter: any)
  {
    try
    {
      this.element.nativeElement.querySelector("a[linkRouter=\'" + linkRouter + "\']").click();
    }
    catch(err)
    {
      console.error(err);
    }
  }

  onClickLastButton ()
  {
    this.onClickLastButtonNavigation.emit(undefined);
  }
}
