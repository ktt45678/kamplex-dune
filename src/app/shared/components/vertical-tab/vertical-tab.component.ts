import { Component, ChangeDetectionStrategy, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { TabPanelComponent } from './tab-panel.component';

@Component({
  selector: 'app-vertical-tab',
  templateUrl: './vertical-tab.component.html',
  styleUrls: ['./vertical-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalTabComponent implements AfterContentInit {
  @ContentChildren(TabPanelComponent) tabs!: QueryList<TabPanelComponent>;
  menuItems: MenuItem[] = [];
  selectedTab?: TabPanelComponent;
  selectedMenu?: HTMLAnchorElement;

  constructor() { }

  ngAfterContentInit(): void {
    this.initTabs();
  }

  initTabs(): void {
    this.tabs.forEach(tab => {
      this.menuItems.push({
        label: tab.header,
        command: (event) => {
          this.activeMenuItem(event.originalEvent);
          this.selectTab(tab);
        }
      });
    });

    const activeTabs = this.tabs.filter((tab) => tab.active);

    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    } else {
      activeTabs.forEach(tab => {
        tab.setActive(false);
      });
      this.selectTab(activeTabs[0]);
    }
  }

  selectTab(tab: TabPanelComponent) {
    if (this.selectedTab)
      this.selectedTab.setActive(false);
    tab.setActive(true);
    this.selectedTab = tab;
  }

  activeMenuItem(event: any): void {
    const node = event.target.tagName === 'A' ? event.target : event.target.parentNode;
    if (this.selectedMenu)
      this.selectedMenu.classList.remove('p-menuitem-link-active');
    node.classList.add('p-menuitem-link-active');
    this.selectedMenu = node;
  }

}
