import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable, of, zip, from as fromPromise } from 'rxjs';
import { delay, map, flatMap } from 'rxjs/operators';
import { TrafficsoftClientService, XfcdParam, StateParam } from '../shared/trafficsoft-clients.service';
import { ProgressBarService } from '../../core/shared/progress-bar.service';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { ApplicationSettings } from '../shared/application_settings.model';

import { SnackBarService } from '../../core/shared/snack-bar.service';

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
    private snackBar: SnackBarService,
    private applicationSettingsService: ApplicationSettingsService,
    private progressBar: ProgressBarService) {
  }

  ngOnInit() {
    this.xfcdDataSource.sort = this.sort;

    this.applicationSettingsService.get()
      .subscribe(settings => this.debugMode = settings.debugMode);

    this.load();
  }

  ngAfterViewInit(): void {
  }

  applyXfcdFilter(filterValue: string) {
    this.xfcdDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyStatesFilter(filterValue: string) {
    this.statesDataSource.filter = filterValue.trim().toLowerCase();
  }

  private load() {
    this.loading = true;

    this.fetchLastData()
      .subscribe(foo => {
      }, err => {
        this.snackBar.popupError('error while fetching latest xfcd data');
        this.loading = false;
      }, () => {
        this.loading = false;
      });
  }

  reload() {
    this.progressBar.increaseIndeterminate();

    this.fetchLastData()
      .subscribe(foo => { },
        err => {
          this.snackBar.popupError('error while fetching latest xfcd data');
          this.progressBar.decrease();
        }, () => {
          this.progressBar.decrease();
        });
  }

  private fetchLastData() {
    return this.applicationSettingsService.get()
      .pipe(flatMap(settings => this.fetchLastDataWithSettings(settings)))
      .pipe(map(data => {
        this.lastData = data[0] || {};

        this.xfcdDataSource.data = this.lastData.xfcds || [];
        this.statesDataSource.data = this.lastData.states || [];
        return data;
      }));
  }

  private fetchLastDataWithSettings(settings: ApplicationSettings): Observable<any[]> {
    return zip(
      this.trafficsoftClientService.xfcd(settings),
      of(this.vehicleId),
      of(1).pipe(delay(242))
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
