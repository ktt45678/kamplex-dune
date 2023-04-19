import { animate, animation, style, transition, trigger, useAnimation } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, NgModule, ViewEncapsulation } from '@angular/core';
import { Sidebar } from 'primeng/sidebar';

const showAnimation = animation([style({ transform: '{{transform}}', opacity: 0 }), animate('{{transition}}')]);

const hideAnimation = animation([animate('{{transition}}', style({ transform: '{{transform}}', opacity: 0 }))]);

@Component({
  selector: 'p-altSidebar',
  template: `
        <div
            #container
            [ngClass]="{
                'p-sidebar': true,
                'p-sidebar-active': visible,
                'p-sidebar-left': position === 'left' && !fullScreen,
                'p-sidebar-right': position === 'right' && !fullScreen,
                'p-sidebar-top': position === 'top' && !fullScreen,
                'p-sidebar-bottom': position === 'bottom' && !fullScreen,
                'p-sidebar-full': fullScreen
            }"
            *ngIf="visible"
            [@panelState]="{ value: 'visible', params: { transform: transformOptions, transition: transitionOptions } }"
            (@panelState.start)="onAnimationStart($event)"
            (@panelState.done)="onAnimationEnd($event)"
            [ngStyle]="style"
            [class]="styleClass"
            role="complementary"
            [attr.aria-modal]="modal"
        >
            <div class="p-sidebar-header">
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
                <button type="button" class="p-sidebar-close p-sidebar-icon p-link" (click)="close($event)" (keydown.enter)="close($event)" [attr.aria-label]="ariaCloseLabel" *ngIf="showCloseIcon" pRipple>
                    <span class="p-sidebar-close-icon ms ms-close"></span>
                </button>
            </div>
            <div class="p-sidebar-content" [class]="contentStyleClass" [id]="contentId">
                <ng-content></ng-content>
                <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
            </div>
            <div class="p-sidebar-footer">
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
            </div>
        </div>
    `,
  animations: [trigger('panelState', [transition('void => visible', [useAnimation(showAnimation)]), transition('visible => void', [useAnimation(hideAnimation)])])],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../../../../node_modules/primeng/resources/components/sidebar/sidebar.css'],
  host: {
    class: 'p-element'
  }
})
export class AltSidebar extends Sidebar {

}

@NgModule({
  imports: [CommonModule],
  exports: [AltSidebar],
  declarations: [AltSidebar]
})
export class AltSidebarModule { }
