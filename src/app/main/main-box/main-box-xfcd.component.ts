import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { zip } from 'rxjs/observable/zip';
import { catchError, delay, tap, filter, map, flatMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { TrafficsoftClientService, XfcdParam, StateParam } from '../shared/trafficsoft-clients.service';
import { AppConfig } from '../../config/app.config';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { ApplicationSettings } from '../shared/application_settings.model';
import * as moment from 'moment';

@Component({
  selector: 'app-main-box-xfcd',
  templateUrl: './main-box-xcfd.component.html',
})

export class MainBoxXfcdComponent implements OnInit, AfterViewInit {
  @Input() vehicleId: number;

  loading = true;
  private debugMode = false;

  private xfcdDisplayedColumns: string[] = ['param', 'value', 'updated_at', 'timestamp'];
  private xfcdDataSource = new MatTableDataSource<XfcdParam>([]);

  private statesDisplayedColumns: string[] = ['param', 'value', 'updated_at', 'timestamp'];
  private statesDataSource = new MatTableDataSource<StateParam>([]);

  @ViewChild(MatSort) sort: MatSort;

  private lastData: any = {};

  constructor(private router: Router,
    private trafficsoftClientService: TrafficsoftClientService,
    private snackBar: MatSnackBar,
    private applicationSettingsService: ApplicationSettingsService) {
  }

  ngOnInit() {
    this.xfcdDataSource.sort = this.sort;

    this.applicationSettingsService.get()
      .subscribe(settings => this.debugMode = settings.debugMode);

    this.load();
  }

  ngAfterViewInit(): void {
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

  reload() {
    this.lastData = {};
    this.xfcdDataSource.data = [];
    this.statesDataSource.data = [];

    this.load();
  }

  applyXfcdFilter(filterValue: string) {
    this.xfcdDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyStatesFilter(filterValue: string) {
    this.statesDataSource.filter = filterValue.trim().toLowerCase();
  }

  private load() {
    this.loading = true;

    this.applicationSettingsService.get().pipe(
      flatMap(settings => this.fetchLastData(settings))
    ).subscribe(data => {
      this.lastData = data[0] || {};

      this.xfcdDataSource.data = this.lastData.xfcds || [];
      this.statesDataSource.data = this.lastData.states || [];
    }, err => {
      this.popupError('error while fetching latest xfcd data');
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  private fetchLastData(settings: ApplicationSettings): Observable<any[]> {
    return zip(
      this.trafficsoftClientService.xfcd(settings),
      of(this.vehicleId),
      of(1).pipe(delay(442))
    ).pipe(flatMap(pair => {
      const client = pair[0];
      const vehicleIds = pair[1];

      return fromPromise(client.getLastData(vehicleIds)).pipe(
        map(response => response['data']),
        map(data => data.filter(d => d.id === this.vehicleId))
      );
    }));
  }
}
