
import { Component, ElementRef, AfterViewInit, Input } from '@angular/core';
import * as JQuery from 'jquery';
import 'datatables.net';
import 'datatables.net-bs';
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs';

/**
 * DataTable Wrapper with Button Extension for Bootstrap 3
 * Licence: MIT
 * package.json:
 *   "@types/datatables.net": "~1.10.19",
 *   "@types/datatables.net-buttons": "~1.4.3",
 *   "datatables.net": "~1.10.18",
 *   "datatables.net-bs": "~1.10.21", //css styles
 *   "datatables.net-buttons": "~1.6.2",
 *   "datatables.net-buttons-bs": "~1.6.2", //css styles
 */
@Component({
    selector: 'data-table',
    templateUrl: 'data-table.component.html',
    styleUrls: [ 'data-table.component.scss' ]
})
export class DataTableComponent implements AfterViewInit {
    constructor(private element: ElementRef) {}

    @Input('table-class')
    tableClass: string = '';

    @Input('thead-class')
    theadClass: string = '';

    private readonly ROOT_OF_DATA_TABLE = 'table[root-of-data-table]';
    private _options: DataTables.Settings;
    private _instance: DataTables.Api;
    private _jquery: JQuery;

    public loading: boolean = true;

    get options(): DataTables.Settings {
        return this._options;
    }

    get instance(): DataTables.Api {
        return this._instance;
    }

    get jquery(): JQuery {
        return this._jquery;
    }

    set options(newOptions: DataTables.Settings) {
        if (this._options === undefined) {
            this._options = newOptions;
            this.reloadOptions();
        } else {
            this._options = newOptions;
        }
    }

    public ngAfterViewInit() {
        this.reloadOptions();
    }

    public refresh(newData: any[] = []) {
        this._instance.clear().draw();
        this._instance.rows.add(newData);
        this._instance.columns.adjust().draw();
    }

    private reloadOptions(): void {
        if (this._options) {
            this._jquery = JQuery(this.element.nativeElement).find(this.ROOT_OF_DATA_TABLE);
            this._instance = this._jquery.DataTable(this._options);
        }
    }
}
