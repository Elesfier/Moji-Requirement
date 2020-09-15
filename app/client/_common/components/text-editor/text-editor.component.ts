
import { Component, ElementRef, AfterViewInit, Input } from '@angular/core';
import Quill, { QuillOptionsStatic } from 'quill';

/**
 * Quill Wrapper for Bootstrap 3
 * Licence: BSD-3-Clause
 * package.json:
 *    "@types/quill": "~2.0.3",
 *    "quill": "~1.3.7",    //contain css styles
 */
@Component({
    selector: 'text-editor',
    template: '<div style="width: 100%" [ngStyle]="{\'height\': height}"></div>'
})
export class TextEditorComponent implements AfterViewInit {
    constructor(private element: ElementRef) {}

    @Input('height')
    height: string = '90%';

    private _options: QuillOptionsStatic;
    private _instance: Quill;

    get options(): QuillOptionsStatic {
        return this._options;
    }

    get instance(): Quill {
        return this._instance;
    }

    set options(newOptions: QuillOptionsStatic) {
        this._options = newOptions;
        this.reloadOptions();
    }

    public ngAfterViewInit() {
        this.reloadOptions();
    }

    private reloadOptions(): void {
        if (this._options) {
            this._instance = new Quill(this.element.nativeElement.children[0], this._options);
        }
    }
}
