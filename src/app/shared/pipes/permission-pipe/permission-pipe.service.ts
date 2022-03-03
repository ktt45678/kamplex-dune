import { Injectable } from '@angular/core';

import { User, UserDetails } from '../../../core/models';

@Injectable()
export class PermissionPipeService {
  constructor() { }

  hasPermission(user: User | UserDetails, permissions: number[]): boolean {
    if (user.owner) return true;
    if (!user.roles) return false;
    for (let i = 0; i < user.roles.length; i++) {
      for (let j = 0; j < permissions.length; j++) {
        if (user.roles[i].permissions & permissions[j]) return true;
      }
    }
    return false;
  }
}
