
import { Component, Input } from '@angular/core';

@Component({
  selector: 'simple-loader',
  //[FIXME]: this should be in index.html
  styles: [`
    .loading *:not(.simple-light-loader) {
      opacity: 0.92;
      filter: alpha(opacity=92);
      pointer-events: none;
      transition: opacity 0.3s, visibility 0.3s;
      z-index: 1;
    }

    @keyframes light-spinner {
      to { transform: rotate(360deg); }
    }

    .simple-light-loader:before {
      z-index: 2000;
      content: '';
      box-sizing: border-box;
      position: absolute;
      top: 40%;
      left: 50%;
      width: 60px;
      height: 60px;
      margin-top: -15px;
      margin-left: -30px;
      border-radius: 50%;
      border: 2px solid #ccc;
      border-top-color: #006BC6;
      animation: light-spinner .6s linear infinite;
    }
  `],
  template: `
  <div [ngClass]="{ 'loading' : isLoading }">
    <ng-content></ng-content>
    <simple-light-loader
      class="simple-light-loader"
      [ngClass]="{
        'show' : isLoading,
        'hide' : !isLoading
      }">
    </simple-light-loader>
  </div>
  `
})
export class SimpleLoaderComponent
{
  //[FIXME]: opacity of loader is lower for modal

  @Input('type') type: string = 'simple';

  @Input('isLoading') public isLoading: boolean = false;

  start ()
  {
    this.isLoading = true;
  }

  stop ()
  {
    this.isLoading = false;
  }
}
