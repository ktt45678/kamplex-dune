import { ChangeDetectionStrategy, Component, HostListener, Input, OnInit } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeHeaderComponent implements OnInit {
  @Input() isFixedNavbar: boolean = false;

  isMobileMenuOpened: boolean = false;
  currentPageYOffset: number;
  bgTransparent: string = 'tw-bg-transparent';
  bgDark: string = 'tw-bg-neutral-900';

  constructor() {
    this.currentPageYOffset = window.pageYOffset;
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.isMobileMenuOpened || !this.isFixedNavbar) return;
    const element = document.getElementById('navbar');
    if (!element) return;
    if (window.pageYOffset > this.currentPageYOffset) {
      element.classList.remove(this.bgTransparent);
      element.classList.add(this.bgDark);
    } else if (!this.isMobileMenuOpened) {
      element.classList.remove(this.bgDark);
      element.classList.add(this.bgTransparent);
    }
  }

  onOpenMenu() {
    this.isMobileMenuOpened = !this.isMobileMenuOpened;
    if (!this.isFixedNavbar) return;
    const element = document.getElementById('navbar');
    if (!element) return;
    if (this.isMobileMenuOpened) {
      element.classList.remove(this.bgTransparent);
      element.classList.add(this.bgDark);
    } else {
      element.classList.remove(this.bgDark);
      element.classList.add(this.bgTransparent);
      if (!this.isFixedNavbar) return;
      if (window.pageYOffset > this.currentPageYOffset) {
        element.classList.remove(this.bgTransparent);
        element.classList.add(this.bgDark);
      } else {
        element.classList.remove(this.bgDark);
        element.classList.add(this.bgTransparent);
      }
    }
  }

  ngOnInit(): void {
  }

}
