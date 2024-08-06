import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { merge } from 'lodash';
import { CloudAppRestService, CloudAppSettingsService } from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings';
import { ConfTable } from '../models/confTables';
import { SetMembers, Sets } from '../models/set';
import { defaultActivityMappings } from '../models/activity-mapping';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _settings: Settings;
  anyRow: ConfTable.Code = {
    code: "Any",
    description: "Any"
  };

  constructor( 
    private restService: CloudAppRestService,
    private settingsService: CloudAppSettingsService
  ) {  }

  searchSets(name: string = null, type: string = 'RESEARCHERS'): Observable<Sets> {
    let params = { 'content_type': type }
    if (name) params['q'] = `name~${name}`;
    return this.restService.call( {
      url: '/esploro/v1/researchconf/sets',
      queryParams: params
    }).pipe(map( results => results as Sets))
  }

  getCodeTable(name: string = null): Observable<ConfTable.CodeTable> {
    return this.restService.call( {
      url: '/esploro/v1/researchconf/code-tables/' + name
    }).pipe(map( results => results as ConfTable.CodeTable))
  }

  getAlmaCodeTable(name: string = null): Observable<ConfTable.CodeTable> {
    return this.restService.call( {
      url: '/almaws/v1/conf/code-tables/' + name
    }).pipe(map( results => results as ConfTable.CodeTable))
  }

  getMappingTable(name: string = null): Observable<ConfTable.MappingTable> {
    return this.restService.call( {
      url: '/esploro/v1/conf/mapping-tables/' + name
    }).pipe(map( results => results as ConfTable.MappingTable))
  }

  addAnyRow(rows: ConfTable.Code[]) {
    rows.push(this.anyRow);
    return rows;
  }

  /** Retrieve settings  */
  getSettings(): Observable<Settings> {
    if (this._settings) {
      return of(this._settings);
    } else {
      return this.settingsService.get()
        .pipe(
          map(settings=> {
            if (Object.keys(settings).length==0 || Array.isArray(settings.activityMapping)) {
              /* Default or old settings */
              return new Settings()
            } else {
              /* Merge new settings and URLs */
              settings.activityMapping = merge(defaultActivityMappings, settings.activityMapping);
              return settings;
            }
          }
          ),
          tap(settings=>this._settings=settings)
        );
    }
  }

  setSettings(val: Settings) {
    this._settings = val;
    return this.settingsService.set(val);
  }

  resetSettings() {
    this._settings = null;
    return this.settingsService.remove();
  }
  
  /** Retrieve ids from set of researchers */
  getResearchersIdsFromSet( setId: string, pageNumber = 0, pageSize = 10 ): Observable<SetMembers> {
    const params = { 
      limit: pageSize.toString(),
      offset: (pageSize*pageNumber).toString() 
    }
    return this.restService.call( {
      url: `/esploro/v1/researchconf/sets/${setId}/members`,
      queryParams: params
    }).pipe(map( results => results as SetMembers ))
  } 
}