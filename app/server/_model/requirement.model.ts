
import { Schema, Document, Model, Types, model } from 'mongoose';

export const RequirementStatus = ['Open', 'Review', 'Close'];

export interface IRequirement extends Document
{
  title: string;
  module: Types.ObjectId;
  description: string;
  status: string;
  lastRequested: Types.ObjectId;
};

let RequirementSchema: Schema = new Schema({
  title: { type: String, required: true },
  module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  description: { type: String, required: true, default: '' },
  status: { type: String, required: true, enum: RequirementStatus, default: RequirementStatus[0] },
  lastRequested: { type: Schema.Types.ObjectId, ref: 'User', required: false },
});

export const RequirementModel: Model<IRequirement> = model<IRequirement>('Requirement', RequirementSchema);
