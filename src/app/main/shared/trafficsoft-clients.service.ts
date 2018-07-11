import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ApplicationSettingsService } from './application_settings.service';

import * as trafficsoftClients from 'amv-trafficsoft-rest-js';

export interface Rfid {
  driverTagId: string;
}
export interface Btle {
  accessCertificateId: string;
  appId: string;
  mobileSerialNumber: string;
}
export interface Reservation {
  from: Date;
  until: Date;
  reservationId: number;
  vehicleId: number;
  rfid: Rfid;
  btle: Btle;
}

export interface XfcdParam {
  param: string;
  value: string;
  timestamp: string;
  latitude: number;
  longitude: number;
}

export interface StateParam {
  param: string;
  value: string;
  timestamp: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class TrafficsoftClientService {

  constructor(
    private applicationSettingsService: ApplicationSettingsService) {
  }

  xfcd(settings: any): Observable<any> {
    return this.factory(settings)
      .pipe(map(factory => {
        return factory.xfcd();
      }));
  }

  carSharingReservation(settings: any): Observable<any> {
    return this.factory(settings)
      .pipe(map(factory => {
        return factory.carSharingReservation();
      }));
  }

  contract(settings: any): Observable<any> {
    return this.factory(settings)
      .pipe(map(factory => {
        return factory.contract();
      }));
  }

  private factory(settings: any): Observable<any> {
    return of(settings)
      .pipe(map(s => {
        const options = {
          contractId: s.contractId,
          auth: {
            username: s.username,
            password: s.password
          }
        };
        return trafficsoftClients(s.baseUrl, options);
      }));
  }
}
