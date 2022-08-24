import { Directionality } from '@angular/cdk/bidi';
import { CdkStepper } from '@angular/cdk/stepper';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }]
})
export class StepperComponent extends CdkStepper implements OnInit {
  @Input() activeClass = 'tw-bg-black tw-text-white';
  @Input() headerStyleClass = 'tw-mb-2';

  constructor(private dir: Directionality, private ref: ChangeDetectorRef, private elementRef: ElementRef<HTMLElement>) {
    super(dir, ref, elementRef);
  }

  ngOnInit(): void {
  }

  selectTab(index: number) {
    if (this.selected && !this.selected.completed && !this.selected.optional && this.linear) return;
    this.selectedIndex = index;
  }

}
