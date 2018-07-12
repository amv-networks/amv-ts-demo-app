import { Observable, of } from 'rxjs';
import { map, tap, } from 'rxjs/operators';
import { Map, tileLayer, latLng, circle, polygon, marker, icon, control } from 'leaflet';

export interface LeafletOptions {
  zoom: number;
  center: latLng;
}

export function zoomToPlace(leafletMap : Map, lat : number, lng : number, zoom: number = 15, delayStepInMs : number = 1000, animate = false) : void {
  console.log('Zoom to place ', zoom, arguments);
  if (animate) {
    leafletMap.flyTo(latLng(lat, lng), zoom);
  } else {
    console.log('setView ', zoom, arguments);
    leafletMap.setView([lat, lng], zoom);
  }
}

export function createLeafletOptions(options : LeafletOptions) {
  return {
    layers: [
      tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        minZoom: 0,
        maxZoom: 6,
        attribution: '-'
      }),
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 7,
        attribution: '-'
      }),
    ],
    zoom: options.zoom || 7,
    center: options.center
  };
}

export function createMarkerForVehicle(vehicle : any) : latLng {
  const m = marker([vehicle.latitude, vehicle.longitude], {
    title: vehicle.id,
    icon: icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      iconUrl: 'assets/leaflet/dist/images/marker-icon.png',
      shadowUrl: 'assets/leaflet/dist/images/marker-shadow.png'
    }),
    riseOnHover: true
  });

  // somehow, css classes do not seem to work, hence 'style' is used - i am sorry :/
  m.bindPopup('<span class="h6" style="font-weight: 600;">' + vehicle.id + '</span><br />' +
    '<span class="bold">lat/lon</span>: ' + vehicle.latitude + '/' + vehicle.longitude + '<br />' +
    '<span class="bold">speed</span>: ' + vehicle.speed + ' km/h');

  m.bindTooltip('' + vehicle.id);
  return m;
}