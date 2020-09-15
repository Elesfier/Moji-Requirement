
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ComboBoxComponent } from '_common/components/combo-box/combo-box.component';
import { TextEditorComponent } from '_common/components/text-editor/text-editor.component';
import { DataTableComponent } from '_common/components/data-table/data-table.component';
import { ContentLoaderComponent } from '_common/components/content-loader/content-loader.component';
import * as JQuery from 'jquery';
import { HttpService } from '_common';
import 'bootstrap';

@Component({
  templateUrl: 'admin.component.html'
})
export class AdminComponent {

  @ViewChild('ProjectTable', {static: false}) 
  projectTable: DataTableComponent;

  @ViewChild('ProjectTableLoader', {static: false}) 
  projectTableLoader: ContentLoaderComponent;

  @ViewChild('MemberTable', {static: false}) 
  memberTable: DataTableComponent;

  @ViewChild('MemberTableLoader', {static: false}) 
  memberTableLoader: ContentLoaderComponent;

  @ViewChild('PermissionTable', {static: false}) 
  permissionTable: DataTableComponent;

  @ViewChild('PermissionTableLoader', {static: false}) 
  permissionTableLoader: ContentLoaderComponent;

  @ViewChild('NewProjectInput', {static: false}) 
  newProjectInput: ElementRef;

  @ViewChild('PermissionSelect', { static: false })
  permissionSelect: ComboBoxComponent;

  @ViewChild('ProjectSelect', { static: false })
  projectSelect: ComboBoxComponent;

  currentPermissionUser: string = null;
  currentPermissionId: string = null;

  constructor(private httpService: HttpService) {}

  private projectTableOptions = {
    data: [],
    pageLength: 8,
    lengthChange: false,
    searching: false,
    columns: [{ 
      title: 'Project Name' 
    }, { 
      title: '',
      render: (data, type) => {
        if (type === 'display') {
          data = " <button type='button' class='btn btn-danger' data-id=" + data + ">Delete</button>"
        }
        return data;
      }
    }],
    language: {
      emptyTable: 'No Projects'
    },
    rowCallback: (row, data) => {
      JQuery(row).find('button').on('click', this.revProject.bind(this));
    }
  };

  private memberTableOptions = {
    data: [],
    pageLength: 9,
    lengthChange: false,
    searching: false,
    columns: [{ 
      title: 'Login' 
    }, { 
      title: 'Email' 
    }, { 
      title: '',
      render: (data, type) => {
        if (type === 'display') {
          data = " <button type='button' class='btn btn-info' data-id=" + data + ">Permissions</button>"
        }
        return data;
      }
    }],
    language: {
      emptyTable: 'No Members'
    },
    rowCallback: (row, data) => {
      JQuery(row).find('button').on('click', this.showPermissions.bind(this));
      let user = JQuery(row).find("td")[0].innerHTML;
      JQuery(row).find('button').attr("data-user", user);
    }
  };

  private permissionTableOptions = {
    data: [],
    pageLength: 11,
    lengthChange: false,
    searching: false,
    columns: [{ 
      title: 'Project' 
    }, { 
      title: 'Permission' 
    }, { 
      title: '',
      render: (data, type) => {
        if (type === 'display') {
          data = " <button type='button' class='btn btn-danger' data-id=" + data + ">Delete</button>"
        }
        return data;
      }
    }],
    language: {
      emptyTable: 'No Permission'
    },
    rowCallback: (row, data) => {
      JQuery(row).find('button').on('click', this.revPermission.bind(this));
    }
  };

  ngAfterViewInit() {
    this.loadMembers();
    this.loadProjects();
    this.permissionTable.options = this.permissionTableOptions;
    this.setupOnCLosePermissionTable();
    this.loadPermissionSelect();
  }

  setupOnCLosePermissionTable() {
    (<any>$("#permissions-modal")).on('hidden.bs.modal', () => {
        this.permissionTable.refresh([]);
    });
  }

  loadPermissionSelect() {
    this.httpService.get('/permissions').subscribe(
      (response: any) => {
        let permissionsSelectConfig = { placeholder: "Select Permission", data: response };
        this.permissionSelect.options = permissionsSelectConfig;
      },
      error => {
        console.error(error);
      }
    );
  }

  loadMembers() {
    this.memberTableLoader.loading = true;
    this.memberTable.options = this.memberTableOptions;
    this.httpService.get('/members').subscribe(
      (response: any) => {
        this.memberTable.refresh(response);
        this.memberTableLoader.loading = false;
      },
      error => {
        console.error(error);
      }
    );
  }

  loadProjects() {
    this.projectTableLoader.loading = true;
    this.projectTable.options = this.projectTableOptions;
    this.httpService.get('/projects').subscribe(
      (response: any) => {
        this.projectTable.refresh(response);
        this.projectTableLoader.loading = false;
      },
      error => {
        console.error(error);
      }
    );
  }

  addProject() {
    let value = this.newProjectInput.nativeElement.value;
    if (value != '') {
      this.projectTableLoader.loading = true;
      this.httpService.put('/project', { title: value }).subscribe(
        (response: any) => {
          this.loadProjects();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  revProject($event) {
    let value = $event.target.getAttribute('data-id');
    if (value != '') {
      this.projectTableLoader.loading = true;
      this.httpService.delete('/project/' + value).subscribe(
        (response: any) => {
          this.loadProjects();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  showPermissions($event) {
    let id = $event.target.getAttribute('data-id');
    let user = $event.target.getAttribute('data-user');
    if (id != '' && user != '') {
      (<any>$("#permissions-modal")).modal("show");
      this.loadPermissions(id, user);
      this.loadProjectToSelect();
    }
  }

  loadPermissions(id, user) {
    if (id != '' && user != '') {
      this.currentPermissionId = id;
      this.currentPermissionUser = user;
      this.permissionTableLoader.loading = true;
      this.httpService.get('/permissions/' + id).subscribe(
        (response: any) => {
          this.permissionTable.refresh(response);
          this.permissionTableLoader.loading = false;
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  loadProjectToSelect() {
    this.httpService.get('/projects').subscribe(
      (response: any) => {
        let projectSelectConfig = { placeholder: "Select Project", data: [] };
        response.forEach((project) => {
          projectSelectConfig.data.push({
            text: project[0],
            id: project[1]
          });
        });
        this.projectSelect.options = projectSelectConfig;
      },
      error => {
        console.error(error);
      }
    );
  }

  addPermission() {
    let idUser = this.currentPermissionId;
    let idProject = this.projectSelect.instance.val();
    let idPermission = this.permissionSelect.instance.val();
    if (idUser != '' && idProject != '' && idPermission != '') {
      this.permissionTableLoader.loading = true;
      this.httpService.put('/permissions/' + idUser, { idProject: idProject, idPermission: idPermission }).subscribe(
        (response: any) => {
          this.loadPermissions(this.currentPermissionId, this.currentPermissionUser);
        },
        error => {
          console.error(error);
        }
      );

    }
  }

  revPermission($event) {
    let permissionId = $event.target.getAttribute('data-id');
    if (permissionId != '') {
      this.permissionTableLoader.loading = true;
      this.httpService.delete('/permissions/' + permissionId).subscribe(
        (response: any) => {
          this.loadPermissions(this.currentPermissionId, this.currentPermissionUser);
        },
        error => {
          console.error(error);
        }
      );
    }
  }
}
