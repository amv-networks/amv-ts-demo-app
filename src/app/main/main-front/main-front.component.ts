import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { zip } from 'rxjs/observable/zip';
import { catchError, delay, tap, map, flatMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { AppConfig } from '../../config/app.config';
import { Router } from '@angular/router';
import { TrafficsoftClientService } from '../shared/trafficsoft-clients.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Map, tileLayer, latLng, circle, polygon, marker, icon, control } from 'leaflet';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { ApplicationSettings } from '../shared/application_settings.model';

@Component({
  selector: 'app-main-front',
  templateUrl: './main-front.component.html',
  styleUrls: ['./main-front.component.scss']
})

export class MainFrontComponent implements OnInit {
  static INITIAL_CENTER = latLng(47.5, 13);
  static INITIAL_ZOOM = 7;

  loading = true;
  private debugMode = false;

  subscriptions: any[] = [];
  lastData: any[] = [];

  selectedVehicle: any;

  leafletOptions: any;
  leafletLayers: any[];

  @ViewChild('sideNavDebug')
  private sideNavDebug: any;
  private map: Map;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private trafficsoftClientService: TrafficsoftClientService,
    private snackBar: MatSnackBar,
    private applicationSettingsService: ApplicationSettingsService) {

    this.leafletOptions = {
      layers: [
        tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          minZoom: 0,
          maxZoom: 7,
          attribution: '-'
        }),
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          minZoom: 7,
          attribution: '-'
        }),
      ],
      zoom: MainFrontComponent.INITIAL_ZOOM,
      center: MainFrontComponent.INITIAL_CENTER
    };
  }

  ngOnInit() {
    this.applicationSettingsService.get()
      .subscribe(settings => this.debugMode = settings.debugMode);

    this.load();
  }

  load() {
    this.loading = true;

    this.applicationSettingsService.get().pipe(
      flatMap(settings => this.fetchLastData(settings))
    ).subscribe(lastData => {
      this.lastData = lastData;

      const markerArray = this.lastData
        .filter(d => d.latitude && d.longitude)
        .map(d => {
          const m = marker([d.latitude, d.longitude], {
            title: d.id,
            icon: icon({
              iconSize: [25, 41],
              iconAnchor: [13, 41],
              iconUrl: 'assets/leaflet/dist/images/marker-icon.png',
              shadowUrl: 'assets/leaflet/dist/images/marker-shadow.png'
            }),
            riseOnHover: true
          });

          m.bindPopup('<b class="bold">' + d.id + '</b><br />' +
            '<b class="bold">lat/lon</b>:' + d.latitude + '/' + d.longitude + '<br />' +
            '<b class="bold">speed</b>:' + d.speed + ' km/h');

          m.bindTooltip('' + d.id);
          return m;
        });

      this.leafletLayers = markerArray;
    }, err => {
      this.popupError('Error while loading data: ' + err);
      this.loading = false;
    }, () => {
      this.popupMessage('Succussfully loaded data');
      this.loading = false;
    });
  }

  reload() {

    this.subscriptions = [];
    this.lastData = [];

    this.load();
  }

  onMapReady(_map: Map) {
    this.map = _map;

    if (this.map.zoomControl) {
      this.map.removeControl(this.map.zoomControl);
    }
    this.map.addControl(control.zoom({ position: 'topright' }));

  }
  resetMapZoom(): void {
    if (null != this.map) {
      this.map.setView(MainFrontComponent.INITIAL_CENTER, MainFrontComponent.INITIAL_ZOOM);
      this.popupMessage('Map zoom and center have been reset');
    }
  }

  focusVehicle(vehicle: any) {
    if (null != this.map) {
      this.map.setView([vehicle.latitude, vehicle.longitude], 13);
      this.popupMessage('Vehicle ' + vehicle.id + ' has been focused');
    }
  }

  showDebugPaneForVehicle(vehicle: any): void {
    if (!this.sideNavDebug.opened || this.selectedVehicle === vehicle) {
      this.sideNavDebug.toggle();
    }
    this.selectedVehicle = vehicle;
  }

  getOrFetchSubscriptions(settings: ApplicationSettings): Observable<any[]> {
    const fetch: Observable<any[]> = this.trafficsoftClientService.contract(settings)
      .pipe(flatMap(client => {
        return fromPromise(client.fetchSubscriptions(settings.contractId))
          .pipe(
            map(response => response['data']),
            map(data => data.subscriptions as any[]),
            tap(subscriptions => this.subscriptions = subscriptions)
          );
      }));

    return this.subscriptions.length > 0 ? of(this.subscriptions) : fetch;
  }

  fetchVehicleIds(settings: ApplicationSettings): Observable<any[]> {
    return this.getOrFetchSubscriptions(settings).pipe(
      map(subscriptions => subscriptions.map(s => s.vehicleId))
    );
  }

  fetchLastData(settings: ApplicationSettings): Observable<any[]> {
    return zip(
      this.trafficsoftClientService.xfcd(settings),
      this.fetchVehicleIds(settings),
      of(1).pipe(delay(442))
    ).pipe(flatMap(pair => {
      const client = pair[0];
      const vehicleIds = pair[1];

      return fromPromise(client.getLastData(vehicleIds)).pipe(
        map(response => response['data'] || []),
        map(array => array.sort((a, b) => a.id > b.id))
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
