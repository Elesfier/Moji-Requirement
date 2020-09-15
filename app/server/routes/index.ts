
export * from '../_common/index';
export * from '../_model/index';

import { adminRoute } from './admin/index';
import { projectRoute } from './project/index';
import { requirementRoute } from './requirement/index';

export const routes = []
  .concat(projectRoute)
  .concat(requirementRoute)
  .concat(adminRoute);
