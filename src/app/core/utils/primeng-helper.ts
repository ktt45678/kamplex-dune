import { Renderer2 } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumber } from 'primeng/inputnumber';
import { TabMenu } from 'primeng/tabmenu';
import { ZIndexUtils } from 'primeng/utils';
import { first } from 'rxjs';
import { InputSwitch } from 'primeng/inputswitch';

export function fixNestedDialogFocus(dialogRef: DynamicDialogRef, parent: DynamicDialogRef, dialogService: DialogService, renderer: Renderer2, document: Document) {
  const dialogComponent = dialogService.dialogComponentRefMap.get(parent)?.instance;
  if (dialogComponent) dialogComponent.unbindGlobalListeners();
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  dialogRef.onDestroy.pipe(first()).subscribe(() => {
    if (!dialogComponent?.container) return;
    blockScroll(renderer, document);
    dialogComponent.moveOnTop();
    dialogComponent.bindGlobalListeners();
    dialogComponent.focus();
  });
}

export function blockScroll(renderer: Renderer2, document: Document) {
  renderer.addClass(document.body, 'p-overflow-hidden');
}

export function bindDocumentEscapeListener(dialogService: DialogService, renderer: Renderer2, escapeCallback: () => void, parent?: DynamicDialogRef, dialogComponent?: DynamicDialogComponent) {
  if (!dialogComponent && parent)
    dialogComponent = dialogService.dialogComponentRefMap.get(parent)?.instance;
  if (!dialogComponent) return;
  const documentTarget = dialogComponent.maskViewChild ? dialogComponent.maskViewChild.nativeElement.ownerDocument : 'document';
  dialogComponent.documentEscapeListener = renderer.listen(documentTarget, 'keydown', (event) => {
    if (event.which == 27) {
      if (dialogComponent?.container && parseInt(dialogComponent.container.style.zIndex) == ZIndexUtils.getCurrent()) {
        escapeCallback();
      }
    }
  });
}

export function replaceDialogHideMethod(dialogService: DialogService, replaceTo: () => void, parent?: DynamicDialogRef, dialogComponent?: DynamicDialogComponent) {
  if (!dialogComponent && parent)
    dialogComponent = dialogService.dialogComponentRefMap.get(parent)?.instance;
  if (!dialogComponent) return;
  dialogComponent.hide = replaceTo;
}

export function applyPrimeNGPatches() {
  TabMenu.prototype.isActive = function (item: MenuItem): boolean {
    if (item.routerLink) {
      const routerLink = Array.isArray(item.routerLink) ? item.routerLink : [item.routerLink];
      const router = (this as any).router;
      return router.isActive(router.createUrlTree(routerLink, { relativeTo: (this as any).route }).toString(),
        item.routerLinkActiveOptions?.exact ?? item.routerLinkActiveOptions ?? false);
    }
    return item === this.activeItem;
  };
  InputNumber.prototype.validateValue = function (value: any) {
    if (value === '-' || value == null) {
      return null;
    }
    if (this.min != null && value < this.min) {
      if (this.max)
        return this.max;
      return this.min;
    }
    if (this.max != null && value > this.max) {
      if (this.min)
        return this.min;
      return this.max;
    }
    return value;
  }
  InputSwitch.prototype.onClick = function (event: Event, cb: HTMLInputElement) {
    if (!this.disabled && !this.readonly) {
      event.preventDefault();
      this.toggle(event);
      // Prevent focus visible
      //cb.focus();
    }
  }
}
