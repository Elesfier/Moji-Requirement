
import { Schema, Document, Model, Types, model } from 'mongoose';
import { RequirementModel } from '../_model/index';

export interface IModule extends Document
{
  title: string;
  project: Types.ObjectId;
  requirementTree: Schema.Types.Mixed;
};

let ModuleSchema: Schema = new Schema({
  title: { type: String, required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  requirementTree: { type: Schema.Types.Mixed, required: true, default: {} }
});

ModuleSchema.post('remove', (doc) => {
  RequirementModel.remove({ module: doc._id }).exec();
});

ModuleSchema.post('findOneAndRemove', (doc) => {
  RequirementModel.remove({ module: doc._id }).exec();
});

export const ModuleModel: Model<IModule> = model<IModule>('Module', ModuleSchema);
