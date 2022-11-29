import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { User, UserDetails } from '../models';

@Injectable()
export class UsersService {

  constructor(private http: HttpClient) { }

  findOne(id: string) {
    return this.http.get<User | UserDetails>(`users/${id}`);
  }
}
