
import { Schema, Document, Model, Types, model } from 'mongoose';
import { PermissionModel } from '../_model/index';

export interface IPermissionType extends Document
{
  name: string;
};

let PermissionTypeSchema: Schema = new Schema({
  name: { type: String, required: true }
});

PermissionTypeSchema.post('remove', (doc) => {
  PermissionModel.remove({ type: doc._id }).exec();;
});

PermissionTypeSchema.post('findOneAndRemove', (doc) => {
  PermissionModel.remove({ type: doc._id }).exec();;
});

export const PermissionTypeModel: Model<IPermissionType> = model<IPermissionType>('PermissionType', PermissionTypeSchema);
