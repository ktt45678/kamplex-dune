import { CreateMediaDto } from './create-media.dto';

export interface UpdateMediaDto extends Partial<Omit<CreateMediaDto, 'type'>> {
  updateTimestamp?: boolean;
}
