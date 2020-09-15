
import { Component, ElementRef, AfterViewInit, Input } from '@angular/core';
import * as JQuery from 'jquery';
import 'jstree';

/**
 * JSTree Wrapper for Bootstrap 3
 * Licence: MIT
 * package.json:
 *   "@types/jstree": "~3.3.40",
 *   "jstree": "~3.3.9",
 *   "jstree-bootstrap-theme": "~1.0.1", //css styles
 */
@Component({
    selector: 'tree-view',
    template: '<div root-of-tree-view></div>'
})
export class TreeViewComponent implements AfterViewInit {
    constructor(private element: ElementRef) {}

    @Input('open-close-on-single-click')
    openCloseOnSingleClick: boolean = true;

    private readonly ROOT_OF_TREE_VIEW = 'div[root-of-tree-view]';
    private _options: JSTreeStaticDefaults;
    private _instance: JSTree;
    private _jquery: any;

    get options(): JSTreeStaticDefaults {
        return this._options;
    }

    get instance(): JSTree {
        return this._instance;
    }
    
    get jquery(): any {
        return this._jquery;
    }

    set options(newOptions: JSTreeStaticDefaults) {
        if (newOptions.core.themes === undefined) {
            // Theme from jstree-bootstrap-theme
            newOptions.core.themes = {
                'name': 'proton',
                'responsive': true
            };
        }
        if (newOptions.core.animation === undefined) {
            // 100ms of animation
            newOptions.core.animation = 100;
        }
        this._options = newOptions;
        this.reloadOptions();
    }

    public ngAfterViewInit() {
        this.reloadOptions();
    }

    private reloadOptions(): void {
        if (this._options) {
            if (this._instance) {
                this._instance.settings = this._options;
                this._instance.refresh();
            } else {
                this._jquery = JQuery(this.element.nativeElement).find(this.ROOT_OF_TREE_VIEW);
                this._jquery.jstree(this._options);
                this._instance = this._jquery.jstree(true);
                if (this.openCloseOnSingleClick) {
                    this._jquery.on('click', '.jstree-anchor', ($event) => {
                        const isExpand = JQuery($event.target).parent().attr('aria-expanded');
                        if (isExpand === 'true') {
                            this._instance.close_node($event.target.id); 
                        } else if (isExpand === 'false') {
                            this._instance.open_node($event.target.id); 
                        }
                    });
                }
            }
        }
    }
}
