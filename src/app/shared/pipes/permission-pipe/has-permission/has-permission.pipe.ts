import { Pipe, PipeTransform } from '@angular/core';

import { PermissionPipeService } from '../permission-pipe.service';
import { User, UserDetails } from '../../../../core/models';

@Pipe({
  name: 'hasPermission'
})
export class HasPermissionPipe implements PipeTransform {
  constructor(private permissionPipeService: PermissionPipeService) { }

  transform(user: User | UserDetails, ...permissions: number[]): boolean {
    return this.permissionPipeService.hasPermission(user, permissions);
  }

}
