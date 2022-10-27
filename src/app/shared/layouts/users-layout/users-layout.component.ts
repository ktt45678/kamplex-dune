import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDetails } from '../../../core/models';

import { AuthService, UsersService } from '../../../core/services';

@Component({
  selector: 'app-users-layout',
  templateUrl: './users-layout.component.html',
  styleUrls: ['./users-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersLayoutComponent implements OnInit {
  currentUser?: UserDetails;

  constructor(private ref: ChangeDetectorRef, private authService: AuthService, private usersService: UsersService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

}
