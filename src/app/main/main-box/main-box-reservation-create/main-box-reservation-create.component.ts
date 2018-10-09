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

import { SnackBarService } from '../../../core/shared/snack-bar.service';

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
    private snackBar: SnackBarService,
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

  onRfidFormSubmit() {
    if (this.rfidOptions.invalid) {
      return;
    }

    const validDates = this.rfidOptions.get('until').value.isAfter(this.rfidOptions.get('from').value);
    if (!validDates) {
      this.snackBar.popupError('Validation error: End date must be greater than start date.');
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
      this.snackBar.popupError(error);
    }, () => {
      this.snackBar.popupMessage('Successfully created reservation.');
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
