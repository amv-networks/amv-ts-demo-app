import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
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
  selector: 'app-main-box-map',
  templateUrl: './main-box-map.component.html',
  styleUrls: ['./main-box-map.component.scss']
})

export class MainBoxMapComponent implements OnInit {
  static INITIAL_CENTER = latLng(47.5, 13);
  static INITIAL_ZOOM = 7;

  @Input() vehicleId: number;

  loading = true;
  private debugMode = false;

  private lastData: any[] = [];

  private selectedVehicle: any;

  private leafletOptions: any;
  private leafletLayers: any[];

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
      zoom: MainBoxMapComponent.INITIAL_ZOOM,
      center: MainBoxMapComponent.INITIAL_CENTER
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

      if (lastData.length > 0) {
        this.focusVehicle(lastData[0]);
      }
    }, err => {
      this.popupError('fetch subscription errored');
      this.loading = false;
    }, () => {
      this.popupMessage('Succussfully loaded data');
      this.loading = false;
    });
  }

  reload() {
    this.lastData = [];

    this.load();
  }

  onMapReady(_mapmap: Map) {
    this.map = _mapmap;

    if (this.map.zoomControl) {
      this.map.removeControl(this.map.zoomControl);
    }
    this.map.addControl(control.zoom({ position: 'topright' }));

    if (this.lastData.length > 0) {
      this.focusVehicle(this.lastData[0]);
    }
  }

  resetMapZoom(): void {
    if (null != this.map) {
      this.map.setView(MainBoxMapComponent.INITIAL_CENTER, MainBoxMapComponent.INITIAL_ZOOM);
      this.popupMessage('Map zoom and center have been reset');
    }
  }

  focusVehicle(vehicle: any) {
    if (null != this.map) {
      this.map.setView([vehicle.latitude, vehicle.longitude], 13);
    }
  }

  fetchLastData(settings: ApplicationSettings): Observable<any[]> {
    return this.trafficsoftClientService.xfcd(settings)
      .pipe(flatMap(client => {
        return fromPromise(client.getLastData(this.vehicleId)).pipe(
          map(response => response['data'] || []),
          map(array => array.filter(a => a.id === this.vehicleId))
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
