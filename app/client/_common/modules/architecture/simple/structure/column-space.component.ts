
import { Component, Input } from '@angular/core';

@Component({
  selector: 'simple-column-space',
  template: `
    <div
      [style.padding.px]="padding"
      [attr.class]="'col-xs-'+size[0]+' col-sm-'+size[1]+' col-md-'+size[2]+' col-lg-'+size[3]+' col-xl-'+size[4]">
    </div>
  `
})
export class SimpleColumnSpaceComponent
{
  //[NOTE]: size = [EXTRA SMALL, SMALL, MEDIUM, LARGE, EXTRA LARGE]
  @Input('size') size: any[] = [0, 0, 0, 0, 0];
  @Input('padding') padding: number = 0;
}
