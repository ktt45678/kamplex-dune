import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { first } from 'rxjs';

import { ProductionsService } from '../../../../core/services';
import { Paginated, Production } from '../../../../core/models';
import { PaginateProductionsDto } from '../../../../core/dto/productions';
import { CreateProductionComponent } from '../../dialogs/create-production';
import { UpdateProductionComponent } from '../../dialogs/update-production';
import { translocoEscape } from '../../../../core/utils';

@Component({
  selector: 'app-productions',
  templateUrl: './productions.component.html',
  styleUrls: ['./productions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionsComponent implements OnInit, OnDestroy {
  @ViewChild('productionTable') productionTable?: Table;
  loadingProductionList: boolean = false;
  rowsPerPage: number = 10;
  productionList?: Paginated<Production>;
  selectedProductions?: Production[];

  constructor(private ref: ChangeDetectorRef, private route: ActivatedRoute, private router: Router,
    public dialogService: DialogService, private confirmationService: ConfirmationService,
    private productionsService: ProductionsService, private translocoService: TranslocoService) { }

  ngOnInit(): void {
  }

  loadProductions(): void {
    const params: PaginateProductionsDto = {};
    if (this.productionTable) {
      params.limit = this.productionTable.rows;
      params.page = this.productionTable.first ? this.productionTable.first / this.productionTable.rows + 1 : 1;
      const sortOrder = this.productionTable.sortOrder === -1 ? 'desc' : 'asc';
      if (this.productionTable.sortField) {
        params.sort = `${sortOrder}(${this.productionTable.sortField})`;
      } else {
        params.sort = 'desc(createdAt)';
      }
      if (this.productionTable.filters['name'] && !Array.isArray(this.productionTable.filters['name'])) {
        (params.search = this.productionTable.filters['name'].value);
      }
    } else {
      params.page = 1;
      params.limit = this.rowsPerPage;
      params.sort = 'desc(createdAt)';
    }
    this.loadingProductionList = true;
    this.productionsService.findPage(params).subscribe({
      next: (productionList) => {
        this.productionList = productionList;
        this.ref.markForCheck();
      }
    }).add(() => this.loadingProductionList = false);
  }

  showCreateProductionDialog(): void {
    const dialogRef = this.dialogService.open(CreateProductionComponent, {
      width: '500px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: true
    });
    dialogRef.onClose.pipe(first()).subscribe((result: boolean) => {
      if (!result) return;
      this.loadProductions();
    });
  }

  showUpdateProductionDialog(production: Production): void {
    const dialogRef = this.dialogService.open(UpdateProductionComponent, {
      data: { ...production },
      width: '500px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: true
    });
    dialogRef.onClose.pipe(first()).subscribe((result: boolean) => {
      if (!result) return;
      this.loadProductions();
    });
  }

  showDeleteProductionDialog(production: Production): void {
    const safeProductionName = translocoEscape(production.name);
    this.confirmationService.confirm({
      message: this.translocoService.translate('admin.productions.deleteConfirmation', { name: safeProductionName }),
      header: this.translocoService.translate('admin.productions.deleteConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => this.removeProduction(production._id)
    });
  }

  removeProduction(id: string): void {
    this.productionsService.remove(id).subscribe().add(() => this.loadProductions());
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

  ngOnDestroy(): void {
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }

}
