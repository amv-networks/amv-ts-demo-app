import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { zip } from 'rxjs/observable/zip';
import { catchError, delay, tap, map, flatMap, filter, mergeAll } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';

import { AppConfig } from '../../../config/app.config';
import { ApplicationSettingsService } from '../../shared/application_settings.service';
import { ApplicationSettings } from '../../shared/application_settings.model';
import { TrafficsoftClientService, Reservation } from '../../shared/trafficsoft-clients.service';
import * as moment from 'moment';

@Component({
  selector: 'app-main-box-reservation-create',
  templateUrl: './main-box-reservation-create.component.html',
  styleUrls: ['./main-box-reservation-create.component.scss']
})
export class MainBoxReservationCreateComponent implements OnInit, AfterViewInit {
  vehicleId: number;

  rfidOptions: FormGroup;
  btleOptions: FormGroup;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private trafficsoftClientService: TrafficsoftClientService,
    private applicationSettingsService: ApplicationSettingsService) {

    const now = moment();
    const from = moment(now);
    const until = moment(now).add(60, 'minutes');

    this.rfidOptions = this.formBuilder.group({
      dtid: [null, Validators.required],
      from: [from, Validators.required],
      until: [until, Validators.required]
    });
    this.btleOptions = this.formBuilder.group({
      appId: [null, Validators.required],
      mosn: [null, Validators.required],
      from: [from, Validators.required],
      until: [until, Validators.required]
    });
  }

  ngOnInit() {
    this.vehicleId = +this.route.snapshot.paramMap.get('id');
  }

  ngAfterViewInit() {

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

  onRfidFormSubmit() {
    if (this.rfidOptions.invalid) {
      return;
    }

    const reservation = {
      vehicleId: this.vehicleId,
      from: this.rfidOptions.value.from.toISOString(),
      until: this.rfidOptions.value.until.toISOString(),
      rfid: {
        driverTagId: this.rfidOptions.value.dtid
      }
    };

    this.applicationSettingsService.get().pipe(
      flatMap(settings => this.createReservation(settings, reservation))
    ).subscribe(result => {
      this.router.navigate(['/box', this.vehicleId, '_tabs', 'reservation']);
    }, error => {
      this.popupError(error);
    }, () => {
      this.popupMessage('Successfully created reservation.');
    });
  }

  private createReservation(settings: ApplicationSettings, reservation: any): Observable<Reservation[]> {
    return zip(
      this.trafficsoftClientService.carSharingReservation(settings),
      of(1).pipe(delay(1))
    ).pipe(flatMap(pair => {
      const client = pair[0];

      return fromPromise(client.createReservation(this.vehicleId, reservation)).pipe(
        map(response => response['data'])
      );
    }));
  }
}
