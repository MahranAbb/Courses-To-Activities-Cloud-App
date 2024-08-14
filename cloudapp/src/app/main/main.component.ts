import { Observable  } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CloudAppRestService, CloudAppEventsService, Request, HttpMethod, 
  Entity, RestErrorResponse, AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { MatRadioChange } from '@angular/material/radio';
import { CourseService } from '../services/course.service';
import { CourseData } from '../models/course';
import { ConfigService } from '../services/config.service';
import { Settings } from '../models/settings';
import { ActivityMappingDef } from '../models/activity-mapping';
import { FormControl } from '@angular/forms';
import { Set } from '../models/set';
import { ConfTable } from '../models/confTables';
import { SelectSetComponent } from '../select-set/select-set.component';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  loading = false;
  selectedEntity: Entity;
  apiResult: any;
  courses: CourseData;
  settings: Settings;
  mappingProfiles: ActivityMappingDef[] = [];
  mappingProfile: FormControl;
  courseOffset: FormControl;
  selectedProfile: ActivityMappingDef;
  selectedOffset: String;
  selectedSet: Set;
  processingUnitsMapping: ConfTable.MappingTable;
  offsetList: { id: string, name: string }[] = [{id: "0", name : "1-200"},
  {id: "1", name : "201-400"},{id: "2", name : "401-600"},{id: "3", name : "601-800"},
  {id: "4", name : "801-1000"},{id: "5", name : "1001-1200"},{id: "6", name : "1201-1400"},
  {id: "7", name : "1401-1600"},{id: "8", name : "1601-1800"},{id: "9", name : "1801-2000"}];
  @ViewChild('selectSet', {static: false}) selectSetComponent: SelectSetComponent;

  entities$: Observable<Entity[]> = this.eventsService.entities$
  .pipe(tap(() => this.clear()))

  constructor(
    private courseService: CourseService, 
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private configService: ConfigService,
    private router: Router
  ) { 
    this.mappingProfile = new FormControl();
    this.courseOffset = new FormControl();
  }

  ngOnInit() {
    this.getCourses();
    this.loadSettings();
    this.getProccessingUnitToOrgUnitsMapping();
  }

  getProccessingUnitToOrgUnitsMapping() {
    this.configService.getMappingTable('PlatformProcessingUnitToOrganizationalUnit').subscribe(
      (data: ConfTable.MappingTable) => {
        this.processingUnitsMapping = data;
      },
      (error) => {
        console.error('Error fetching org units mapping:', error);
      }
    );
  }

  getCourses() {
    this.courseService.getCourses().subscribe(
      (data: CourseData) => {
        this.courses = data;
      },
      (error) => {
        console.error('Error fetching course data:', error);
      }
    );
  }

  loadSettings() {
    this.configService.getSettings().subscribe(
      (settings: Settings) => {
        console.log('Settings received:', settings);
        this.settings = settings;
        this.initializeMappingProfiles(); 
      },
      error => {
        console.error('Error loading settings:', error);
        // Handle error loading settings
      }
    );
  }
  
  initializeMappingProfiles() {
    if (this.settings && this.settings.activityMapping) {
      this.mappingProfiles = Object.values(this.settings.activityMapping);
      this.selectedProfile = this.mappingProfiles.length > 0 ? this.mappingProfiles[0] : null;
      this.mappingProfile.setValue(this.selectedProfile);
    } else {
      this.mappingProfiles = [];
      this.selectedProfile = null;
    }
  }

  ngOnDestroy(): void {
  }

  entitySelected(event: MatRadioChange) {
    const value = event.value as Entity;
    this.loading = true;
    this.restService.call<any>(value.link)
    .pipe(finalize(()=>this.loading=false))
    .subscribe(
      result => this.apiResult = result,
      error => this.alert.error('Failed to retrieve entity: ' + error.message)
    );
  }

  clear() {
    this.apiResult = null;
    this.selectedEntity = null;
  }

  update(value: any) {
    const requestBody = this.tryParseJson(value)
    if (!requestBody) return this.alert.error('Failed to parse json');

    this.loading = true;
    let request: Request = {
      url: this.selectedEntity.link, 
      method: HttpMethod.PUT,
      requestBody
    };
    this.restService.call(request)
    .pipe(finalize(()=>this.loading=false))
    .subscribe({
      next: result => {
        this.apiResult = result;
        this.eventsService.refreshPage().subscribe(
          ()=>this.alert.success('Success!')
        );
      },
      error: (e: RestErrorResponse) => {
        this.alert.error('Failed to update data: ' + e.message);
        console.error(e);
      }
    });    
  }

  private tryParseJson(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

  onSetSelected(set: Set) {
    this.selectedSet = set;
  }

  get isValid() {
    return (
      this.selectedSet!=null  &&
      this.selectedProfile != null &&
      this.selectedOffset != null
    );
  }

  compareMappingProfiles(a: ActivityMappingDef, b: ActivityMappingDef): boolean {
    return a && b ? a.name === b.name : a === b;
  }

  onMappingProfileSelected(event: MatSelectChange) {
    this.selectedProfile = event.source.value;
  }

  compareCourseOffsets(a: String, b: String): boolean {
    return a === b;
  }

  onCourseOffsetSelected(event: MatSelectChange) {
    this.selectedOffset = event.source.value;
  }

  load() {
    const params = { };
    params['setId'] = this.selectedSet.id;
    params['mappingProfile'] = JSON.stringify(this.selectedProfile);
    params['offset'] = this.selectedOffset;
    this.router.navigate(['loaderResult', params]);
  }
}