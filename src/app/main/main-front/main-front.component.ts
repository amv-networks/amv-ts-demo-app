import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { zip } from 'rxjs/observable/zip';
import { catchError, delay, tap, map, flatMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Router } from '@angular/router';
import { TrafficsoftClientService } from '../shared/trafficsoft-clients.service';
import { Map, Layer, tileLayer, latLng, circle, polygon, marker, icon, control } from 'leaflet';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import {
  createMarkerForVehicle,
  createLeafletOptions,
  zoomToPlace,
  leafletFitMapToMarkerBounds,
  customizeMap,
  createSatelliteLayer
} from '../shared/leaflet-map.util';
import { ApplicationSettings } from '../shared/application_settings.model';
import { ProgressBarService } from '../../core/shared/progress-bar.service';
import { SnackBarService } from '../../core/shared/snack-bar.service';

@Component({
  selector: 'app-main-front',
  templateUrl: './main-front.component.html',
  styleUrls: ['./main-front.component.scss']
})
export class MainFrontComponent implements OnInit {
  private static INITIAL_CENTER = latLng(47.5, 13);
  private static INITIAL_ZOOM = 6;

  loading = true;
  debugMode = false;
  satelliteOverlayLayerEnabled = false;

  subscriptions: any[] = [];
  lastData: any[] = [];
  filteredLastData: any[] = [];

  selectedVehicle: any;

  leafletOptions: any;
  leafletLayers: any[];

  @ViewChild('sideNavDebug')
  sideNavDebug: any;
  map: Map;
  satelliteOverlayLayer: Layer;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private trafficsoftClientService: TrafficsoftClientService,
    private snackBar: SnackBarService,
    private progressBar: ProgressBarService,
    private applicationSettingsService: ApplicationSettingsService) {

    this.leafletOptions = createLeafletOptions({
      zoom: MainFrontComponent.INITIAL_ZOOM,
      center: MainFrontComponent.INITIAL_CENTER
    });
    this.satelliteOverlayLayer = createSatelliteLayer();
  }

  ngOnInit() {
    this.applicationSettingsService.get()
      .subscribe(settings => this.debugMode = settings.debugMode);

    this.load(() => {
      this.fitMapToMarkerBounds();
    });
  }

  isSatelliteOverlayLayerEnabled(): boolean {
    return this.satelliteOverlayLayerEnabled;
  }

  toggleSatelliteOverlayLayer() {
    if (this.satelliteOverlayLayerEnabled) {
      this.map.removeLayer(this.satelliteOverlayLayer);
    } else {
      this.map.addLayer(this.satelliteOverlayLayer);
    }
    this.satelliteOverlayLayerEnabled = !this.satelliteOverlayLayerEnabled;
  }

  reload() {
    this.subscriptions = [];
    this.updateLastData([]);

    this.load(() => { });
  }

  resetVehicleFilter() {
    this.filteredLastData = Object.assign([], this.lastData);
  }

  applyVehicleFilter(value) {
    if (!value) {
      this.resetVehicleFilter();
      return;
    }

    this.filteredLastData = Object.assign([], this.lastData)
      .filter(item => ('' + item.id).indexOf(value.toLowerCase()) > -1);
  }

  onMapReady(_map: Map) {
    this.map = customizeMap(_map);
  }

  resetMapZoom(): void {
    if (null != this.map) {
      // this.map.setView(MainFrontComponent.INITIAL_CENTER, MainFrontComponent.INITIAL_ZOOM);

      this.fitMapToMarkerBounds();
      this.snackBar.popupMessage('Map zoom and center have been reset');
    }
  }

  onFocusVehicleClicked(vehicle: any) {
    if (null != this.map) {
      this.focusVehicleOnMap(vehicle);
      this.snackBar.popupMessage('Vehicle ' + vehicle.id + ' has been focused');
    }
  }

  showDebugPaneForVehicle(vehicle: any): void {
    if (!this.sideNavDebug.opened || this.selectedVehicle === vehicle) {
      this.sideNavDebug.toggle();
    }
    this.selectedVehicle = vehicle;
  }

  private fitMapToMarkerBounds() {
    if (this.map && this.leafletLayers.length > 0) {
      leafletFitMapToMarkerBounds(this.map, this.leafletLayers);
    }
  }

  private focusVehicleOnMap(vehicle: any, zoom: number = 15, animate = false) {
    if (null != this.map) {
      zoomToPlace(this.map, vehicle.latitude, vehicle.longitude, zoom, 1000, animate);
    }
  }

  private updateLastData(lastData: any[]) {
    this.lastData = lastData;
    this.resetVehicleFilter();
  }

  private load(onLoadFinished: Function) {
    this.loading = true;
    this.progressBar.buffer();

    this.applicationSettingsService.get()
      .pipe(flatMap(settings => this.fetchLastData(settings)))
      .subscribe(lastData => {
        this.updateLastData(lastData);

        const markerArray = this.lastData
          .filter(vehicle => vehicle.latitude && vehicle.longitude)
          .map(vehicle => createMarkerForVehicle(vehicle, `<a
          class="mt-1 mat-button mat-raised-button mat-primary"
          href="#/box/${vehicle.id}" title="dashboard">
            go to dashboard
          </a>`));

        this.leafletLayers = markerArray;

        onLoadFinished();
      }, err => {
        this.snackBar.popupError('Error while loading data: ' + err);
        this.loading = false;
        this.progressBar.decrease();
      }, () => {
        this.loading = false;
        this.progressBar.decrease();
      });
  }

  private getOrFetchSubscriptions(settings: ApplicationSettings): Observable<any[]> {
    return this.subscriptions.length > 0 ? of(this.subscriptions) : this.fetchSubscriptions(settings);
  }

  private fetchSubscriptions(settings: ApplicationSettings): Observable<any[]> {
    return this.trafficsoftClientService.contract(settings)
      .pipe(flatMap(client => {
        return fromPromise(client.fetchSubscriptions(settings.contractId))
          .pipe(
            map(response => response['data']),
            map(data => data.subscriptions as any[]),
            tap(subscriptions => this.subscriptions = subscriptions)
          );
      }));
  }

  private fetchVehicleIds(settings: ApplicationSettings): Observable<any[]> {
    return this.getOrFetchSubscriptions(settings)
      .pipe(map(subscriptions => subscriptions.map(s => s.vehicleId)));
  }

  private fetchLastData(settings: ApplicationSettings): Observable<any[]> {
    return zip(
      this.trafficsoftClientService.xfcd(settings),
      this.fetchVehicleIds(settings),
      of(1).pipe(delay(442))
    ).pipe(flatMap(pair => {
      const client = pair[0];
      const vehicleIds = pair[1];

      return fromPromise(client.getLastData(vehicleIds)).pipe(
        map(response => response['data'] || []),
        map(array => array.sort((a, b) => a.id > b.id ? 1 : -1))
      );
    }));
  }
}
