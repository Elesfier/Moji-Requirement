
import { Component, Input, Inject, forwardRef, Output, ElementRef, EventEmitter } from '@angular/core';
import { SimpleFormComponent } from './form.component';
import { jQuery } from '../../../../services/jQuery.service';

@Component({
  selector: 'simple-text-area',
  template: `
    <div class="form-group">
      <span
        *ngIf="label"
        class="input-group-addon"
        style="border: 1px solid #ccc; padding: 10px 12px; border-top-right-radius: 4px; border-bottom-left-radius: 0; border-bottom: 0;">
        {{label}}
      </span>
      <textarea
        #textAreaInputInner
        [attr.rows]="rows"
        [(ngModel)]="bindParent[bind]"
        (ngModelChange)="onChangeModel($event)"
        [attr.placeholder]="placeholder"
        [ngStyle]="{ 'resize' : (canResize)?('vertical'):('none'), 'border-top-left-radius': (label)?(0):(4), 'border-top-right-radius': (label)?(0):(4)  }"
        class="form-control">
      </textarea>
    </div>
  `
})
export class SimpleTextAreaComponent
{
  //[REFACTOR]: za dlugi kod w html przy ustalaniu stylow

  @Input('placeholder') placeholder: string = '';
  //[TODO]: na rozne small, medium, large zeby rows sie zmienialy
  @Input('rows') rows: number = 5;
  @Input('label') label: string = '';
  //[XXX]: czy potrzebujemy zeby sie to zmienialo?
  //@Input('width') width: number = 100;
  @Input('bind-parent') bindParent: any = undefined;
  @Input('can-resize') canResize: boolean = false;
  @Input('bind') bind: any = undefined;

  constructor (
    private element: ElementRef,
    @Inject(forwardRef(() => SimpleFormComponent)) private simpleFormComponent: SimpleFormComponent){}

  ngOnInit ()
  {
    if (this.simpleFormComponent && !this.bindParent) this.bindParent =  this.simpleFormComponent.bind;

    jQuery(this.element.nativeElement).delegate('textarea', 'keydown', function(e) {
      var keyCode = e.keyCode || e.which;

      if (keyCode == 9)
      {
        e.preventDefault();
        var start = jQuery(this).get(0).selectionStart;
        var end = jQuery(this).get(0).selectionEnd;

        jQuery(this).val(jQuery(this).val().substring(0, start)
                    + "\t"
                    + jQuery(this).val().substring(end));

        jQuery(this).get(0).selectionStart =
        jQuery(this).get(0).selectionEnd = start + 1;
      }
    });
  }

  onChangeModel (value: any)
  {
    this.bindParent[this.bind] = value;
  }

}
