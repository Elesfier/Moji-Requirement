
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'simple-button',
  template: `
    <div class="input-group" [ngStyle]="{ 'width' : width + '%' }">
      <button
        [attr.type]="buttonType"
        (click)='onClickButton()'
        [disabled]="disabled"
        [ngStyle]="{ 'width' : buttonWidth + '%' }"
        [attr.class]="'btn btn-' + look">
        {{buttonLabel}}
      </button>
    </div>
  `
})
export class SimpleButtonComponent
{
  @Input('button-label') buttonLabel: string = 'Button';
  @Input('width') width: number = 100;
  @Input('button-width') buttonWidth: number = 100;
  @Input('disabled') disabled: boolean = false;
  @Input('type') buttonType: string = 'button';
  @Input('look') look: string = 'default';

  @Output('on-click') onClick = new EventEmitter();

  onClickButton ()
  {
    this.onClick.emit(undefined);
  }
}
