
import { Map, Marker, tileLayer, latLng, featureGroup, circle, polygon, marker, icon, control, Util, Control } from 'leaflet';


export interface LeafletOptions {
  zoom: number;
  center: latLng;
}

export function zoomToPlace(leafletMap: Map, lat: number, lng: number, zoom: number = 15,
  delayStepInMs: number = 1000, animate = false): void {
  if (animate) {
    leafletMap.flyTo(latLng(lat, lng), zoom);
  } else {
    leafletMap.setView([lat, lng], zoom);
  }
}


export function leafletFitMapToMarkerBounds(map: Map, markers: Array<Marker>) {
  if (!map || !markers) {
    return;
  }
  if (markers.length === 0) {
    return;
  }

  const group = featureGroup(markers);
  map.fitBounds(group.getBounds());
}

export function customizeMap(leafletMap: Map): Map {
  // This will prevent the awkward scroll bug produced by Chrome browsers
  // https://github.com/Leaflet/Leaflet/issues/4125#issuecomment-356289643
  Control.include({
    _refocusOnMap: Util.falseFn // Do nothing.
  });

  if (leafletMap.zoomControl) {
    leafletMap.removeControl(leafletMap.zoomControl);
  }
  leafletMap.addControl(control.zoom({ position: 'topright' }));

  return leafletMap;
}

export function createLeafletOptions(options: LeafletOptions) {
  return {
    layers: [
      tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        minZoom: 0,
        maxZoom: 6,
        attribution: '-'
      }),
      /*tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 7,
        attribution: '-'
      }),*/
      tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
        minZoom: 7,
        attribution: '-'
      })
    ],
    zoom: options.zoom || 7,
    center: options.center
  };
}

export function createMarkerForVehicle(vehicle: any): latLng {
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
