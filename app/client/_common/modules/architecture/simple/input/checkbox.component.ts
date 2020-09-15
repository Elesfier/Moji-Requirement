
import { Component, Input, Inject, forwardRef, Output, EventEmitter } from '@angular/core';
import { SimpleFormComponent } from './form.component';

@Component({
  selector: 'simple-checkbox',
  template: `
    <label
      style="font-weight: normal !important;"
      class="form-check-label">
      <input
        [(ngModel)]="bindParent[bind]"
        (ngModelChange)="onChangeModel($event)"
        [disabled]="disabled"
        (change)="onChangeCheckbox($event.currentTarget.checked)"
        type="checkbox"
        class="form-check-input">
      {{label}}
    </label>
  `
})
export class SimpleCheckboxComponent
{
  @Input('label') label: string = '';
  @Input('bind-parent') bindParent: any = undefined;
  @Input('bind') bind: any = undefined;
  @Input('disabled') disabled: boolean = false;

  @Output('on-change') onChange = new EventEmitter();

  constructor (@Inject(forwardRef(() => SimpleFormComponent)) private simpleFormComponent: SimpleFormComponent){}

  ngOnInit ()
  {
    if (this.simpleFormComponent && !this.bindParent) this.bindParent =  this.simpleFormComponent.bind;
  }

  onChangeModel (value: any)
  {
    this.bindParent[this.bind] = value;
  }

  onChangeCheckbox (value: any)
  {
    this.onChange.emit(value);
  }
}
