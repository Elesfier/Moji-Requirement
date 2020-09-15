
import { Schema, Document, Model, Types, model } from 'mongoose';

export interface IPermission extends Document
{
  user: Types.ObjectId;
  project: Types.ObjectId;
  type: Types.ObjectId;
};

let PermissionSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  type: { type: Schema.Types.ObjectId, ref: 'PermissionType', required: true }
});

export const PermissionModel: Model<IPermission> = model<IPermission>('Permission', PermissionSchema);
