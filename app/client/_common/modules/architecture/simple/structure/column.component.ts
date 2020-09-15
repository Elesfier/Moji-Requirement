
import { Component, Input } from '@angular/core';

@Component({
  selector: 'simple-column',
  //[FIXME]: tego tutaj nie powinno być
  styles: [`
    @media screen and (max-width: 768px) {
      .custom-break-column-xs {
          padding-top: 9px !important;
      }
    }
    @media screen and (min-width: 768px) and (max-width: 992px) {
      .custom-break-column-sm {
          padding-top: 9px !important;
      }
    }
    @media screen and (min-width: 992px) and (max-width: 1170px) {
      .custom-break-column-md {
          padding-top: 9px !important;
      }
    }
    @media screen and (min-width: 1170px) {
      .custom-break-column-lg {
          padding-top: 9px !important;
      }
    }
  `],
  //[FIXME]: składnia mi się nie podoba
  template: `
    <div
      [style.padding-left.px]="padding[0]"
      [style.padding-right.px]="padding[1]"
      [attr.class]="'col col-xs-'+size[0]+' col-sm-'+size[1]+' col-md-'+size[2]+' col-lg-'+size[3]+' col-xl-'+size[4]">
      <div [ngClass]="{ 'custom-break-column-xs' : break[0], 'custom-break-column-sm' : break[1], 'custom-break-column-md' : break[2], 'custom-break-column-lg' : break[3] }">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class SimpleColumnComponent
{
  //[TODO] Support for xl bootstrap columns
  //[XXX] Podaje sie pojedyncze a nie wszystkie, ale to do pomyslenia

  //[NOTE]: size = [EXTRA SMALL, SMALL, MEDIUM, LARGE, EXTRA LARGE]
  @Input('size') size: any[] = [0, 0, 0, 0, 0];
  @Input('break') break: any[] = [0, 0, 0, 0, 0];
  @Input('padding') padding: any[] = [undefined, undefined];
}
