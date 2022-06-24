import { Component, ChangeDetectionStrategy, ContentChildren, QueryList, AfterContentInit, Input, Renderer2, ViewChild } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MenuItem } from 'primeng/api';

import { PanelToastDirective } from './panel-toast.directive';
import { TabPanelDirective } from './tab-panel.directive';
import { Menu } from 'primeng/menu';

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
export class VerticalTabComponent implements AfterContentInit {
  private _menu?: Menu;
  private firstMenuItemSelected: boolean = false;

  @Input() contentStyleClass: string = '';
  @Input() panelStyleClass: string = '';
  @Input() menuWidth: string = '15rem';
  @Input() menuSpacingX: string = '4rem';
  @Input() menuSpacingY: string = '2rem';
  @ContentChildren(TabPanelDirective) tabs!: QueryList<TabPanelDirective>;
  @ContentChildren(PanelToastDirective) toasts!: QueryList<PanelToastDirective>;

  @ViewChild(Menu) set menu(value: Menu) {
    if (!value) return;
    this._menu = value;
    if (this.firstMenuItemSelected) return;
    const firstMenuItem = this._menu.el.nativeElement.querySelector('.p-menuitem-link');
    this.renderer.addClass(firstMenuItem, 'p-menuitem-link-active');
    this.selectedMenu = firstMenuItem;
    this.firstMenuItemSelected = true;
  }

  menuItems: MenuItem[] = [];
  selectedTabId?: number | string;
  selectedTabIndex?: number;
  selectedMenu?: HTMLAnchorElement;

  constructor(private renderer: Renderer2) { }

  ngAfterContentInit(): void {
    this.initTabs();
  }

  initTabs(): void {
    this.tabs.forEach((tab, index) => {
      !tab.id && (tab.id = `idx-${index}`);
      this.menuItems.push({
        label: tab.label,
        command: (event) => {
          this.activeMenuItem(event.originalEvent);
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

  activeMenuItem(event: any): void {
    const node = event.target.tagName === 'A' ? event.target : event.target.parentNode;
    if (this.selectedMenu)
      this.renderer.removeClass(this.selectedMenu, 'p-menuitem-link-active');
    this.renderer.addClass(node, 'p-menuitem-link-active');
    this.selectedMenu = node;
  }

  trackId(index: number, item: any): any {
    return item?.id;
  }

  trackTabId(index: number, item: any): any {
    return item?.tabId;
  }

}
