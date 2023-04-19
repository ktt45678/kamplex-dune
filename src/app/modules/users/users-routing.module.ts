import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsersLayoutComponent } from './layouts/users-layout';
import { SettingsLayoutComponent } from './layouts/settings-layout';
import { HistoryComponent } from './pages/history/history.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RatedComponent } from './pages/rated/rated.component';
import { AccountSettingsComponent } from './pages/settings/account-settings/account-settings.component';
import { ProfileSettingsComponent } from './pages/settings/profile-settings/profile-settings.component';
import { PrivacySettingsComponent } from './pages/settings/privacy-settings/privacy-settings.component';
import { MediaSettingsComponent } from './pages/settings/media-settings/media-settings.component';
import { SubtitleSettingsComponent } from './pages/settings/subtitle-settings/subtitle-settings.component';

const routes: Routes = [
  {
    path: 'settings',
    component: SettingsLayoutComponent,
    children: [
      {
        path: '',
        component: AccountSettingsComponent,
        pathMatch: 'full',
        data: {
          title: 'accountSettings'
        }
      },
      {
        path: 'profile',
        component: ProfileSettingsComponent,
        data: {
          title: 'profileSettings'
        }
      },
      {
        path: 'privacy',
        component: PrivacySettingsComponent,
        data: {
          title: 'privacySettings'
        }
      },
      {
        path: 'media',
        component: MediaSettingsComponent,
        data: {
          title: 'mediaSettings'
        }
      },
      {
        path: 'subtitle',
        component: SubtitleSettingsComponent,
        data: {
          title: 'subtitleSettings'
        }
      }
    ]
  },
  {
    path: ':id',
    component: UsersLayoutComponent,
    data: {
      applyToChildren: true,
      disableTitleStrategy: true,
      fixedNavbarSpacing: false,
      keepScrollPosition: true
    },
    children: [
      {
        path: '',
        component: ProfileComponent,
        pathMatch: 'full'
      },
      {
        path: 'history',
        component: HistoryComponent
      },

      {
        path: 'playlists',
        component: PlaylistsComponent
      },
      {
        path: 'rated',
        component: RatedComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
