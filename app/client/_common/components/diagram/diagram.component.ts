

import { Component, ElementRef, AfterViewInit, Input } from '@angular/core';
import * as JQuery from 'jquery';
import * as joint from 'jointjs';

@Component({
  selector: 'diagram',
  template: '<div></div>'
})
export class DiagramComponent implements AfterViewInit
{
    private paper: joint.dia.Paper;
    private graph: joint.dia.Graph;

    @Input('height')
    height: string = '100%';

    constructor(private element: ElementRef) {}
    
    ngAfterViewInit() {
        this.initGraph();
        this.setGrid(15, '#FF0000');
        this.setupZoom();
        this.generateJointJS();
    } 

    private setGrid(gridSize, color) {
        // Set grid size on the JointJS paper object (joint.dia.Paper instance)
        this.paper.options.gridSize = gridSize;
        // Draw a grid into the HTML 5 canvas and convert it to a data URI image
        var canvas = <any>(JQuery('<canvas/>', { width: gridSize, height: gridSize }));
        canvas[0].width = gridSize;
        canvas[0].height = gridSize;
        var context = canvas[0].getContext('2d');
        context.beginPath();
        context.rect(1, 1, 1, 1);
        context.fillStyle = color || '#AAAAAA';
        context.fill();
        // Finally, set the grid background image of the paper container element.
        var gridBackgroundImage = canvas[0].toDataURL('image/png');
        this.paper.$el.css('background-image', 'url("' + gridBackgroundImage + '")');
    }
    
    private offsetToLocalPoint(x, y) {
        var svgPoint = (<any>this.paper.svg).createSVGPoint();
        svgPoint.x = x;
        svgPoint.y = y;
        var pointTransformed = svgPoint.matrixTransform(this.paper.viewport.getCTM().inverse());
        return pointTransformed;
    }

    private setupZoom() {
        this.paper.$el.on('mousewheel DOMMouseScroll', (e: any) => {
            e.preventDefault();
            e = e.originalEvent;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) / 50;

            var offsetX = (e.offsetX || e.clientX - $(this).offset().left);
            var offsetY = (e.offsetY || e.clientY - $(this).offset().top);

            var p = this.offsetToLocalPoint(offsetX, offsetY);
            var newScale = joint.V(this.paper.viewport).scale().sx + delta;
            console.log(' delta' + delta + ' ' + 'offsetX' + offsetX + 'offsety--' + offsetY + 'p' + p.x + 'newScale' + newScale)
            if (newScale > 0.4 && newScale < 2) {
                this.paper.setOrigin(0, 0);
                this.paper.scale(newScale, newScale, p.x, p.y);
            }
        });
    }

    private saveDiagram() {

    }

    private loadDiagram() {

    }

    private initGraph() {
        this.graph = new joint.dia.Graph;
        this.paper = new joint.dia.Paper({
            el: this.element.nativeElement.children[0],
            model: this.graph,
            width: '100%',
            //height: this.height,
            height: '638px',
            gridSize: 1
        });
    }

    private generateJointJS() {
        var rect = new joint.shapes.standard.Rectangle();
        rect.position(100, 30);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: 'blue'
            },
            label: {
                text: 'Hello',
                fill: 'white'
            }
        });
        rect.addTo(this.graph);

        var rect2 = rect.clone();
        (<any>rect2).translate(300, 0);
        rect2.attr('label/text', 'World!');
        rect2.addTo(this.graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect);
        link.target(rect2);
        link.addTo(this.graph);
    }
}
