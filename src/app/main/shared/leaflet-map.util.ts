
import { Map, Marker, tileLayer, latLng, featureGroup, circle, polygon, marker, icon, control, Util, Control } from 'leaflet';

const LEAFLET_MIN_ZOOM = 0;
const LEAFLET_MAX_ZOOM = 18;

function createLayer(baseUrl: string, minZoom: number = LEAFLET_MIN_ZOOM, maxZoom: number = LEAFLET_MAX_ZOOM) {
  return tileLayer(baseUrl, {
    minZoom: minZoom,
    maxZoom: maxZoom,
    attribution: '-'
  });
}

export function createSatelliteLayer(minZoom: number = LEAFLET_MIN_ZOOM, maxZoom: number = LEAFLET_MAX_ZOOM) {
  return createLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', minZoom, maxZoom);
}

export function createStreetsLayer(minZoom: number = LEAFLET_MIN_ZOOM, maxZoom: number = LEAFLET_MAX_ZOOM) {
  return createLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', minZoom, maxZoom);
  /* tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 7,
    attribution: '-'
  }), */
}

export interface LeafletOptions {
  zoom: number;
  center: any;
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
  const SATELLITE_BASE_LAYER = createSatelliteLayer(LEAFLET_MIN_ZOOM, 7);
  const STREET_BASE_LAYER = createStreetsLayer(7, LEAFLET_MAX_ZOOM);

  return {
    layers: [SATELLITE_BASE_LAYER, STREET_BASE_LAYER],
    zoom: options.zoom || 7,
    center: options.center
  };
}
export function createSimpleMarker(title: any, latitude: number, longitude: number): latLng {
  const m = marker([latitude, longitude], {
    title: title,
    icon: icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      iconUrl: 'assets/leaflet/dist/images/marker-icon.png',
      shadowUrl: 'assets/leaflet/dist/images/marker-shadow.png'
    }),
    riseOnHover: true
  });

  return m;
}

export function createMarkerForVehicle(vehicle: any, additionalContent: string = ''): latLng {
  const m = createSimpleMarker(vehicle.id, vehicle.latitude, vehicle.longitude);

  // somehow, css classes do not seem to work, hence 'style' is used - i am sorry :/
  m.bindPopup(`
    <div style="padding: 0.1rem;">
      <span class="h6">${vehicle.id}</span>
      <br />
      <br />

      <ul>
      <li><span class="bold">lat/lon</span>: ${vehicle.latitude}/${vehicle.longitude}</li>
      <li><span class="bold">speed</span>: ${vehicle.speed}km/h</li>
      </ul>
      <br />
      ${additionalContent}
    </div>
    `);

  m.bindTooltip('' + vehicle.id);
  return m;
}
