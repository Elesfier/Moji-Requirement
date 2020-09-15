
import { Component, Input, Inject, forwardRef, Output, EventEmitter } from '@angular/core';
import { SimpleFormComponent } from './form.component';

@Component({
  selector: 'simple-select',
  template: `
    <div class="input-group" [ngStyle]="{ 'width' : width + '%' }">
      <span *ngIf="leftLabel" class="input-group-addon">{{leftLabel}}</span>
      <select
        (change)="onChangeSelect($event.currentTarget)"
        [disabled]="(bindParent[selectData] == null || (bindParent[selectData] && (bindParent[selectData].length == 0)))"
        [(ngModel)]="bindParent[bind]"
        (ngModelChange)="onChangeModel($event)"
        class="input-large form-control">
        <option
          *ngFor="let selectItem of bindParent[selectData];"
          [attr.value]="selectItem.value"
          [innerHTML]="selectItem.name">
        </option>
      </select>
      <span *ngIf="rightButton" class="input-group-btn">
        <button
          class="btn btn-default"
          (click)='onClickButtonSelect($event.currentTarget)'
          type="button">
          {{rightButton}}
        </button>
      </span>
    </div>
  `
})
export class SimpleSelectComponent
{
  //[TODO]: remove that stupid dropdown arrow

  @Input('bind-select-data') selectData: string = undefined;
  @Input('label') leftLabel: string = '';
  @Input('width') width: number = 100;
  @Input('button-label') rightButton: string = '';
  @Input('bind-parent') bindParent: any = undefined;
  @Input('bind') bind: any = undefined;

  @Output('on-click') onClickButton = new EventEmitter();
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

  onChangeSelect (target: any)
  {
    this.onChange.emit(target);
  }

  onClickButtonSelect (target: any)
  {
    this.onClickButton.emit(target);
  }
}
