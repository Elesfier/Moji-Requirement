
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent } from './content.component';
import { ContentRouting } from './content.routing';
import { ContentGuard } from './content.guard';
import { SimpleArchitectureModule } from '../_common/index';
import { modules } from '../content/index';
import { DiagramComponent } from '_common/components/diagram/diagram.component';
import { TreeViewComponent } from '_common/components/tree-view/tree-view.component';
import { DataTableComponent } from '_common/components/data-table/data-table.component';
import { ContentLoaderComponent } from '_common/components/content-loader/content-loader.component';
import { ComboBoxComponent } from '_common/components/combo-box/combo-box.component';
import { TextEditorComponent } from '_common/components/text-editor/text-editor.component';

@NgModule({
  imports: [ CommonModule, ContentRouting, SimpleArchitectureModule ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [ 
    ContentComponent, 
    DiagramComponent, 
    TreeViewComponent,
    DataTableComponent,
    ContentLoaderComponent,
    ComboBoxComponent,
    TextEditorComponent
  ].concat(modules.components),
  providers: [ ContentGuard ]
})
export class ContentModule 
{}
