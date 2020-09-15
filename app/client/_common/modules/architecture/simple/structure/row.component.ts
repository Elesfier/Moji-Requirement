
import { Component } from '@angular/core';

@Component({
  selector: 'simple-row',
  template: `<div class='row'> <ng-content></ng-content> </div>`
})
export class SimpleRowComponent {}
