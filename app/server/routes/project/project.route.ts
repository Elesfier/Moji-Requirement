
import { Router, Response, Request } from 'express';
import { authorization } from '../index';
import { IUser, UserModel, IProject, ProjectModel, IPermission, PermissionModel, IPermissionType, PermissionTypeModel, ModuleModel, IModule, RequirementStatus, RequirementModel, IRequirement } from '../../_model/index';

const wkhtmltopdf = require('wkhtmltopdf');

export const project = Router();

////////////////////////////////////////////////////////////////////////////////

export function checkPermissions(userId: string, projectId: string, permissionName: string[], callback: (hasPermission: boolean)=>void) {
  PermissionModel
  .find({ user: userId, project: projectId })
  .populate('type')
  .exec((error: any, permissions: [IPermission]) => {
    if (error) {
      console.error(error);
      callback(false);
    }
    let hasPermission: boolean = false;
    permissions.forEach((permission)=>{
      let name = (<any>permission.type).name;
      if (permissionName.includes(name)) {
        hasPermission = true;
      }
    });
    callback(hasPermission);
  });
}

////////////////////////////////////////////////////////////////////////////////

project.get('/project/list', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  PermissionModel
    .find({ user: request['_currentUser']._id })
    .populate('project')
    .exec((error: any, permissions: [IPermission]) => {
      if (error) return response.handler({ DBError: true, error: error });
      let projectMap = {};
      let projectList = [];

      permissions.forEach((permission)=>{
        projectMap[(<any>permission.project)._id] = (<any>permission.project).title;
      });

      Object.keys(projectMap).forEach((key)=>{
        projectList.push({ id: key, text: projectMap[key] });
      });

      response.json(projectList);
    });

});

////////////////////////////////////////////////////////////////////////////////

project.get('/project/description/:id', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.id,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        
        ProjectModel.findOne({ _id: request.params.id }).exec((error: any, project: IProject) => {
          if (error) return response.handler({ DBError: true, error: error });
          response.json(project.description);
        });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

project.patch('/project/description/:id', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.id,
    ["Project Owner"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        ProjectModel
          .update({ _id: request.params.id }, { $set: { description: request.body.text } })
          .exec((error: any, project: IProject) => {
            if (error) return response.handler({ DBError: true, error: error });
            response.handler({ status: 200, type: 'DESCRIPTION_UPDATED' });
          });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

project.get('/project/modules/:id', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.id,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        
        ModuleModel
          .find({ project: request.params.id })
          .exec((error: any, modules: [IModule]) => {
            if (error) return response.handler({ DBError: true, error: error });
            let moduleList = [];
            modules.forEach((module: IModule) => {
              moduleList.push([module.title, module._id]);
            });
            response.json(moduleList);
          });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

project.put('/project/modules/:id', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.id,
    ["Project Owner"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        
        ModuleModel.create({
          title: request.body.title,
          project: request.params.id,
          requirementTree: []
        },(error, module: IModule) => {
          if (error) return response.handler({ DBError: true, error: error });

          RequirementModel.create({
            title: request.body.title,
            description: 'Empty',
            module: module._id,
            status: RequirementStatus[0]
          },(error, requirement: IRequirement) => {
            if (error) return response.handler({ DBError: true, error: error });
            
            ModuleModel
              .update({ _id: module._id }, { 
                $set: { requirementTree: [{ "text" : request.body.title, "id": requirement._id, "status": RequirementStatus[0], "children" : [] }] } 
              }).exec((error: any, project: IProject) => {
                if (error) return response.handler({ DBError: true, error: error });
                response.handler({ type: 'MODULE_IS_ADDED' });
              });

          });

        });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

project.post('/project/modules/:id', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.id,
    ["Project Owner"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        
        ModuleModel.findOneAndRemove({
          _id: request.body.moduleId
        },(error) => {
          if (error) return response.handler({ DBError: true, error: error });
          response.handler({ type: 'MODULE_IS_REMOVED' });
        });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

project.post('/project/module/stats/:id', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.id,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        
        ModuleModel
          .findOne({ _id: request.body.moduleId })
          .exec((error: any, moduleItem: IModule) => {
            if (error) return response.handler({ DBError: true, error: error });

            RequirementModel
              .find({ module: request.body.moduleId })
              .exec((error: any, requirements: [IRequirement]) => {
                  if (error) return response.handler({ DBError: true, error: error });

                  let requirementsInfo = { 
                    title: 'Module not Selected',
                    requirements: 0,
                    open: 0,
                    review: 0,
                    close: 0
                  };

                  if (moduleItem) {
                    requirementsInfo.title = moduleItem.title;
                  }

                  requirements.forEach((requirement)=>{
                    requirementsInfo.requirements += 1;
                    switch(requirement.status) {
                      case "Open":
                        requirementsInfo.open += 1;
                        break;
                      case "Close":
                        requirementsInfo.close += 1;
                        break;
                      case "Review":
                        requirementsInfo.review += 1;
                        break;
                    }
                  });

                  response.json(requirementsInfo);
              });

          });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

project.post('/project/stats/:id', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.id,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        
        ModuleModel
          .find({ project: request.params.id })
          .exec((error: any, modules: [IModule]) => {
            if (error) return response.handler({ DBError: true, error: error });

            let modulesIds = [];
            modules.forEach((module) => { modulesIds.push(module._id); });

            RequirementModel
              .find({ module: { $in: modulesIds } })
              .exec((error: any, requirements: [IRequirement]) => {
                  if (error) return response.handler({ DBError: true, error: error });

                  let requirementsInfo = { 
                    requirements: 0,
                    open: 0,
                    review: 0,
                    close: 0
                  };

                  requirements.forEach((requirement)=>{
                    requirementsInfo.requirements += 1;
                    switch(requirement.status) {
                      case "Open":
                        requirementsInfo.open += 1;
                        break;
                      case "Close":
                        requirementsInfo.close += 1;
                        break;
                      case "Review":
                        requirementsInfo.review += 1;
                        break;
                    }
                  });

                  response.json(requirementsInfo);
              });

          });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});
////////////////////////////////////////////////////////////////////////////////

function generateReport(project: IProject, modules: { module: IModule, requirements: IRequirement[] }[]) {

  let inside = '';

  if (project) {

    let totalRequirementCount = 0;
    let totalOpenCount = 0;
    let totalCloseCount = 0;
    let totalReviewCount = 0;

    inside += '<h1>Specification report for the "' + project.title + '" project</h1>';
    
    inside += '<p>' + '<h4>Project Modules:</h4>' + '</p>';
    inside += '<hr>';
    inside += '<table style="width:100%">';
    inside += '<tr>';
    inside += '<th>' + 'Name' + '</th>';
    inside += '<th>' + 'Requirement Number' + '</th>';
    inside += '<th>' + 'Open' + '</th>';
    inside += '<th>' + 'Close' + '</th>';
    inside += '<th>' + 'Review' + '</th>';
    inside += '</tr>';
    modules.forEach((moduleItem)=>{
      inside += '<tr>';
      inside += '<th>' + moduleItem.module.title + '</th>';

      let requirementCount = 0;
      let openCount = 0;
      let closeCount = 0;
      let reviewCount = 0;

      moduleItem.requirements.forEach((requirement) => {
        requirementCount++;
        switch(requirement.status) {
          case "Open":
            openCount++;
            break;
          case "Close":
            closeCount++;
            break;
          case "Review":
            reviewCount++;
            break;
        }
      });

      totalRequirementCount += requirementCount;
      totalOpenCount += openCount;
      totalCloseCount += closeCount;
      totalReviewCount += reviewCount;

      inside += '<th>' + requirementCount + '</th>';
      inside += '<th>' + openCount + '</th>';
      inside += '<th>' + reviewCount + '</th>';
      inside += '<th>' + closeCount + '</th>';
      inside += '</tr>';
    });
    inside += '</table>';
    inside += '<hr>';

    inside += '<p>' + '<h4>Project Statuses:</h4>' + '</p>';
    inside += '<hr>';
    inside += '<table style="width:100%">';
    inside += '<tr>';
    inside += '<th>' + 'Total Requirement Number' + '</th>';
    inside += '<th>' + 'Total Open' + '</th>';
    inside += '<th>' + 'Total Review' + '</th>';
    inside += '<th>' + 'Total Close' + '</th>';
    inside += '</tr>';
    inside += '<tr>';
    inside += '<th>' + totalRequirementCount + '</th>';
    inside += '<th>' + totalOpenCount + '</th>';
    inside += '<th>' + totalReviewCount + '</th>';
    inside += '<th>' + totalCloseCount + '</th>';
    inside += '</tr>';
    inside += '</table>';
    inside += '<hr>';

    inside += '<p>' + '<h4>Project Description:</h4>' + '</p>';
    inside += '<hr>';
    inside += '<p>' + project.description + '</p>';
    inside += '<hr>';
  } else {
    inside += '<h1>Specification report for the "' + modules[0].module.title + '" module</h1>';
  }

  modules.forEach((moduleItem)=>{
    let pStarter = '<h2>';
    if (project) {
      pStarter = '<h2 style="page-break-before: always">';
    } 

    let totalRequirementCount = 0;
    let totalOpenCount = 0;
    let totalCloseCount = 0;
    let totalReviewCount = 0;

    moduleItem.requirements.forEach((requirement) => {
      totalRequirementCount++;
      switch(requirement.status) {
        case "Open":
          totalOpenCount++;
          break;
        case "Close":
          totalCloseCount++;
          break;
        case "Review":
          totalReviewCount++;
          break;
      }
    });

    if (project) {
      inside += pStarter + 'Module "' + moduleItem.module.title + '"</h2>';
    }

    inside += '<p>' + '<h4>Module Statuses:</h4>' + '</p>';
    inside += '<hr>';
    inside += '<table style="width:100%">';
    inside += '<tr>';
    inside += '<th>' + 'Total Requirement Number' + '</th>';
    inside += '<th>' + 'Total Open' + '</th>';
    inside += '<th>' + 'Total Review' + '</th>';
    inside += '<th>' + 'Total Close' + '</th>';
    inside += '</tr>';
    inside += '<tr>';
    inside += '<th>' + totalRequirementCount + '</th>';
    inside += '<th>' + totalOpenCount + '</th>';
    inside += '<th>' + totalReviewCount + '</th>';
    inside += '<th>' + totalCloseCount + '</th>';
    inside += '</tr>';
    inside += '</table>';
    inside += '<hr>';
    inside += '<br>';
    inside += '<br>';

    let requirementMap = {};

    moduleItem.requirements.forEach((requirement) => {
      requirementMap[requirement._id] = requirement;
    });

    let queue = [];
    let isFirst = true;
    queue.push({ object: moduleItem.module.requirementTree[0], path: [moduleItem.module.requirementTree[0].text] });
    while(queue.length != 0) {
      let next = queue.shift();

      if (isFirst) {
        inside += '<h3>Root Requirement "' + requirementMap[next.object.id].title + '"</h3>';
        isFirst = false;
      } else {
        inside += '<h3>Requirement "' + requirementMap[next.object.id].title + '"</h3>';
      }

      inside += '<table style="width:100%">';

      inside += '<colgroup>';
      inside += '<col span="1" style="width: 50%;">';
      inside += '<col span="1" style="width: 50%;">';
      inside += '</colgroup>';

      inside += '<tr>';
      inside += '<th>' + 'Requirement Tree Path' + '</th>';
      inside += '<th>' + 'Requirement Status' + '</th>';
      inside += '</tr>';

      inside += '<tr>';

      inside += '<th>';
      for (let i = 0; i < next.path.length; ++i) {
        inside += next.path[i];
        if (i+1 != next.path.length) inside += "  >  ";
      }
      inside += '</th>';
      
      let statusClass = "";
      switch(requirementMap[next.object.id].status) {
        case "Open":
          statusClass = "open-status";
          break;
        case "Close":
          statusClass = "close-status";
          break;
        case "Review":
          statusClass = "review-status";
          break;
      }

      inside += '<th>';
      inside += '<span class="' + statusClass + '">' + requirementMap[next.object.id].status  + '</span>';
      inside += '</th>';

      inside += '</tr>';

      inside += '<tr>';
      inside += '<th colspan="2" style="text-align: left;">';
      inside += '<br>';
      inside += requirementMap[next.object.id].description;
      inside += '<br>';
      inside += '</th>';
      inside += '</tr>';

      inside += '</table>';

      /* TODO
      inside += '<p>' + '<h4>Requirement Diagram:</h4>' + '</p>';
      inside += '<hr>';
      inside += '<p>' + "NONE" + '</p>';
      inside += '<hr>';
      */

      next.object.children.forEach((child)=>{
        queue.push({ object: child, path: next.path.concat(child.text) });
      });
    }

  });

  return `<!DOCTYPE>
    <html>
        <head>
            <meta charset="UTF-8" />
            <style>
              table, th, td {
                border: 1px solid black;
              }
              .open-status { color: red; }
              .close-status { color: green; }
              .review-status { color: #ff7f00; }
            </style>
        </head>
        <body>`+ inside +`</body>
    </html>`;
}

////////////////////////////////////////////////////////////////////////////////

project.post('/generate-project-report/:projectId', authorization({

  global: { mustBeLogged: true }

}), async (request: Request, response: Response) => {
  
  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {

        response.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=project-report.pdf'
        });

        ProjectModel
          .findOne({ _id: request.params.projectId })
          .exec((error: any, project: IProject) => {
            if (error) return response.handler({ DBError: true, error: error });
            ModuleModel
              .find({ project: request.params.projectId })
              .exec((error: any, modules: [IModule]) => {
                if (error) return response.handler({ DBError: true, error: error });
                let modulesWithRequirements = [];
                let counter = modules.length;
                modules.forEach((module)=>{
                  RequirementModel
                    .find({ module: module._id })
                    .populate('module')
                    .exec((error: any, requirements: [IRequirement]) => {
                      if (error) return response.handler({ DBError: true, error: error });
                      modulesWithRequirements.push({
                        module: requirements[0].module,
                        requirements: requirements
                      });
                      counter--;
                      if (counter == 0) {
                        wkhtmltopdf(generateReport(project, modulesWithRequirements), { pageSize: 'letter' }).pipe(response);
                      }
                    });
                });

              });
          });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

project.post('/generate-module-report/:projectId/:moduleId', authorization({

  global: { mustBeLogged: true }

}), async (request: Request, response: Response) => {
  
  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        
        response.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=project-report.pdf'
        });

        ModuleModel
          .findOne({ _id: request.params.moduleId })
          .exec((error: any, module: IModule) => {
            if (error) return response.handler({ DBError: true, error: error });
            let modulesWithRequirements = [];
            
            RequirementModel
              .find({ module: module._id })
              .exec((error: any, requirements: [IRequirement]) => {
                if (error) return response.handler({ DBError: true, error: error });
                modulesWithRequirements.push({
                  module: module,
                  requirements: requirements
                });
                wkhtmltopdf(generateReport(null, modulesWithRequirements), { pageSize: 'letter' }).pipe(response);
              });
            
          });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////
