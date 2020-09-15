
import {

  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild

} from '@angular/core';

import { SimpleLoaderComponent } from '../structure/loader.component';
import { HttpService } from '../../../../services/http.service';

@Component({
  selector: 'simple-table',
  templateUrl: 'table.component.html',
  styleUrls: [ 'table.component.css' ]
})

export class SimpleTableComponent implements AfterViewInit
{
  @ViewChild('tableLoader', {static: false})
  public $loader: SimpleLoaderComponent;

  @Input('url') url: string = undefined;
  @Input('events') events: any = {};
  @Input('min-height') minHeight: number = 420;
  @Input('max-height') maxHeight: number = 570;
  @Input('header') header: any[] = undefined;
  @Input('additionals') additionals: {} = {};
  @Input('show-header') showHeader: boolean = true;
  //[FIXME]: binding from single-form
  @Input('bind') bind: any = undefined;
  @Input('bind-key') bindKey: string = undefined;

  @Output('after-view-init') afterViewInit = new EventEmitter();
  @Output('after-view-checked') afterViewChecked = new EventEmitter();

  model: any = null;

  //[REFACTOR]: mega brzydko wygladaja dlugie inline classy w template
  //[REFACTOR]: moze lepiej zeby simple-loader nie byl w tabeli

  constructor (private httpService: HttpService) {}

  private addExtraColumns (columns: any[]): any[]
  {
    let newColumns = [].concat(columns);
    Object.keys(this.additionals).forEach((key)=>{
      newColumns.splice(Number(key), 0, this.additionals[key]);
    });
    return newColumns;
  }

  fetch (searchParams: any = {})
  {
    //[TODO]: optional zeby dalo sie tez przekazywac nowy url
    //this.$loader.start();
    this.httpService.get(this.url, searchParams).subscribe((model : any) => {
      if (this.header && !model.header) model.header = this.header;
      this.model = model;
      if (this.bind && this.bindKey) this.bind[this.bindKey] = this.model;
      this.$loader.stop();
    });
  }

  ngAfterViewInit ()
  {
    this.afterViewInit.emit(undefined);
  }

  ngAfterViewChecked ()
  {
    this.afterViewChecked.emit(undefined);
  }

  public clean ()
  {
    this.model = { rows: [] };
  }
}
