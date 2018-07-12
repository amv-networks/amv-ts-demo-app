import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { Injectable, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Observable } from 'rxjs';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { zip } from 'rxjs/observable/zip';
import { catchError, delay, tap, map, flatMap, filter, mergeAll } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { TrafficsoftClientService, Reservation } from '../shared/trafficsoft-clients.service';
import { AppConfig } from '../../config/app.config';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { ApplicationSettings } from '../shared/application_settings.model';

@Component({
  selector: 'app-main-box-reservations-cancel-dialog',
  templateUrl: 'main-box-reservations-cancel.dialog.html',
})
export class CancelReservationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<CancelReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Reservation[]) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-main-box-reservations',
  templateUrl: './main-box-reservations.component.html',
  /*styleUrls: ['./main-box-reservations.component.scss']*/
})

export class MainBoxReservationsComponent implements OnInit, AfterViewInit {
  @Input() vehicleId: number;

  loading = true;

  private displayedColumns: string[] = ['select', 'reservationId', 'from', 'until', 'type', 'data'];
  private dataSource = new MatTableDataSource<Reservation>([]);
  selection = new SelectionModel<Reservation>(true, []);

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private reservations: Reservation[] = [];

  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private trafficsoftClientService: TrafficsoftClientService,
    private applicationSettingsService: ApplicationSettingsService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyReservationsFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  load() {
    this.loading = true;

    this.applicationSettingsService.get().pipe(
      flatMap(settings => zip(
        this.fetchReservations(settings),
        of(1).pipe(delay(242))
      ))
    ).subscribe(data => {
      this.reservations = data[0];

      this.dataSource.data = this.reservations;
    }, err => {
      this.popupError('Error while fetching reservations: ' + err);
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  createReservation(): void {
    this.popupError(new Error('Not yet implemented.'));
  }

  deleteSelectedItems() {
    if (!this.selection.hasValue()) {
      this.popupError(new Error('No item selected'));
      return;
    }

    const dialogRef = this.dialog.open(CancelReservationDialogComponent, {
      // width: '350px',
      data: this.selection.selected
    });


    dialogRef.afterClosed().pipe(
      filter(result => result === true),
    ).subscribe(dialogResult => {
      of(this.selection.selected).pipe(
        flatMap(selected => from(selected)),
        flatMap(s => this.applicationSettingsService.get().pipe(
          map(settings => this.deleteReservation(settings, s.vehicleId, s.reservationId)))
        ),
        mergeAll()
      ).subscribe(deleteReservationResult => {
      }, error => {
        this.popupError(error);
      }, () => {
        this.load();
        this.popupMessage('Successfully cancelled selected reservations.');
      });
    });
  }

  deleteReservation(settings: ApplicationSettings, vehicleId: number, reservationId: number): Observable<any> {
    return this.trafficsoftClientService.carSharingReservation(settings)
      .pipe(flatMap(client => {
        return fromPromise(client.cancelReservation(vehicleId, reservationId)).pipe(
          map(response => response['data'])
        );
      }));
  }

  fetchReservations(settings: ApplicationSettings): Observable<Reservation[]> {
    return zip(
      this.trafficsoftClientService.carSharingReservation(settings),
      of(this.vehicleId),
      of(1).pipe(delay(442))
    ).pipe(flatMap(pair => {
      const client = pair[0];
      const vehicleIds = pair[1];

      return fromPromise(client.fetchReservations(vehicleIds)).pipe(
        map(response => response['data']),
        map(array => array
          .map(a => a as Reservation)
          .sort((a, b) => {
            if (a.from && b.from) {
              return new Date(a.from).getTime() > new Date(b.from).getTime() ? -1 : 1;
            }
            return 0;
          }))
      );
    }));
  }

  popupError(error): void {
    this.popupSnackBar(error, 'background-red');
  }

  popupMessage(message): void {
    this.popupSnackBar(message, '');
  }

  popupSnackBar(content: any, panelClass: string): void {
    const config: any = new MatSnackBarConfig();
    config.duration = AppConfig.snackBarDuration;
    config.panelClass = panelClass;
    this.snackBar.open(content, 'OK', config);
  }
}
