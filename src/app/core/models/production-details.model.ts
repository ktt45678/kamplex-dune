import type { Production } from './production.model';

export interface ProductionDetails extends Production {
  createdAt: Date;
  updatedAt: Date;
}
