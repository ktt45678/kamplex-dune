import { Component, ChangeDetectionStrategy, ContentChildren, QueryList, AfterContentInit, Input, Renderer2, ViewChild, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { TabMenu } from 'primeng/tabmenu';

import { PanelToastDirective } from './panel-toast.directive';
import { TabPanelDirective } from './tab-panel.directive';

@Component({
  selector: 'app-vertical-tab',
  templateUrl: './vertical-tab.component.html',
  styleUrls: ['./vertical-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tabPanelToastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('200ms ease-in-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('200ms ease-in-out', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class VerticalTabComponent implements AfterViewInit, AfterContentInit {
  @Input() contentStyleClass: string = '';
  @Input() panelStyleClass: string = '';
  @Input() width: string = '100vw';
  @Input() height: string = '100vh';
  @Input() menuWidth: string = '15rem';
  @Input() menuSpacingX: string = '4rem';
  @Input() menuSpacingY: string = '2rem';
  @Input() fullContentWidth: boolean = false;
  @ContentChildren(TabPanelDirective) tabs!: QueryList<TabPanelDirective>;
  @ContentChildren(PanelToastDirective) toasts!: QueryList<PanelToastDirective>;
  @ViewChild(Menu) menu?: Menu;
  @ViewChild(TabMenu) tabMenu?: TabMenu;

  menuItems: MenuItem[] = [];
  tabMenuItems: MenuItem[] = [];
  selectedTabId?: number | string;
  selectedTabIndex?: number;
  selectedMenu?: HTMLAnchorElement;
  selectedTabMenu?: HTMLAnchorElement;

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    if (this.menu) {
      const firstMenuItem = this.menu.el.nativeElement.querySelector('.p-menuitem-link');
      this.renderer.addClass(firstMenuItem, 'p-menuitem-link-active');
      firstMenuItem.focus();
      this.selectedMenu = firstMenuItem;
    }
    if (this.tabMenu) {
      const firstMenuItem = this.tabMenu.content.nativeElement.querySelector('.p-menuitem-link');
      this.renderer.addClass(firstMenuItem, 'p-menuitem-link-active');
      firstMenuItem.focus();
      this.selectedTabMenu = firstMenuItem;
    }
  }

  ngAfterContentInit(): void {
    this.initTabs();
  }

  initTabs(): void {
    this.tabs.forEach((tab, index) => {
      !tab.id && (tab.id = `idx-${index}`);
      this.menuItems.push({
        label: tab.label,
        command: (event) => {
          this.selectedMenu = this.activeMenuItem(event.originalEvent);
          this.selectTab(index, tab.id);
        }
      });
      this.tabMenuItems.push({
        label: tab.label,
        command: () => {
          this.selectTab(index, tab.id);
        }
      });
      if (tab.separator) {
        this.menuItems.push({
          separator: true
        });
      }
    });
    this.selectTab(0, this.tabs.first.id);
  }

  selectTab(index: number, id?: number | string) {
    this.selectedTabIndex = index;
    this.selectedTabId = id;
  }

  activeMenuItem(event: any): HTMLAnchorElement {
    const node = event.target.tagName === 'A' ? event.target : event.target.parentNode;
    if (this.selectedMenu)
      this.renderer.removeClass(this.selectedMenu, 'p-menuitem-link-active');
    this.renderer.addClass(node, 'p-menuitem-link-active');
    return node;
  }

  trackId(index: number, item: any): any {
    return item?.id;
  }

  trackTabId(index: number, item: any): any {
    return item?.tabId;
  }

}
