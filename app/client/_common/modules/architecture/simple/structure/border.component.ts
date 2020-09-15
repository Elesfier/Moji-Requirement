
import { Component } from '@angular/core';

//[TODO]: padding left i right o 10px mniej to by było dobrze

@Component({
  selector: 'simple-border',
  template: `
  <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
    <div class='well well-sm clearfix' style='border-radius: 2px;'>
      <ng-content></ng-content>
    </div>
  </div>
  `
})
export class SimpleBorderComponent {}
