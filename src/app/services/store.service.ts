/// <reference types="@types/googlemaps" />
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

const STORE_FIELDS = [
  'formatted_address',
  'opening_hours',
  'website',
  'formatted_phone_number'
];

const GOOGLE_LINK = 'https://www.google.com/maps/place/?q=place_id:';

@Injectable({
  providedIn: 'root'
})

export class StoreService {
  public placesService;

  public initPlacesService(map) {
    this.placesService = new google.maps.places.PlacesService(map);
  }

  public searchStores(location, radius): Observable<any> {
    const request = { location, radius };
    const searches = ['supermarket', 'convenience_store'].map(type => this.searchPlace(request, type));
    // combine the search requests of two types
    return forkJoin(searches, (res1, res2) => [...res1, ...res2]);
  }

  public getStoreDetails(id, callback) {
    const request = {
      placeId: id,
      fields: STORE_FIELDS,
    }
    this.placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        callback(place);
      } else {
        callback(null);
      }
    });
  }

  public getGoogleMapsLink(placeId) {
    return GOOGLE_LINK + placeId;
  }

  private searchPlace(request, type): Observable<any> {
    return new Observable((observer) => {
      this.placesService.nearbySearch({ type, ...request }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          observer.next(results);
        }
        observer.complete();
      });
    });
  }
}
