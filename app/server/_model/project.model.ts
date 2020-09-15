
import { Schema, Document, Model, Types, model } from 'mongoose';
import { PermissionModel, ModuleModel } from '../_model/index';

export interface IProject extends Document
{
  title: string;
  description: string;
};

let ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true, default: '' }
});

ProjectSchema.post('remove', (doc) => {
  PermissionModel.remove({ project: doc._id }).exec();
  ModuleModel.remove({ project: doc._id }).exec();
});

ProjectSchema.post('findOneAndRemove', (doc) => {
  PermissionModel.remove({ project: doc._id }).exec();
  ModuleModel.remove({ project: doc._id }).exec();
});

export const ProjectModel: Model<IProject> = model<IProject>('Project', ProjectSchema);
