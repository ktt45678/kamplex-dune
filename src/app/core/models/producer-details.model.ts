import { Producer } from '.';

export interface ProducerDetails extends Producer {
  createdAt: Date;
  updatedAt: Date;
}
