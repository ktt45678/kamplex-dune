import { Pipe, PipeTransform } from '@angular/core';

import { PermissionPipeService } from '../permission-pipe.service';
import { UserDetails } from '../../../../core/models';

@Pipe({
  name: 'isGranted'
})
export class IsGrantedPipe implements PipeTransform {
  constructor(private permissionPipeService: PermissionPipeService) { }

  transform(user: UserDetails, permission: number): boolean {
    return this.permissionPipeService.isGranted(user, permission);
  }

}
