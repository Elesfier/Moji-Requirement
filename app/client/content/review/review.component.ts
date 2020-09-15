
import { Component, ViewChild } from '@angular/core';
import { ContentLoaderComponent } from '_common/components/content-loader/content-loader.component';
import { DataTableComponent } from '_common/components/data-table/data-table.component';
import { ComboBoxComponent } from '_common/components/combo-box/combo-box.component';
import { HttpService } from '_common';
import { NotificationService } from '_common/services/notification/notification.service';
import * as JQuery from 'jquery';
import { TextEditorComponent } from '_common/components/text-editor/text-editor.component';
import { Notification } from '_common/services/notification/notification.model';

@Component({
  templateUrl: 'Review.component.html'
})
export class ReviewComponent {

  @ViewChild('ReviewTable', {static: false}) 
  reviewTable: DataTableComponent;

  @ViewChild('ReviewTableLoader', {static: false}) 
  reviewTableLoader: ContentLoaderComponent;

  @ViewChild('ProjectSelect', { static: false })
  projectSelect: ComboBoxComponent;

  @ViewChild('RequirementsDescription', {static: false}) 
  requirementsDescription: TextEditorComponent;

  currentSelectedIdProject: string = null;
  currentSelectedRequirement = {
    name: 'Requirement Not Selected',
    status: null,
    id: null,
    diagram: null,
    hasChildren: true
  };

  constructor(private httpService: HttpService, private notificationService: NotificationService) {}

  configRequirementTable = {
    data: [],
    pageLength: 12,
    lengthChange: false,
    searching: false,
    columns: [
      { title: 'Requirements Name' },
      { title: 'Requested' },
      { 
        title: '',
        render: (data, type) => {
          if (type === 'display') {
            data = " <button type='button' class='btn btn-info' data-id=" + data + ">Show Requirement</button>"
          }
          return data;
        } 
      }
    ],
    language: {
      emptyTable: 'No Requirements to Review'
    },
    rowCallback: (row, data) => {
      JQuery(row).find('button').on('click', this.onShowRequirements.bind(this));
    }
  }

  setFixForBackdropModal() {
    $(document).on('show.bs.modal', '.modal', function () {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
    });
  }

  ngAfterViewInit() {
    this.setupRequirementDescription();
    this.setFixForBackdropModal();
    this.loadProjects();
  }

  setupRequirementDescription() {
    this.requirementsDescription.options = {
      modules: {
          toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline']
          ]
      },
      placeholder: 'Description of Requirements',
      theme: 'snow'
    };
  }

  onShowRequirements($event) {
    let idRequirement = $event.target.getAttribute('data-id');
    if (idRequirement != '') {
      this.reviewTableLoader.loading = true;
      this.httpService.get('/project/' + this.currentSelectedIdProject + '/requirement/' + idRequirement).subscribe(
        (response: any) => {
          this.currentSelectedRequirement = response.info;
          this.requirementsDescription.instance.clipboard.dangerouslyPasteHTML(response.description);
          this.reviewTableLoader.loading = false;
          (<any>$("#requirementModal")).modal("show");
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  showDiagram() {
    //TODO
    (<any>$("#diagramModal")).modal("show");
  }

  loadRequirements(callback: ()=>void = ()=>{}) {
    this.reviewTableLoader.loading = true;
    this.reviewTable.options = this.configRequirementTable;
    this.httpService.get('/project/' + this.currentSelectedIdProject + '/requirements').subscribe(
      (response: any) => {
        console.log(response);
        this.reviewTable.refresh(response);
        this.reviewTableLoader.loading = false;
        callback();
      },
      error => {
        console.error(error);
      }
    );
  }

  saveRequirementDescription() {
    if (this.currentSelectedRequirement.id) {
      this.httpService.patch('/project/' + this.currentSelectedIdProject + '/description/' + this.currentSelectedRequirement.id, { 
        text: this.requirementsDescription.instance.root.innerHTML 
      }).subscribe(
        (response: any) => {},
        error => {
          console.error(error);
        }
      );
    }
  }

  changeStatus(newStatus) {
    if (this.currentSelectedRequirement.id) {
      (<any>$("#requirementModal")).modal("hide");
      this.reviewTableLoader.loading = true;
      this.httpService.get('/project/' + this.currentSelectedIdProject + '/idsListInfo/' + this.currentSelectedRequirement.id)
        .subscribe(
          (response: any) => {
            this.httpService.patch('/project/' + this.currentSelectedIdProject + '/status/' + this.currentSelectedRequirement.id, { 
              newStatus: newStatus, 
              prevStatus: 'Review', 
              currentModuleId: response.moduleId,
              idsRequirement: response.idsList
            }).subscribe(
              (response: any) => {
                if (response.changedStatus) {
                  this.loadRequirements(()=>{
                    this.reviewTableLoader.loading = false;
                  });
                } else {
                  this.notificationService.showNotify(new Notification("You can't change status to " + newStatus + "."));
                  this.reviewTableLoader.loading = false;
                }
              },
              error => {
                console.error(error);
                this.notificationService.showNotify(new Notification("You don't have permissions."));
                this.reviewTableLoader.loading = false;
              }
            );
          },
          error => {
            console.error(error);
          }
        );
    }
  }

  openAgainRequirement() {
    this.changeStatus("Open");
  }

  closeRequirement() {
    this.changeStatus("Close");
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
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  onChangeProject() {
    this.reviewTableLoader.loading = true;
    this.currentSelectedIdProject = <string>this.projectSelect.instance.val();
    this.loadRequirements(()=>{
      this.reviewTableLoader.loading = false;
    });
  }
}
