
import { Component, Input } from '@angular/core';

@Component({
  selector: 'simple-form',
  template: `
    <form>
      <ng-content></ng-content>
    </form>
  `
})
export class SimpleFormComponent
{
  @Input('bind') bind: any;
}
