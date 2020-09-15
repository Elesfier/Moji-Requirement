
import { Schema, Document, Model, Types, model } from 'mongoose';
import { PermissionModel } from '../_model/index';

export interface IUser extends Document
{
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  token: string;
  isAdmin: boolean;
};

let UserSchema: Schema = new Schema({
  username: { type: String, required: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  token: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false }
});

UserSchema.post('remove', (doc) => {
  PermissionModel.remove({ user: doc._id }).exec();;
});

UserSchema.post('findOneAndRemove', (doc) => {
  PermissionModel.remove({ user: doc._id }).exec();;
});

export const UserModel: Model<IUser> = model<IUser>('User', UserSchema);
