
import { Component, Input, ElementRef, AfterViewInit } from '@angular/core';
import * as JQuery from 'jquery';

@Component({
  selector: 'content-loader',
  styleUrls: [ 'content-loader.component.scss' ],
  templateUrl: 'content-loader.component.html'
})
export class ContentLoaderComponent implements AfterViewInit {
  constructor(private element: ElementRef) {}

  @Input('size')
  public size: number = 60;

  @Input('z-index')
  public zIndex: number = 2000;

  @Input('isLoading') 
  public loading: boolean = false;

  ngAfterViewInit() {
    JQuery(this.element.nativeElement)
      .prepend(`
        <style>
          .content-loader:before {
            z-index: ` + (this.zIndex) + `;
            width: ` + (this.size) + `px;
            height: ` + (this.size) + `px;
            margin-top: -` + (this.size/4) + `px;
            margin-left: -` + (this.size/2) + `px;
          }
        </style>
      `);
  }
}
