import { CreateCollectionDto } from './create-collection.dto';

export interface UpdateCollectionDto extends Partial<CreateCollectionDto> {
  translate?: string;
}
