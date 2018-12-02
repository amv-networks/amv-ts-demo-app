import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable, from as fromPromise } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TrafficsoftClientService } from '../shared/trafficsoft-clients.service';
import { Map, latLng, control } from 'leaflet';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { ApplicationSettings } from '../shared/application_settings.model';
import {
  createMarkerForVehicle,
  leafletFitMapToMarkerBounds,
  createLeafletOptions
} from '../shared/leaflet-map.util';

import { SnackBarService } from '../../core/shared/snack-bar.service';

@Component({
  selector: 'app-main-box-map',
  templateUrl: './main-box-map.component.html',
  styleUrls: ['./main-box-map.component.scss']
})
export class MainBoxMapComponent implements OnInit {
  private static INITIAL_CENTER = latLng(47.5, 13);
  private static INITIAL_ZOOM = 7;

  @Input() vehicleId: number;
  @Input() vehicle: any;
  @Input() enableActionButtons = false;
  @Input() mapHeight: any = '250px';

  loading = true;
  debugMode = false;

  lastData: any[] = [];
  selectedVehicle: any;

  leafletOptions: any;
  leafletLayers: any[];

  map: Map;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private trafficsoftClientService: TrafficsoftClientService,
    private snackBar: SnackBarService,
    private applicationSettingsService: ApplicationSettingsService) {


    this.leafletOptions = createLeafletOptions({
      zoom: MainBoxMapComponent.INITIAL_ZOOM,
      center: MainBoxMapComponent.INITIAL_CENTER
    });

  }

  ngOnInit() {
    this.applicationSettingsService.get()
      .subscribe(settings => this.debugMode = settings.debugMode);

    if (!this.vehicle) {
      this.load();
    } else {
      this.updateSelectedVehicle(this.vehicle);
    }
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

    if (this.selectedVehicle) {
      this.fitMapToMarkerBounds();
    }
  }

  fitMapToMarkerBounds() {
    if (null != this.map && this.leafletLayers) {
      leafletFitMapToMarkerBounds(this.map, this.leafletLayers);
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

  private load() {
    this.loading = true;

    this.applicationSettingsService.get().pipe(
      flatMap(settings => this.fetchLastData(settings))
    ).subscribe(lastData => {
      this.lastData = lastData;

      if (lastData.length > 0) {
        this.updateSelectedVehicle(lastData[0]);
      }
    }, err => {
      this.snackBar.popupError('Loading latest data errored');
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  private buildMarkerFromSelectedVehicle() {
    if (!this.selectedVehicle) {
      return;
    }

    const markerArray = [this.selectedVehicle]
      .filter(d => d.latitude && d.longitude)
      .map(d => createMarkerForVehicle(d));

    this.leafletLayers = markerArray;
  }


  private updateSelectedVehicle(vehicle: any) {
    this.selectedVehicle = vehicle;

    this.buildMarkerFromSelectedVehicle();
    this.fitMapToMarkerBounds();
  }
}
