import { Production } from '.';

export interface ProductionDetails extends Production {
  createdAt: Date;
  updatedAt: Date;
}
