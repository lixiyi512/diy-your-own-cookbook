/// <reference types="@types/googlemaps" />
import { Component, ViewChild } from '@angular/core';
import { MapService } from '../../services/map.service';
import { StoreService } from '../../services/store.service';

const DEFAULT_CENTER = { lat: 39.9523789, lng: -75.1635996 };

const MAP_CONFIG = {
  zoom: 15,
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
}

const IMG_PLACEHOLDER = '../../../assets/images/image_placeholder.jpg';

@Component({
  selector: 'app-store-map',
  templateUrl: './store-map.component.html',
  styleUrls: ['./store-map.component.css']
})
export class StoreMapComponent {
  public map: google.maps.Map;
  public locationBlocked = false;
  public loading = false;
  public infoWindow: google.maps.InfoWindow;

  public storeArray = [];
  public loadingDetails = false;
  public showDetail = false;

  public selectedStore;
  public selectedStoreImageUrl = IMG_PLACEHOLDER;
  public selectedStoreDetails = null;
  public storeStatus = null;
  public drivingTime = null;
  public walkingTime = null;

  private currentLocation = DEFAULT_CENTER;
  private seachedBasedOnLocation = DEFAULT_CENTER;
  private currentLocMarker = null;

  @ViewChild('mapContainer') mapContainer: any;

  constructor(
    private mapService: MapService,
    public storeService: StoreService,
  ) {}

  initMap() {
    this.mapService.initMap(
      this.mapContainer.nativeElement,
      {
        ...MAP_CONFIG,
        center: this.currentLocation,
      });
    this.mapService.setMarker(this.currentLocation, 'home');
    this.map = this.mapService.getMap();
    this.map.addListener('click', (event) => {
      this.currentLocMarker?.setMap(null);
      this.currentLocation = event.latLng.toJSON();
      this.currentLocMarker = this.mapService.setMarker(this.currentLocation);
    });

    this.storeService.initPlacesService(this.map);
    window.scrollTo(0, document.body.scrollHeight);
  }

  clickUpdate() {
    this.locationBlocked = false;
    if (this.map) {
      // Map has already been initialized, search for stores around new location
      this.map.setCenter(this.currentLocation);
      this.clearStores();
      this.searchGroceryStores();
    } else {
      // Map not initialized yet
      if (navigator.geolocation) {
        this.loading = true;
        navigator.geolocation.getCurrentPosition(
          this.getPositionSuccessCallBack.bind(this),
          this.handleLocationError.bind(this),
        );
      } else {
        alert('Location is not supported by this browser.');
        // Init map with default location
        this.init();
      }
    }
  }

  getPositionSuccessCallBack(position) {
    this.currentLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    this.init();
  }

  init() {
    this.loading = true;
    this.initMap();
    this.searchGroceryStores();
  }

  searchGroceryStores() {
    this.seachedBasedOnLocation = this.currentLocation;
    // Search for stores within 1.5km
    this.storeService.searchStores(this.currentLocation, '1500').subscribe((response) => {
      this.loading = false;
      for (let i = 0; i < response.length; i++) {
        const place = response[i];
        const store = {
          id: i,
          place,
          marker: this.mapService.setMarker(place.geometry.location, 'store_red'),
          selected: false
        };
        store.marker.addListener('mouseover', () => this.onOverStore(store));
        store.marker.addListener('mouseout', () => this.onLeaveStore(store));
        store.marker.addListener('click', () => this.onSelectStore(store) );
        this.storeArray.push(store);
      }
    });
    this.showDetail = true;
  }

  onOverStore(store) {
    if (store) {
      this.mapService.setIcon(store.marker, 'store_blue', true);
      this.openInfoWindow(store.place, store.marker);
    }
  }

  onLeaveStore(store) {
    if (store && store !== this.selectedStore) {
      this.mapService.setIcon(store.marker, 'store_red', false);
    }
    this.closeInfoWindow();
  }

  onSelectStore(store) {
    this.closeInfoWindow();
    if (this.selectedStore) {
      // reset previous selected store icon
      this.mapService.setIcon(this.selectedStore.marker, 'store_red', false);
    }

    const place = store.place;

    this.selectedStore = store;
    this.storeStatus = this.getOpenNow(place);
    this.mapService.setIcon(store.marker, 'store_blue', true);

    this.selectedStoreDetails = null;
    this.loadingDetails = true;
    this.storeService.getStoreDetails(place.place_id, (res) => {
      this.selectedStoreDetails = res
      this.loadingDetails = false;
    });
    this.selectedStoreImageUrl = this.getImageUrl(place);

    this.mapService.getTravelTime(
      this.seachedBasedOnLocation, place.geometry.location,
      google.maps.TravelMode.DRIVING).subscribe((res) => {
        this.drivingTime = res;
      });
    this.mapService.getTravelTime(
      this.seachedBasedOnLocation, place.geometry.location,
      google.maps.TravelMode.WALKING).subscribe((res) => {
        this.walkingTime = res;
      });
  }

  clearStores() {
    // Clear up markers and empty the array
    this.storeArray = this.storeArray.filter((store) => {
      store.marker.setMap(null);
      return false;
    });
  }

  getOpenNow(pl) {
    if (pl.business_status === 'CLOSED_PERMANENTLY') {
      return 'Permanently closed';
    } else if (pl.business_status === 'CLOSED_TEMPORARILY') {
      return 'Temporarily closed';
    } else if (pl?.opening_hours?.open_now) {
      return 'Open now';
    }
    return 'Closed';
  }

  private openInfoWindow(place, marker) {
    let contentString = `<h5 class="info-title">${place.name}</h5>`;
    contentString += place?.opening_hours?.open_now ?
      `<p class="info-status info-open">Open now</p>` :
      `<p class="info-status info-close">Closed</p>`;
    this.infoWindow = new google.maps.InfoWindow({
      content: contentString,
    });
    this.infoWindow.open(this.map, marker);
  }

  private closeInfoWindow() {
    this.infoWindow?.close();
    this.infoWindow = null;
  }

  private handleLocationError(error) {
    this.loading = false;
    let errorMessage = '';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access blocked.';
        this.locationBlocked = true;
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'The request to get user location timed out.';
        break;
      case error.UNKNOWN_ERROR:
        errorMessage = 'An unknown error occurred.';
        break;
    }
    alert(errorMessage);
  }

  private getImageUrl(pl) {
    if (pl.photos?.[0].getUrl) {
      const img = pl.photos?.[0].getUrl({ maxWidth: 250, maxHeight: 250 });
      return img ? img : IMG_PLACEHOLDER;
    }
    return IMG_PLACEHOLDER;
  }
}
