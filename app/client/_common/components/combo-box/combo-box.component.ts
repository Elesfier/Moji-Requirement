
import { Component, ElementRef, AfterViewInit, Input } from '@angular/core';
import * as JQuery from 'jquery';
import 'select2';

/**
 * Select2 Wrapper for Bootstrap 3
 * Licence: MIT
 * package.json:
 *   "@types/select2": "~4.0.49",
 *   "select2": "~4.0.13",
 *   "select2-bootstrap-theme": "~0.1.0-beta.10", //css styles
 */
@Component({
    selector: 'combo-box',
    template: '<select root-of-combo-box [attr.name]="name" style="width: 100%;"></select>'
})
export class ComboBoxComponent implements AfterViewInit {
    constructor(private element: ElementRef) {}

    @Input('name')
    name: string = null;

    @Input('empty-on-init')
    emptyOnInit: boolean = true;

    private readonly ROOT_OF_COMBO_BOX = 'select[root-of-combo-box]';
    private _options: Select2.Options;
    private _instance: JQuery;

    get options(): Select2.Options {
        return this._options;
    }

    get instance(): JQuery {
        return this._instance;
    }

    set options(newOptions: Select2.Options) {
        if (newOptions.theme === undefined) {
            // For bootstrap theme
            newOptions.theme = "bootstrap";
        }
        this._options = newOptions;
        this.reloadOptions();
    }

    public ngAfterViewInit() {
        this.reloadOptions();
    }

    private reloadOptions(): void {
        if (this._options) {
            let combobox = JQuery(this.element.nativeElement).find(this.ROOT_OF_COMBO_BOX);
            if (this._instance) {
                combobox.find('option,optgroup').remove();
            }
            if (this.emptyOnInit) {
                combobox.append(new Option());
            }
            this._instance = combobox.select2(this._options);
        }
    }
}
