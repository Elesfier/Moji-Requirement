
import { Component, Input, Inject, forwardRef, Output, EventEmitter } from '@angular/core';
import { SimpleFormComponent } from './form.component';

@Component({
  selector: 'simple-text-input',
  template: `
    <div
      class="input-group"
      [ngStyle]="{ 'width' : width + '%' }">
      <span *ngIf="leftLabel" class="input-group-addon">{{leftLabel}}</span>
      <input #textInputInner
        (keyup.enter)='onChangeTextInput(textInputInner.value)'
        type="text"
        class="form-control"
        [(ngModel)]="bindParent[bind]"
        (ngModelChange)="onChangeModel($event)"
        placeholder="{{placeholder}}">
      <span *ngIf="rightButton" class="input-group-btn">
        <button
          class="btn btn-default"
          (click)='onClickButtonTextInput(textInputInner.value)'
          type="button">
          {{rightButton}}
        </button>
      </span>
    </div>
  `
})
export class SimpleTextInputComponent
{
  @Input('placeholder') placeholder: string = '';
  @Input('label') leftLabel: string = '';
  @Input('width') width: number = 100;
  @Input('button-label') rightButton: string = '';
  @Input('bind-parent') bindParent: any = undefined;
  @Input('bind') bind: any = undefined;

  @Output('on-click') onClickButton = new EventEmitter();
  @Output('on-enter') onEnter = new EventEmitter();

  constructor (@Inject(forwardRef(() => SimpleFormComponent)) private simpleFormComponent: SimpleFormComponent){}

  ngOnInit ()
  {
    if (this.simpleFormComponent && !this.bindParent) this.bindParent =  this.simpleFormComponent.bind;
  }

  onChangeModel (value: any)
  {
    this.bindParent[this.bind] = value;
  }

  onChangeTextInput (value: any)
  {
    this.onEnter.emit(value);
  }

  onClickButtonTextInput (value: any)
  {
    this.onClickButton.emit(value);
  }
}
