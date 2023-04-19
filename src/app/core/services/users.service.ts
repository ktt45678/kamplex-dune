import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { UpdateUserDto, UpdateUserSettingsDto } from '../dto/users';
import { User, UserDetails, UserSettings } from '../models';

@Injectable()
export class UsersService {

  constructor(private http: HttpClient) { }

  findOne(id: string) {
    return this.http.get<User | UserDetails>(`users/${id}`);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.http.patch<UserDetails>(`users/${id}`, updateUserDto);
  }

  uploadAvatar(id: string, avatar: File) {
    const data = new FormData();
    data.set('file', avatar);
    return this.http.patch<UserDetails>(`users/${id}/avatar`, data);
  }

  deleteAvatar(id: string) {
    return this.http.delete(`users/${id}/avatar`);
  }

  uploadBanner(id: string, banner: File) {
    const data = new FormData();
    data.set('file', banner);
    return this.http.patch<UserDetails>(`users/${id}/banner`, data);
  }

  deleteBanner(id: string) {
    return this.http.delete(`users/${id}/banner`);
  }

  updateSettings(id: string, updateUserSettingsDto: UpdateUserSettingsDto) {
    return this.http.patch<UserSettings>(`users/${id}/settings`, updateUserSettingsDto);
  }
}
