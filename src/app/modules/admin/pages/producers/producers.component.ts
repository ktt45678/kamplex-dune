import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { first } from 'rxjs';
import { escape } from 'lodash';

import { ProducersService } from '../../../../core/services';
import { Paginated, Producer } from '../../../../core/models';
import { PaginateProducersDto } from '../../../../core/dto/producers';
import { CreateProducerComponent } from '../../dialogs/create-producer';
import { UpdateProducerComponent } from '../../dialogs/update-producer';

@Component({
  selector: 'app-producers',
  templateUrl: './producers.component.html',
  styleUrls: ['./producers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProducersComponent implements OnInit {
  @ViewChild('producerTable') producerTable?: Table;
  loadingProducerList: boolean = false;
  rowsPerPage: number = 10;
  producerList?: Paginated<Producer>;
  selectedProducers?: Producer[];

  constructor(private ref: ChangeDetectorRef, private route: ActivatedRoute, private router: Router,
    public dialogService: DialogService, private confirmationService: ConfirmationService, private producersService: ProducersService) { }

  ngOnInit(): void {
  }

  loadProducers(): void {
    const params = new PaginateProducersDto();
    if (this.producerTable) {
      params.limit = this.producerTable.rows;
      params.page = this.producerTable.first ? this.producerTable.first / this.producerTable.rows + 1 : 1;
      const sortOrder = this.producerTable.sortOrder === -1 ? 'desc' : 'asc';
      if (this.producerTable.sortField) {
        params.sort = `${sortOrder}(${this.producerTable.sortField})`;
      }
      if (this.producerTable.filters['name'] && !Array.isArray(this.producerTable.filters['name'])) {
        (params.search = this.producerTable.filters['name'].value);
      }
    } else {
      params.page = 1;
      params.limit = this.rowsPerPage;
    }
    this.loadingProducerList = true;
    this.producersService.findPage(params).subscribe({
      next: (producerList) => {
        this.producerList = producerList;
        this.ref.markForCheck();
      }
    }).add(() => this.loadingProducerList = false);
  }

  showCreateProducerDialog(): void {
    const dialogRef = this.dialogService.open(CreateProducerComponent, {
      width: '500px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: true
    });
    dialogRef.onClose.pipe(first()).subscribe((result: boolean) => {
      if (!result) return;
      this.loadProducers();
    });
  }

  showUpdateProducerDialog(producer: Producer): void {
    const dialogRef = this.dialogService.open(UpdateProducerComponent, {
      data: producer,
      width: '500px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: true
    });
    dialogRef.onClose.pipe(first()).subscribe((result: boolean) => {
      if (!result) return;
      this.loadProducers();
    });
  }

  showDeleteProducerDialog(producer: Producer): void {
    const safeProducerName = escape(producer.name);
    this.confirmationService.confirm({
      message: `Are you sure you want to delete <strong>${safeProducerName}</strong>? This action cannot be undone.`,
      header: 'Delete Producer',
      icon: 'pi pi-info-circle',
      defaultFocus: 'none',
      accept: () => this.removeProducer(producer._id)
    });
  }

  removeProducer(id: string): void {
    this.producersService.remove(id).subscribe().add(() => this.loadProducers());
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

}
