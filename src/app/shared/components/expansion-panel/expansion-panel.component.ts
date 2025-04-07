import { CommonModule } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, Component, contentChildren, input, OnInit, signal, TemplateRef } from '@angular/core';

import { TemplateForDirective } from '../../directives/common-directive/template-for';

@Component({
  selector: 'app-expansion-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expansion-panel.component.html',
  styleUrl: './expansion-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpansionPanelComponent implements OnInit, AfterContentInit {
  templates = contentChildren(TemplateForDirective);

  buttonTemplate = signal<TemplateRef<any> | undefined>(undefined);
  bodyTemplate = signal<TemplateRef<any> | undefined>(undefined);

  initExpanded = input(false);
  styleClass = input<string | null>(null);
  buttonStyleClass = input<string | null>(null);
  bodyStyleClass = input<string | null>(null);
  isExpanded = signal(false);

  ngOnInit(): void {
    if (this.initExpanded())
      this.isExpanded.set(this.initExpanded());
  }

  ngAfterContentInit(): void {
    this.templates().forEach(item => {
      switch (item.getType()) {
        case 'button':
          this.buttonTemplate.set(item.template);
          break;

        case 'body':
          this.bodyTemplate.set(item.template);
          break;

        default:
          this.bodyTemplate.set(item.template);
          break;
      }
    });
  }

  toggleExpansion() {
    this.isExpanded.update(value => !value);
  }
}
