
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ComboBoxComponent } from '_common/components/combo-box/combo-box.component';
import { TextEditorComponent } from '_common/components/text-editor/text-editor.component';
import { DataTableComponent } from '_common/components/data-table/data-table.component';
import { ContentLoaderComponent } from '_common/components/content-loader/content-loader.component';
import * as JQuery from 'jquery';
import { HttpService } from '_common';
import { NotificationService } from '_common/services/notification/notification.service';
import { Notification } from '_common/services/notification/notification.model';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { saveAs } from 'file-saver';

@Component({
  templateUrl: 'projects.component.html',
  styleUrls: ['projects.component.scss']
})
export class ProjectsComponent {
  @ViewChild('ProjectSelect', { static: false })
  projectSelect: ComboBoxComponent;

  @ViewChild('ProjectDescription', {static: false}) 
  projectDescription: TextEditorComponent;

  @ViewChild('ModuleTable', {static: false}) 
  moduleTable: DataTableComponent;

  @ViewChild('ModuleTableLoader', {static: false}) 
  moduleTableLoader: ContentLoaderComponent;

  @ViewChild('ProjectLoader', {static: false}) 
  projectLoader: ContentLoaderComponent;

  @ViewChild('NewModuleInput', {static: false}) 
  newModuleInput: ElementRef;

  @ViewChild('ModuleInfoLoader', {static: false}) 
  moduleInfoLoader: ContentLoaderComponent;

  currentSelectedIdProject: string = null;
  currentSelectedIdModule: string = null;

  moduleInfoData = { 
    title: 'Module not Selected',
    requirements: 0,
    open: 0,
    review: 0,
    close: 0
  };

  projectInfoData = { 
    requirements: 0,
    open: 0,
    review: 0,
    close: 0
  };

  constructor(private httpService: HttpService, private notificationService: NotificationService, private http: HttpClient) {}

  configProjectDescription = {
    modules: {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline']
        ]
    },
    placeholder: 'Description of Project',
    theme: 'snow'
  };

  configModuleTable = {
    data: [],
    pageLength: 12,
    lengthChange: false,
    searching: false,
    columns: [
      { title: 'Module Name' },
      { 
        title: '',
        render: (data, type) => {
          if (type === 'display') {
            data = " <button type='button' class='btn btn-danger' data-id=" + data + ">Delete</button>"
          }
          return data;
        } 
      }
    ],
    language: {
      emptyTable: 'No Module'
    },
    rowCallback: (row, data) => {
      JQuery(row).find('button').on('click', this.revModule.bind(this));
    }
  }

  setupProjectDescription() {
    this.projectDescription.options = this.configProjectDescription;
    this.projectDescription.instance.enable(false);
  }

  loadProjectDescription(callback: ()=>void) {
    this.projectDescription.instance.enable(false);
    this.httpService.get('/project/description/' + this.currentSelectedIdProject).subscribe(
      (response: any) => {
        if (response)
          this.projectDescription.instance.clipboard.dangerouslyPasteHTML(response);
          this.projectDescription.instance.enable(true);
          callback();
      },
      error => {
        console.error(error);
      }
    );
  }

  saveProjectDescription() {
    if (this.currentSelectedIdProject) {
      this.httpService.patch('/project/description/' + this.currentSelectedIdProject, { 
        text: this.projectDescription.instance.root.innerHTML 
      }).subscribe(
        (response: any) => {},
        error => {
          console.error(error);
          this.notificationService.showNotify(new Notification("You don't have permissions."));
        }
      );
    }
  }

  loadProjects() {
    let projectSelectConfig = { placeholder: "Select Project", allowClear: false, data: [] };
    this.projectSelect.options = projectSelectConfig;
    this.httpService.get('/project/list').subscribe(
      (response: any) => {
        if (response.length != 0) {
          projectSelectConfig.data = response;
          this.projectSelect.options = projectSelectConfig;
          this.projectSelect.instance.on("change.select2", this.onChangeProject.bind(this));
          if (response.length > 0) {
            this.projectSelect.instance.val(response[0].id).trigger('change.select2');
          }
        } else {
          this.projectLoader.loading = false;
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  loadProjectStats(callback: ()=>void = ()=>{}) {
    this.httpService.post('/project/stats/' + this.currentSelectedIdProject).subscribe(
      (response: any) => {
        this.projectInfoData = response;
        callback();
      },
      error => {
        console.error(error);
      }
    );
  }

  generateProjectReport() {
    if (this.currentSelectedIdProject) {
      this.http.post('/api/generate-project-report/' + this.currentSelectedIdProject, { location: "project-report.pdf" }, { 
        responseType: 'blob', headers: { Authorization: this.httpService.getToken() }
      }).subscribe(
          (response) => {
              var blob = new Blob([response], { type: 'application/pdf' });
              saveAs(blob, 'project-report.pdf');
          },
          error => {
            console.error(error);
          }
      );
    }
  }

  generateModuleReport() {
    if (this.currentSelectedIdProject && this.currentSelectedIdModule) {
      this.http.post('/api/generate-module-report/' + this.currentSelectedIdProject + '/' + this.currentSelectedIdModule, { location: "module-report.pdf" }, { 
        responseType: 'blob', headers: { Authorization: this.httpService.getToken() }
      }).subscribe(
          (response) => {
              var blob = new Blob([response], { type: 'application/pdf' });
              saveAs(blob, 'module-report.pdf');
          },
          error => {
            console.error(error);
          }
      );
    }
  }

  loadModules(callback: ()=>void = ()=>{}) {
    if (!this.projectLoader.loading)
      this.moduleTableLoader.loading = true;
    this.moduleTable.options = this.configModuleTable;
    this.deselectedRow();
    this.httpService.get('/project/modules/' + this.currentSelectedIdProject).subscribe(
      (response: any) => {
        this.moduleTable.refresh(response);
        this.setupClickableModuleTable();
        this.moduleTableLoader.loading = false;
        callback();
      },
      error => {
        console.error(error);
      }
    );
  }

  addModule() {
    let title = this.newModuleInput.nativeElement.value;
    if (title != '' && this.currentSelectedIdProject) {
      if (!this.projectLoader.loading)
        this.moduleTableLoader.loading = true;
      this.httpService.put('/project/modules/' + this.currentSelectedIdProject, { title: title }).subscribe(
        (response: any) => {
          this.loadModules();
        },
        error => {
          console.error(error);
          this.notificationService.showNotify(new Notification("You don't have permissions."));
          this.moduleTableLoader.loading = false;
        }
      );
    }
  }

  revModule($event) {
    let moduleId = $event.target.getAttribute('data-id');
    if (moduleId != '') {
      if (!this.projectLoader.loading)
        this.moduleTableLoader.loading = true;
      this.httpService.post('/project/modules/' + this.currentSelectedIdProject, { moduleId: moduleId }).subscribe(
        (response: any) => {
          this.loadModules();
        },
        error => {
          console.error(error);
          this.notificationService.showNotify(new Notification("You don't have permissions."));
          this.moduleTableLoader.loading = false;
        }
      );
    }
  }

  onChangeProject() {
    this.projectLoader.loading = true;
    this.currentSelectedIdProject = <string>this.projectSelect.instance.val();
    this.loadProject();
  }

  loadProject() {
    this.loadProjectDescription(() => {
      this.loadProjectStats(() => {
        this.loadModules(() => {
          this.projectLoader.loading = false;
        });
      });
    });
  }

  setupClickableModuleTable() {
    this.moduleTable.jquery.find('tr').on('click', ($event) => {
      if (JQuery($event.currentTarget).hasClass('selected')) {
        JQuery($event.currentTarget).removeClass('selected');
        this.deselectedRow();
      } else {
        this.moduleTable.jquery.find('tr').removeClass("selected");
        JQuery($event.currentTarget).addClass('selected');
        const moduleId = JQuery($event.currentTarget).find("button").attr("data-id");
        this.selectedRow(moduleId);
      }
    });
  }

  ngAfterViewInit() {
    this.projectLoader.loading = true;
    this.setupProjectDescription();
    this.loadProjects();
  }

  selectedRow(moduleId: string) {
    if (!this.projectLoader.loading)
      this.moduleInfoLoader.loading = true;
    this.httpService.post('/project/module/stats/' + this.currentSelectedIdProject, { moduleId: moduleId }).subscribe(
      (response: any) => {
        this.moduleInfoData = response;
        this.currentSelectedIdModule = moduleId;
        this.moduleInfoLoader.loading = false;
      },
      error => {
        console.error(error);
      }
    );
  }

  deselectedRow() {
    this.moduleInfoData = { 
      title: 'Module not Selected',
      requirements: 0,
      open: 0,
      review: 0,
      close: 0
    };
    this.currentSelectedIdModule = null;
  }
}
