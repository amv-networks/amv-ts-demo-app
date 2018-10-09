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
import { ProgressBarService } from '../../core/shared/progress-bar.service';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { ApplicationSettings } from '../shared/application_settings.model';

import { SnackBarService } from '../../core/shared/snack-bar.service';

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

  displayedColumns: string[] = ['select', 'reservationId', 'from', 'until', 'type', 'data'];
  dataSource = new MatTableDataSource<Reservation>([]);
  selection = new SelectionModel<Reservation>(true, []);

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  reservations: Reservation[] = [];

  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private trafficsoftClientService: TrafficsoftClientService,
    private applicationSettingsService: ApplicationSettingsService,
    private snackBar: SnackBarService,
    private progressBar: ProgressBarService) {
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

  deleteSelectedItemsButtonPressed() {
    if (!this.selection.hasValue()) {
      this.snackBar.popupError(new Error('No item selected'));
      return;
    }

    const dialogRef = this.dialog.open(CancelReservationDialogComponent, {
      // width: '350px',
      data: this.selection.selected
    });

    dialogRef.afterClosed()
      .pipe(filter(result => result === true))
      .subscribe(dialogResult => {
        of(this.selection.selected).pipe(
          flatMap(selected => from(selected)),
          flatMap(s => this.applicationSettingsService.get().pipe(
            map(settings => this.deleteReservation(settings, s.vehicleId, s.reservationId)))
          ),
          mergeAll()
        ).subscribe(deleteReservationResult => {
        }, error => {
          this.snackBar.popupError(error);
        }, () => {
          this.load();
          this.snackBar.popupMessage('Successfully cancelled selected reservations.');
        });
      });
  }

  private deleteReservation(settings: ApplicationSettings, vehicleId: number, reservationId: number): Observable<any> {
    return this.trafficsoftClientService.carSharingReservation(settings)
      .pipe(flatMap(client => {
        return fromPromise(client.cancelReservation(vehicleId, reservationId)).pipe(
          map(response => response['data'])
        );
      }));
  }

  private load() {
    this.loading = true;

    this.fetchReservations()
      .subscribe(data => {
        this.reservations = data[0];
        this.dataSource.data = this.reservations;
      }, err => {
        this.snackBar.popupError('Error while fetching reservations: ' + err);
        this.loading = false;
      }, () => {
        this.loading = false;
      });
  }

  reload() {
    this.progressBar.increaseIndeterminate();

    this.fetchReservations()
      .subscribe(data => {
        this.reservations = data[0];
        this.dataSource.data = this.reservations;
      }, err => {
        this.snackBar.popupError('Error while fetching reservations: ' + err);
        this.progressBar.none();
      }, () => {
        this.progressBar.none();
      });
  }

  private fetchReservations() {
    return this.applicationSettingsService.get().pipe(
      flatMap(settings => zip(
        this.fetchReservationsWithSettings(settings),
        of(1).pipe(delay(242))
      ))
    );
  }

  private fetchReservationsWithSettings(settings: ApplicationSettings): Observable<Reservation[]> {
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
}
