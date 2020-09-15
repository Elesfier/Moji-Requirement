
import { Component, ViewChild, ElementRef } from '@angular/core';
import { TreeViewComponent } from '_common/components/tree-view/tree-view.component';
import { ComboBoxComponent } from '_common/components/combo-box/combo-box.component';
import { ContentLoaderComponent } from '_common/components/content-loader/content-loader.component';
import { TextEditorComponent } from '_common/components/text-editor/text-editor.component';
import { DataTableComponent } from '_common/components/data-table/data-table.component';
import * as JQuery from 'jquery';
import 'bootstrap';

import { HttpService } from '_common';
import { NotificationService } from '_common/services/notification/notification.service';
import { Notification } from '_common/services/notification/notification.model';

@Component({
  templateUrl: 'requirements.component.html'
})
export class RequirementsComponent {

  @ViewChild('RequirementsTreeView', {static: false}) 
  requirementsTreeView: TreeViewComponent;

  @ViewChild('ModuleSelect', { static: false })
  moduleSelect: ComboBoxComponent;

  @ViewChild('ProjectSelect', { static: false })
  projectSelect: ComboBoxComponent;

  @ViewChild('RequirementTreeLoader', {static: false}) 
  requirementTreeLoader: ContentLoaderComponent;

  @ViewChild('RequirementsTreeViewLoader', {static: false}) 
  requirementsTreeViewLoader: ContentLoaderComponent;

  @ViewChild('RequirementsDescription', {static: false}) 
  requirementsDescription: TextEditorComponent;

  @ViewChild('RequirementLoader', {static: false}) 
  requirementLoader: ContentLoaderComponent;

  @ViewChild('NewRequirementInput', {static: false}) 
  newRequirementInput: ElementRef;

  currentSelectedIdProject: string = null;
  currentSelectedIdModule: string = null;
  currentSelectedRequirement = {
    name: 'Requirement Not Selected',
    status: null,
    id: null,
    diagram: null,
    hasChildren: true
  };

  requirementTreeConfig = {
    'plugins': [],
    'core' : {
      'data' : [],
      'error': () => {
        console.error('Error appears in Tree View.');
      }
    }
  };

  showDiagram() {
    //TODO
    (<any>$("#diagramModal")).modal("show");
  }

  constructor(private httpService: HttpService, private notificationService: NotificationService) {}

  setupSelects() {
    this.projectSelect.options = { placeholder: "Select Project", allowClear: false, data: [] };
    this.moduleSelect.options = { placeholder: "Select Module", allowClear: false, data: [] };
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
          this.requirementTreeLoader.loading = false;
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  onChangeProject() {
    this.requirementTreeLoader.loading = true;
    this.resetRequirementView();
    this.currentSelectedIdProject = <string>this.projectSelect.instance.val();
    this.loadModules();
  }

  loadModules() {
    let moduleSelectConfig = { placeholder: "Select Module", allowClear: false, data: [] };
    this.moduleSelect.options = moduleSelectConfig;
    this.resetRequirementTree();
    this.httpService.get('/project/' + this.currentSelectedIdProject + '/modules').subscribe(
      (response: any) => {
        if (response.length != 0) {
          moduleSelectConfig.data = response;
          this.moduleSelect.options = moduleSelectConfig;
          this.moduleSelect.instance.on("change.select2", this.onChangeModule.bind(this));
          if (response.length > 0) {
            this.moduleSelect.instance.val(response[0].id).trigger('change.select2');
          } 
        } else {
          this.requirementTreeLoader.loading = false;
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  

  onChangeModule() {
    this.requirementTreeLoader.loading = true;
    this.resetRequirementView();
    this.currentSelectedIdModule = <string>this.moduleSelect.instance.val();
    this.loadRequirementTree();
  }

  loadRequirementTree() {
    this.requirementTreeLoader.loading = true;
    this.httpService.get('/project/' + this.currentSelectedIdProject + '/module/' + this.currentSelectedIdModule + '/requirementTree').subscribe(
      (response: any) => {
        console.log(response);
        if (response.length != 0) {
          this.requirementTreeConfig.core.data = response;
          this.requirementsTreeView.openCloseOnSingleClick = false;
          this.requirementsTreeView.options = this.requirementTreeConfig;
          this.requirementsTreeView.jquery.off("select_node.jstree");
          this.requirementsTreeView.jquery.on("select_node.jstree", this.onSelectNode.bind(this));
        }
        this.requirementTreeLoader.loading = false;
      },
      error => {
        console.error(error);
      }
    );
  }

  addRequirement() {
    if (this.currentSelectedIdModule) {
      let title = this.newRequirementInput.nativeElement.value;
      let selectedNode = this.requirementsTreeView.instance.get_selected(true)[0];
      if (title != '' && selectedNode) {
        this.newRequirementInput.nativeElement.value = '';
        this.requirementTreeLoader.loading = true;
        let idsRequirement = [];
        selectedNode.parents.forEach((id)=>{
          if (id == '#') 
            idsRequirement.unshift(selectedNode.original.id)
          else 
            idsRequirement.push(this.requirementsTreeView.instance.get_node(id).original.id);
        });
        console.log(idsRequirement);
        this.addNewRequirementToTree(idsRequirement, title);
      }
    }
  }

  addNewRequirementToTree(idsRequirement: string[], newRequirementName: string) {
    this.httpService.put('/project/' + this.currentSelectedIdProject + '/module/' + this.currentSelectedIdModule + '/requirementTree', { 
      idsRequirement: idsRequirement, newRequirementName: newRequirementName
    }).subscribe(
      (response: any) => {
        this.loadRequirementTree();
      },
      error => {
        console.error(error);
      }
    );
  }

  revRequirementFromTree(idsRequirement: string[]) {
    this.httpService.post('/project/' + this.currentSelectedIdProject + '/module/' + this.currentSelectedIdModule + '/requirementTree', { 
      idsRequirement: idsRequirement
    }).subscribe(
      (response: any) => {
        if (response.type === "CANT REMOVE ROOT NODE")
          this.notificationService.showNotify(new Notification("You can't remove root node."));
        this.loadRequirementTree();
      },
      error => {
        console.error(error);
        this.notificationService.showNotify(new Notification("You don't have permissions."));
      }
    );
  }

  onSelectNode(event, data) {
    this.loadRequirement(data.node.id, data.node.children.length > 0);
  }

  loadRequirement(idRequirement: string, hasChildren: boolean) {
    this.requirementLoader.loading = true;
    this.httpService.get('/project/' + this.currentSelectedIdProject + '/requirement/' + idRequirement).subscribe(
      (response: any) => {
        this.currentSelectedRequirement = response.info;
        this.currentSelectedRequirement.hasChildren = hasChildren;
        this.requirementsDescription.instance.clipboard.dangerouslyPasteHTML(response.description);
        this.requirementsDescription.instance.enable(true);
        this.setStatus(response.info.status);
        this.requirementLoader.loading = false;
      },
      error => {
        console.error(error);
      }
    );
  }

  deleteNode() {
    let selectedNode = this.requirementsTreeView.instance.get_selected(true)[0];
    if (selectedNode) {
      this.requirementTreeLoader.loading = true;
      this.resetRequirementView();
      let idsRequirement = [];
      selectedNode.parents.forEach((id)=>{
        if (id == '#') 
          idsRequirement.unshift(selectedNode.original.id)
        else 
          idsRequirement.push(this.requirementsTreeView.instance.get_node(id).original.id);
      });
      this.revRequirementFromTree(idsRequirement);
    }
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

  resetRequirementView() {
    this.currentSelectedRequirement = {
      name: 'Requirement Not Selected',
      status: null,
      id: null,
      diagram: null,
      hasChildren: true
    };
    this.requirementsDescription.instance.clipboard.dangerouslyPasteHTML('');
    this.resetStatus();
    this.requirementsDescription.instance.enable(false);
  }

  resetRequirementTree() {
    this.requirementTreeConfig.core.data = [];
    this.requirementsTreeView.options = this.requirementTreeConfig;
    this.requirementsTreeView.jquery.off("select_node.jstree");
  }

  setupStatusButton() {
    let openStatus = JQuery("#requirement-status-open");
    let reviewStatus = JQuery("#requirement-status-review");
    let closeStatus = JQuery("#requirement-status-close");
    openStatus.click(this.onChangeStatus.bind(this));
    reviewStatus.click(this.onChangeStatus.bind(this));
    closeStatus.click(this.onChangeStatus.bind(this));
  }

  getChildrenIdsRequirementFromSelectedNode() {
    let selectedNode = this.requirementsTreeView.instance.get_selected(true)[0];
    if (selectedNode) {
      this.newRequirementInput.nativeElement.value = '';
      this.requirementTreeLoader.loading = true;
      let idsRequirement = [];
      selectedNode.parents.forEach((id)=>{
        if (id == '#') 
          idsRequirement.unshift(selectedNode.original.id)
        else 
          idsRequirement.push(this.requirementsTreeView.instance.get_node(id).original.id);
      });
      return idsRequirement;
    }
  }

  onChangeStatus(event) {
    let value = JQuery(event.target).attr("value");
    if (value !== this.currentSelectedRequirement.status) {
      this.requirementTreeLoader.loading = true;
      this.requirementLoader.loading = true;
      if (this.currentSelectedRequirement.id) {
        this.httpService.patch('/project/' + this.currentSelectedIdProject + '/status/' + this.currentSelectedRequirement.id, { 
          newStatus: value, 
          prevStatus: this.currentSelectedRequirement.status, 
          currentModuleId: this.currentSelectedIdModule,
          idsRequirement: this.getChildrenIdsRequirementFromSelectedNode()
        }).subscribe(
          (response: any) => {
            if (response.changedStatus) {
              this.setStatus(value);
              this.loadRequirementTree();
            } else {
              this.notificationService.showNotify(new Notification("You can't change status to " + value + "."));
              this.requirementsTreeViewLoader.loading = false;
              this.requirementLoader.loading = false;
            }
          },
          error => {
            console.error(error);
            this.notificationService.showNotify(new Notification("You don't have permissions."));
            this.requirementLoader.loading = false;
          }
        );
      }
    }
  }

  setStatus(status: string) {
    let openStatus = JQuery("#requirement-status-open");
    let reviewStatus = JQuery("#requirement-status-review");
    let closeStatus = JQuery("#requirement-status-close");
    openStatus.removeClass('active btn-primary btn-info');
    reviewStatus.removeClass('active btn-primary btn-info');
    closeStatus.removeClass('active btn-primary btn-info');
    this.currentSelectedRequirement.status = status;
    switch(status) {
      case "Open":
        openStatus.addClass('active btn-primary');
        reviewStatus.addClass('btn-info');
        closeStatus.addClass('btn-info');
        break;
      case "Review":
        reviewStatus.addClass('active btn-primary');
        openStatus.addClass('btn-info');
        closeStatus.addClass('btn-info');
        break;
      case "Close":
        closeStatus.addClass('active btn-primary');
        reviewStatus.addClass('btn-info');
        openStatus.addClass('btn-info');
        break;
    }
  }

  resetStatus() {
    let openStatus = JQuery("#requirement-status-open");
    let reviewStatus = JQuery("#requirement-status-review");
    let closeStatus = JQuery("#requirement-status-close");
    openStatus.removeClass('active btn-primary btn-info');
    reviewStatus.removeClass('active btn-primary btn-info');
    closeStatus.removeClass('active btn-primary btn-info');
    openStatus.addClass('btn-info');
    reviewStatus.addClass('btn-info');
    closeStatus.addClass('btn-info');
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
    this.requirementsDescription.instance.enable(false);
  }

  ngAfterViewInit() {
    this.requirementTreeLoader.loading = true;
    this.setupRequirementDescription();
    this.setupStatusButton();
    this.setupSelects();
    this.loadProjects();
  }
}
