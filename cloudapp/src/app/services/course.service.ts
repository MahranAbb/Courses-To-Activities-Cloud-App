import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'
import { CloudAppRestService, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib';
import { CourseData } from '../models/course';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor( private restService: CloudAppRestService ) { }  

  /** Retrieve all courses */
  getCourses (pageNumber = 0, pageSize = 100): Observable<CourseData> {
    const params = { 
        limit: pageSize.toString(),
        offset: (pageSize*pageNumber).toString() 
      }
    return this.restService.call( {
      url: '/almaws/v1/courses'
    }).pipe(map( results => results as CourseData ), catchError(err=>of({total_record_count: 0, course: []})))
  }
}