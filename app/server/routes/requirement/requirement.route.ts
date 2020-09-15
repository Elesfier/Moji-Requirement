
import { Router, Response, Request } from 'express';
import { authorization } from '../index';
import { RequirementModel, IRequirement, RequirementStatus, IProject, ProjectModel, IPermission, PermissionModel, IPermissionType, PermissionTypeModel, ModuleModel, IModule } from '../../_model/index';
import { checkPermissions } from '../project/project.route';

export const requirement = Router();

////////////////////////////////////////////////////////////////////////////////

function addRequirementToTree(requirementTree: any, idsRequirement: string[], newRequirementNode: any, callback: (any)=>void) {

  let parentObject = requirementTree[0];
  let parentArray = requirementTree[0].children;
  let deep = idsRequirement.length;

  while(deep--) {
    let id = idsRequirement[deep - 1];
    for(let i = 0; i < parentArray.length; ++i) {
      if (id == parentArray[i].id) {
        parentArray = parentArray[i].children;
        parentObject = parentArray[i];
      }
    }
  }

  parentArray.push(newRequirementNode);
  idsRequirement.unshift(newRequirementNode.id);
  changeStatusOfRequirementTree(requirementTree, 'Open', idsRequirement, (newTree)=>{
    callback(newTree);
  });

}

////////////////////////////////////////////////////////////////////////////////

function revRequirementFromTree(requirementTree: any, idsRequirement: string[], callback: (any, rev)=>void) {

  let requirementIdsToRemove = [];
  let parentObject = null;
  let targetObject = requirementTree[0];
  let deep = idsRequirement.length;
  let indexForParent = null;

  while(deep--) {
    let id = idsRequirement[deep - 1];
    for(let i = 0; i < targetObject.children.length; ++i) {
      if (id == targetObject.children[i].id) {
        parentObject = targetObject;
        targetObject = targetObject.children[i];
        if (deep == 1) {
          indexForParent = i;
        }
        break;
      }
    }
  }

  let queue = [];
  queue.push(targetObject);
  while (queue.length != 0) {
    let node = queue.shift();
    requirementIdsToRemove.push(node.id);
    for(let i = 0; i < node.children.length; ++i) {
      queue.push(node.children[i]);
    }
  }

  parentObject.children.splice(indexForParent, 1);

  changeStatusOfRequirementTree(requirementTree, 'Close', idsRequirement.slice(1), (tree) => {
    callback(tree, requirementIdsToRemove)
  });
}

////////////////////////////////////////////////////////////////////////////////

function changeStatusOfRequirementTreeToOpen(requirementTree: any, idsRequirement: string[]) {
  let currentObject = requirementTree[0];
  let deep = idsRequirement.length;

  while(deep--) {
    let id = idsRequirement[deep - 1];
    if (currentObject.status == "Close")
      currentObject.status = "Open";
    for(let i = 0; i < currentObject.children.length; ++i) {
      if (id == currentObject.children[i].id) {
        currentObject = currentObject.children[i];
        break;
      }
    }
  }

  return requirementTree;
}

////////////////////////////////////////////////////////////////////////////////

function changeStatusOfRequirementTreeToCloseIfMust(requirementTree: any, idsRequirement: string[], requirementToChange: any[]) {
  let listOfNodes = [];
  let currentObject = requirementTree[0];
  let deep = idsRequirement.length;

  while(deep--) {
    let id = idsRequirement[deep - 1];
    listOfNodes.push(currentObject);
    for(let i = 0; i < currentObject.children.length; ++i) {
      if (id == currentObject.children[i].id) {
        currentObject = currentObject.children[i];
        break;
      }
    }
  }

  let canClose = true;
  for (let i = listOfNodes.length - 1; i >= 0; --i) {
    canClose = true;
    for (let j = 0; j < listOfNodes[i].children.length; ++j) {
      if (listOfNodes[i].children[j].status != "Close") {
        canClose = false;
      }
    }
    if (canClose) {
      listOfNodes[i].status = 'Close';
      requirementToChange.push(listOfNodes[i].id);
    } else {
      break;
    }
  }

  return requirementTree;
}

////////////////////////////////////////////////////////////////////////////////

function getIdsListFromRec(requirementTree: any, idRequirement: string, idsList: string[]): boolean {
  if (requirementTree.id == idRequirement) {
    idsList.push(requirementTree.id);
    return true;
  } else {
    for (let i = 0; i < requirementTree.children.length; ++i) {
      if (getIdsListFromRec(requirementTree.children[i], idRequirement, idsList)) {
        idsList.push(requirementTree.id);
        return true;
      }
    }
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////

function getIdsListFrom(requirementTree: any, idRequirement: string) {
  let idsList = [];
  getIdsListFromRec(requirementTree[0], idRequirement, idsList);
  return idsList;
}

////////////////////////////////////////////////////////////////////////////////

function changeStatusOfRequirementTree(requirementTree: any, newStatus: string, idsRequirement: string[], callback: (any)=>void) {

  let requirementToChange = [];
  let requirementStatusToChange = null;

  if (newStatus === "Open" || newStatus === "Review") {
    requirementStatusToChange = "Open";
    requirementTree = changeStatusOfRequirementTreeToOpen(requirementTree, idsRequirement);
    requirementToChange = idsRequirement.slice(1);
  } else if (newStatus === "Close") {
    requirementStatusToChange = "Close";
    requirementTree = changeStatusOfRequirementTreeToCloseIfMust(requirementTree, idsRequirement, requirementToChange);
  } else {
    callback(requirementTree);
    return;
  }

  RequirementModel.update(
    { _id: { $in: requirementToChange }}, 
    { $set: { status: requirementStatusToChange } },
    { multi: true }
  ).exec((error: any) => {
    callback(requirementTree);
  });

}

////////////////////////////////////////////////////////////////////////////////

requirement.get('/project/:projectId/modules', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        ModuleModel
          .find({ project: request.params.projectId })
          .exec((error: any, modules: [IModule]) => {
            if (error) return response.handler({ DBError: true, error: error });
            
            let moduleMap = {};
            let moduleList = [];
      
            modules.forEach((module: IModule)=>{
              moduleMap[module._id] = module.title;
            });
      
            Object.keys(moduleMap).forEach((key)=>{
              moduleList.push({ id: key, text: moduleMap[key] });
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

requirement.get('/project/:projectId/module/:moduleId/requirementTree', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        ModuleModel
          .findOne({ _id: request.params.moduleId })
          .exec((error: any, module: IModule) => {
            if (error) return response.handler({ DBError: true, error: error });
            response.json(module.requirementTree);
          });
      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

requirement.put('/project/:projectId/module/:moduleId/requirementTree', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {

        ModuleModel
          .findOne({ _id: request.params.moduleId })
          .exec((error: any, module: IModule) => {
            if (error) return response.handler({ DBError: true, error: error });
            
            RequirementModel.create({
              title: request.body.newRequirementName,
              description: 'Empty',
              module: module._id,
              status: RequirementStatus[0]
            },(error, requirement: IRequirement) => {
              if (error) return response.handler({ DBError: true, error: error });

              let newRequirement = {
                text: request.body.newRequirementName,
                id: requirement._id,
                status: RequirementStatus[0],
                children : []
              };

              addRequirementToTree(module.requirementTree, request.body.idsRequirement, newRequirement, (newRequirementTree)=>{
                ModuleModel
                  .update({ _id: module._id }, { 
                    $set: { requirementTree: newRequirementTree } 
                  }).exec((error: any, project: IProject) => {
                    if (error) return response.handler({ DBError: true, error: error });
                    response.handler({ type: 'REQUIREMENT_IS_ADDED' });
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

requirement.post('/project/:projectId/module/:moduleId/requirementTree', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {

        if (request.body.idsRequirement.length == 1) {
          response.handler({ status: 200, type: 'CANT REMOVE ROOT NODE' });
          return;
        }

        ModuleModel
          .findOne({ _id: request.params.moduleId })
          .exec((error: any, module: IModule) => {
            if (error) return response.handler({ DBError: true, error: error });

            revRequirementFromTree(module.requirementTree, request.body.idsRequirement, (newRequirementTree, requirementIdsToRemove) => {

              ModuleModel
                .update({ _id: module._id }, { 
                  $set: { requirementTree: newRequirementTree } 
                }).exec((error: any) => {
                  if (error) return response.handler({ DBError: true, error: error });

                  RequirementModel
                    .remove({ _id: { $in: requirementIdsToRemove }})
                    .exec((error: any) => {
                      if (error) return response.handler({ DBError: true, error: error });
                      response.handler({ type: 'REQUIREMENT_IS_REMOVED' });
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

requirement.get('/project/:projectId/requirement/:requirementId', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {
        RequirementModel
          .findOne({ _id: request.params.requirementId })
          .exec((error: any, requirement: IRequirement) => {
            if (error) return response.handler({ DBError: true, error: error });

            response.json({
              info: {
                id: requirement._id,
                name: requirement.title,
                status: requirement.status,
                diagram: null,
                hasChildren: true
              },
              description: requirement.description
            });

          });
      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

requirement.patch('/project/:projectId/description/:requirementId', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {

        RequirementModel
          .update({ _id: request.params.requirementId }, { $set: { description: request.body.text } })
          .exec((error: any, requirement: IRequirement ) => {
            if (error) return response.handler({ DBError: true, error: error });
            response.handler({ status: 200, type: 'REQUIREMENT_DESCRIPTION_UPDATED' });
          });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

requirement.patch('/project/:projectId/status/:requirementId', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  let prevStatus = request.body.prevStatus;
  let newStatus = request.body.newStatus;
  let permissionTable = [];

  if (prevStatus === "Close" && newStatus !== "Close") {
    permissionTable = ["Project Owner"];
  } else if (prevStatus === "Review" && newStatus === "Close") {
    permissionTable = ["Reviewer", "Project Owner"];
  } else if (prevStatus === "Review" && newStatus === "Open") {
    permissionTable = ["Reviewer", "Project Owner"];
  } else if (prevStatus === "Open" && newStatus === "Close") {
    permissionTable = ["Project Owner"];
  } else if (prevStatus === "Open" && newStatus !== "Open") {
    permissionTable = ["Project Owner", "Member", "Reviewer"];
  }

  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    permissionTable,
    (hasPermission: boolean) => {
      if (hasPermission) {

        let thinksToChange = { $set: { status: newStatus } };
        if (newStatus === "Review") {
          (<any>thinksToChange.$set).lastRequested = request['_currentUser']._id;
        }

        RequirementModel
          .update({ _id: request.params.requirementId }, thinksToChange)
          .populate("module")
          .exec((error: any, requirement: IRequirement ) => {
            if (error) return response.handler({ DBError: true, error: error });
            ModuleModel
              .findOne({ _id: request.body.currentModuleId })
              .exec((error: any, module: IModule) => {
                if (error) return response.handler({ DBError: true, error: error });

                changeStatusOfRequirementTree(
                  module.requirementTree,
                  newStatus, 
                  request.body.idsRequirement, 
                  (newRequirementTree) => {
                    ModuleModel
                      .update({ _id: module._id }, { 
                        $set: { requirementTree: newRequirementTree } 
                      }).exec((error: any) => {
                        if (error) return response.handler({ DBError: true, error: error });
                        response.json({ changedStatus: true });
                      });
                  }
                );
                
              });
            });

      } else {
        response.json({ changedStatus: false });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

requirement.get('/project/:projectId/requirements', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {

        ModuleModel
          .find({ project: request.params.projectId })
          .exec((error: any, modules: [IModule]) => {
            if (error) return response.handler({ DBError: true, error: error });
            let moduleIds = [];
            modules.forEach((module: IModule)=>{
              moduleIds.push(module._id);
            });
            RequirementModel
              .find({ module: { $in: moduleIds }, status: "Review" })
              .populate("lastRequested")
              .exec((error: any, requirements: [IRequirement]) => {
                if (error) return response.handler({ DBError: true, error: error });
                let requirementToReview = [];
                requirements.forEach((requirement)=>{
                  let lastRequested = '-';
                  if (requirement.lastRequested && (<any>requirement.lastRequested).firstname) {
                    lastRequested = (<any>requirement.lastRequested).firstname + " " + (<any>requirement.lastRequested).lastname;
                  }
                  requirementToReview.push([requirement.title, lastRequested, requirement._id]);
                });
                response.json(requirementToReview);
              });
          });

      } else {
        response.handler({ status: 403, type: 'NO_PERMISSIONS' });
      }
    }
  );

});

////////////////////////////////////////////////////////////////////////////////

requirement.get('/project/:projectId/idsListInfo/:requirementId', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {

  checkPermissions(
    request['_currentUser']._id,
    request.params.projectId,
    ["Project Owner", "Member", "Reviewer"],
    (hasPermission: boolean) => {
      if (hasPermission) {

        RequirementModel
          .findOne({ _id: request.params.requirementId })
          .exec((error: any, requirement: IRequirement) => {
            if (error) return response.handler({ DBError: true, error: error });
            ModuleModel
              .findOne({ _id: requirement.module })
              .exec((error: any, module: IModule) => {
                if (error) return response.handler({ DBError: true, error: error });

                response.json({
                  moduleId: module._id,
                  idsList: getIdsListFrom(module.requirementTree, request.params.requirementId)
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
