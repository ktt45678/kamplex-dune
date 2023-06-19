import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { ShareMediaLinkComponent } from './share-media-link.component';

@NgModule({
  declarations: [
    ShareMediaLinkComponent
  ],
  imports: [
    CommonModule,
    ClipboardModule,
    ButtonModule,
    InputTextModule
  ],
  exports: [
    ShareMediaLinkComponent
  ]
})
export class ShareMediaLinkModule { }
