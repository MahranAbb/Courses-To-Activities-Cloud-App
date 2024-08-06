import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'
import { Activity } from '../models/activity';
import { CloudAppRestService, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {

  constructor( private restService: CloudAppRestService ) { }  

  /** Create a new Activity record */
  createActivity( activity: Activity ): Observable<Activity> {
    return this.restService.call( {
      url: '/esploro/v1/activities',
      headers: { 
        "Content-Type": "application/json",
        Accept: "application/json" },
      requestBody: activity,
      method: HttpMethod.POST
    })
  }
}