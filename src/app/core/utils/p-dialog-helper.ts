import { Renderer2 } from '@angular/core';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ZIndexUtils } from 'primeng/utils';
import { first } from 'rxjs';

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
