import { NgModule, Component, ChangeDetectionStrategy, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'p-altChip',
  template: `
        <div [ngClass]="containerClass" class="tw-group" [class]="styleClass" [ngStyle]="style" *ngIf="visible"
          (click)="removable && close($event)" (keydown.enter)="removable && close($event)">
            <ng-content></ng-content>
            <img [src]="image" *ngIf="image; else iconTemplate" (error)="imageError($event)" />
            <ng-template #iconTemplate><span *ngIf="icon" class="p-chip-icon" [class]="icon"></span></ng-template>
            <div class="p-chip-text" [class]="textStyleClass" [ngClass]="{ 'tw-cursor-pointer': removable }"
              *ngIf="label">{{ label }}</div>
            <span *ngIf="removable" tabindex="0" class="pi-chip-remove-icon tw-hidden group-hover:tw-block" [class]="removeIcon"></span>
        </div>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../../../../node_modules/primeng/resources/components/chip/chip.css'],
  host: {
    class: 'p-element'
  }
})
export class AltChip {
  @Input() label!: string;

  @Input() icon!: string;

  @Input() image!: string;

  @Input() style: any;

  @Input() styleClass!: string;

  @Input() textStyleClass!: string;

  @Input() removable!: boolean;

  @Input() removeIcon: string = 'ms ms-cancel ms-icon-sm';

  @Output() onRemove: EventEmitter<any> = new EventEmitter();

  @Output() onImageError: EventEmitter<any> = new EventEmitter();

  visible: boolean = true;

  containerClass = {
    'p-chip p-component': true,
    'p-chip-image': this.image != null
  };

  close(event: any) {
    this.visible = false;
    this.onRemove.emit(event);
  }

  imageError(event: any) {
    this.onImageError.emit(event);
  }
}

@NgModule({
  imports: [CommonModule],
  exports: [AltChip],
  declarations: [AltChip]
})
export class AltChipModule { }
