import { NgModule, Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'p-altTag',
  template: `
      <ng-container *ngIf="link; else noLink">
        <a class="p-tag p-component" [class]="styleClass" [ngStyle]="style" [routerLink]="link">
          <ng-container [ngTemplateOutlet]="tagContent"></ng-container>
        </a>
      </ng-container>
      <ng-template #noLink>
        <span class="p-tag p-component" [class]="styleClass" [ngStyle]="style">
          <ng-container [ngTemplateOutlet]="tagContent"></ng-container>
        </span>
      </ng-template>
      <ng-template #tagContent>
        <span class="p-tag-icon" [ngClass]="icon" *ngIf="icon"></span>
        <span class="p-tag-value">{{ value }}</span>
      </ng-template>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../../../../node_modules/primeng/resources/components/tag/tag.css'],
  host: {
    class: 'p-element'
  }
})
export class AltTag {
  @Input() styleClass!: string;

  @Input() style: any;

  @Input() value!: string;

  @Input() icon!: string;

  @Input() link!: RouterLink['routerLink'];
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [AltTag],
  declarations: [AltTag]
})
export class AltTagModule { }
