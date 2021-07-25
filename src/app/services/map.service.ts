/// <reference types="@types/googlemaps" />
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const ICON_TEMPLATE = {
  labelOrigin: new google.maps.Point(0, 15)
};

@Injectable({
  providedIn: 'root'
})

export class MapService {
  public _map: google.maps.Map;
  public distanceMatrixService = new google.maps.DistanceMatrixService();

  public initMap(mapContainerElement, mapConfigs) {
    this._map = new google.maps.Map(mapContainerElement, mapConfigs);
  }

  public getMap() {
    return this._map;
  }

  public setMarker(position: any, iconType?: string) {
    let icon;
    if (iconType) {
      icon = Object.create(ICON_TEMPLATE);
      Object.assign(icon, {
        url: `../../assets/icons/${iconType}.png`,
        scaledSize: new google.maps.Size(23, 32)
      });
    }
    return new google.maps.Marker({
      position,
      icon,
      map: this._map,
    });
  }

  public setIcon(marker: google.maps.Marker, iconType: string, large?: boolean) {
    let scaledSize: google.maps.Size;
    if (large) {
      scaledSize = new google.maps.Size(25, 35);
    } else {
      scaledSize = new google.maps.Size(23, 32);
    }
    const icon = Object.create(ICON_TEMPLATE);
    Object.assign(icon, {
      url: `../../assets/icons/${iconType}.png`,
      scaledSize,
    });
    marker.setIcon(icon);
  }


  public getTravelTime(origin, place, mode: google.maps.TravelMode) {
    const request = {
      origins: [origin],
      destinations: [place],
      travelMode: mode,
    };
    return new Observable((observer) => {
      this.distanceMatrixService.getDistanceMatrix(request, (res, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK) {
          if (res.rows?.[0].elements?.[0].duration) {
            observer.next(res.rows?.[0].elements?.[0].duration.text);
          } else {
            observer.next(null);
          }
        } else {
          observer.error('Distance Matrix request failed');
        }
      });
    });
  }
}
