
import {

  Component,
  Input,
  Output,
  EventEmitter,
  Directive,
  QueryList,
  ContentChildren,
  ElementRef,
  HostBinding,
  ViewChild

} from '@angular/core';

import { SimpleLoaderComponent } from '../structure/loader.component';
import { jQuery } from '../../../../services/jQuery.service';

@Directive({
  selector: 'simple-modal-tab',
  host: { 'class': 'hide' }
})
export class SimpleModalTabDirective
{
  public $tab: any;

  @Input('name') name: string;

  constructor (private element: ElementRef)
  {
    this.$tab = this.element.nativeElement;
    this.show();
  }

  show ()
  {
    if (this.$tab.parentElement && this.$tab.parentElement.children[0] == this.$tab)
      this.$tab.setAttribute('class', 'show');
  }

  select ($tabHeader: any)
  {
    //[FIXME]: selectors to long
    $tabHeader.parentElement.querySelector("[class='active']").setAttribute("class", "");
    this.$tab.parentElement.querySelector("[class='show']").setAttribute("class", "hide");
    $tabHeader.setAttribute("class", "active");
    this.$tab.setAttribute('class', 'show');
  }
}

@Component({
  selector: 'simple-modal',
  templateUrl: 'modal.component.html',
  styleUrls: [ 'modal.component.css' ],
  host: {
    'class': 'modal fade',
    'role': 'dialog',
    'tabindex': '-1'
  }
})
export class SimpleModalComponent
{
  $modal: any = undefined;

  @ContentChildren(SimpleModalTabDirective, {descendants: true})
  public $tabs: QueryList<SimpleModalTabDirective>;

  @ViewChild('modalLoader', {static: false})
  public $loader: SimpleLoaderComponent;

  @Input('title') title: string = '';
  @Input('z-index') zIndex: number = 0;
  @Input('data-backdrop') dataBackdrop: string = 'true';
  @Input('size') size: string = 'normal';
  @Input('show-close-icon') addCloseIcon: boolean = true;
  @Input('show-close-button') addCloseButton: boolean = false;
  @Input('min-height') minHeight: number = 445;
  @Input('max-height') maxHeight: number = 585;
  @Input('show-header') showHeader: boolean = true;
  @Input('on-start-load') onStartLoad: boolean = false;

  //[FIXME]: mozliwosc zamknięcia kiedy sie ładuje modal
  //[REFACTOR]: moze lepiej zeby simple-loader nie byl w modal

  @HostBinding('style.z-index') get zIndexChanger(): number {
    return 1050 + this.zIndex;
  }

  @HostBinding('attr.data-backdrop') get dataBackdropChanger(): string {
    return this.dataBackdrop;
  }

  @Output('on-show') onShow = new EventEmitter();
  @Output('on-hide') onHide = new EventEmitter();

  passData: any = undefined;

  constructor (private element: ElementRef)
  {
    this.$modal = jQuery(element.nativeElement);

    this.$modal.on("shown.bs.modal",() => {
      if (this.onStartLoad) this.$loader.start();
      this.onShow.emit(this.passData);
    });

    this.$modal.on("hidden.bs.modal",() => {

      if ((<any>this.$tabs)._results.length != 0)
      {
        //[FIXME]: this soluction is not good
        if (this.$modal.find("[class='active']"))
          this.$modal.find("[class='active']").attr("class", "");

        if (this.$modal.find("[class='show']"))
          this.$modal.find("[class='show']").attr("class", "hide");

        (<any>this.$tabs)._results[0].show()

        this.$modal.find(".modal-header ul[class='nav nav-tabs'] li:first-child").attr("class", "active");
      }

      this.$loader.stop();
      this.onHide.emit(this.passData);
    });
  }

  public show (passData: any = undefined)
  {
    this.passData = passData;
    this.$modal.modal('show');
  }

  public close (passData: any = undefined)
  {
    this.passData = passData;
    this.$modal.modal('hide');
  }
}
