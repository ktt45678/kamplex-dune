import { CreateMediaDto } from './create-media.dto';

export interface UpdateMediaDto extends Omit<CreateMediaDto, 'type'> {
}
