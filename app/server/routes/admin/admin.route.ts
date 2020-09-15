
import { Router, Response, Request } from 'express';
import { authorization } from '../index';
import { IUser, UserModel, IProject, ProjectModel, IPermission, PermissionModel, IPermissionType, PermissionTypeModel } from '../../_model/index';

export const admin = Router();

////////////////////////////////////////////////////////////////////////////////

admin.get('/members', authorization({

  global: { mustBeLogged: true, mustBeAdmin: true }

}),(request: Request, response: Response) => {
  UserModel.find({}).exec((error: any, users: [IUser]) => {
    let userPrepareList = [];
    users.forEach((user)=>{
      userPrepareList.push([
        user.username,
        user.email,
        String(user._id)
      ]);
    });
    response.json(userPrepareList);
  });
});

////////////////////////////////////////////////////////////////////////////////

admin.get('/projects', authorization({

  global: { mustBeLogged: true, mustBeAdmin: true }

}),(request: Request, response: Response) => {

  ProjectModel.find({}).exec((error: any, projects: [IProject]) => {
    let projectsList = [];
    projects.forEach((project)=>{
      projectsList.push([
        project.title,
        String(project._id)
      ]);
    });
    response.json(projectsList);
  });

});

////////////////////////////////////////////////////////////////////////////////

admin.put('/project', authorization({

  global: { mustBeLogged: true, mustBeAdmin: true }

}),(request: Request, response: Response) => {

  ProjectModel.create({
    title: request.body.title || 'none',
    description: 'none' 
  },(error) => {
    if (error) return response.handler({ DBError: true, error: error });
    response.handler({ type: 'PROJECT_IS_ADD' });
  });

});

////////////////////////////////////////////////////////////////////////////////

admin.delete('/project/:id', authorization({

  global: { mustBeLogged: true, mustBeAdmin: true }

}),(request: Request, response: Response) => {

  ProjectModel.findOneAndRemove({
    _id: request.params.id
  }).exec((error, res: IProject) => {
    if (error) return response.handler({ DBError: true, error: error });
    response.handler({ type: 'PROJECT_IS_REMOVE' });
  });

});

////////////////////////////////////////////////////////////////////////////////

admin.get('/permissions/:id', authorization({

  global: { mustBeLogged: true, mustBeAdmin: true }

}),(request: Request, response: Response) => {
  PermissionModel
  .find({ user: request.params.id })
  .populate('type')
  .populate('project')
  .exec((error: any, permissions: [IPermission]) => {
    if (error) return response.handler({ DBError: true, error: error });
    let permissionList = [];
    permissions.forEach((permission: IPermission) => {
      permissionList.push([
        (<any>permission.project).title,
        (<any>permission.type).name,
        permission._id
      ]);
    });
    response.json(permissionList);
  });
});

////////////////////////////////////////////////////////////////////////////////

admin.put('/permissions/:id', authorization({

  global: { mustBeLogged: true, mustBeAdmin: true }

}),(request: Request, response: Response) => {

  PermissionModel
  .find({
    user: request.params.id,
    project: request.body.idProject,
    type: request.body.idPermission
  }).exec((error: any, permissions: [IPermission]) => {
    if (error) return response.handler({ DBError: true, error: error });
    if (permissions.length > 0) {
      response.handler({ type: 'PERMISSIONS_ALREADY_EXIST' });
    } else {
      PermissionModel.create({
        user: request.params.id,
        project: request.body.idProject,
        type: request.body.idPermission
      },(error) => {
        if (error) return response.handler({ DBError: true, error: error });
        response.handler({ type: 'PERMISSIONS_IS_ADDED' });
      });
    }
  });
});

////////////////////////////////////////////////////////////////////////////////

admin.delete('/permissions/:id', authorization({

  global: { mustBeLogged: true, mustBeAdmin: true }

}),(request: Request, response: Response) => {
  PermissionModel.findOneAndRemove({
    _id: request.params.id
  }).exec(function (error) {
    if (error) return response.handler({ DBError: true, error: error });
    response.handler({ type: 'PERMISSIONS_IS_REMOVED' });
  });
});

////////////////////////////////////////////////////////////////////////////////

admin.get('/permissions', authorization({

  global: { mustBeLogged: true }

}),(request: Request, response: Response) => {
  PermissionTypeModel.find({}).exec((error: any, permissionTypes: [IPermissionType]) => {
    let permissionTypeList = [];
    permissionTypes.forEach((permissionType)=>{
      permissionTypeList.push({
        id: permissionType._id,
        text: permissionType.name
      });
    });
    response.json(permissionTypeList);
  });
});

////////////////////////////////////////////////////////////////////////////////
