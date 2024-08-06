import { Component, Injectable, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { ConfigService } from "../services/config.service";
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ActivitiesService } from "../services/activities.service";
import { catchError, expand, map, reduce, switchMap, tap, toArray } from "rxjs/operators";
import { EMPTY, Observable, forkJoin, of } from "rxjs";
import { SetMember, SetMembers } from "../models/set";
import { Settings } from "../models/settings";
import { ActivityMappingDef, ActivityMappings } from "../models/activity-mapping";
import { Activity, ActivitiesResponse } from "../models/activity";
import { ConfTable } from "../models/confTables";
import { CourseService } from "../services/course.service";
import { Course, CourseData } from "../models/course";
import { set } from "lodash";

@Component({
  selector: 'app-loader-result',
  templateUrl: './loader-result.component.html',
  styleUrls: ['./loader-result.component.scss']
})
export class LoaderResultComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'activities'];
  setId: string;
  researchersIds: string[];  
  coursesList: CourseData;    
  processingUnitToOrgUnitMapping: ConfTable.Mapping[]; 
  mappingProfile: ActivityMappingDef;
  status = { isLoading: false, recordCount: 0, percentComplete: -1 };
  settings: Settings;
  matchedCoursesList: Course[];
  activitiesList: Activity[];
  activitiesResponse: Map<string, ActivitiesResponse> = new Map();
  dataSource: MatTableDataSource<ActivitiesResponse>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor( 
    private courseService: CourseService, 
    private configService: ConfigService,
    private activitiesService: ActivitiesService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.setId = this.route.snapshot.params['setId'];
    if (this.route.snapshot.params['mmsIds'])
      this.researchersIds = this.route.snapshot.params['mmsIds'].split(','); 
    const mappingProfileString = this.route.snapshot.params['mappingProfile'];
    if (mappingProfileString) {
      this.mappingProfile = JSON.parse(mappingProfileString) as ActivityMappingDef;
    }  
    await this.createActivities();
    this.dataSource = new MatTableDataSource(Array.from(this.activitiesResponse.values()));
    this.page();
  }

  get totalRecords() {
    return this.activitiesResponse 
      ? this.activitiesResponse.size
      : 0;
  }

  async createActivities() {
    this.status.isLoading = true;

    try {
        // Variable to hold the observable for getAllResearchersIdsFromSet
        let getAllResearchersIds$: Observable<string[]>;

        // If setId is not null, call getAllResearchersIdsFromSet
        if (this.setId != null) {
            getAllResearchersIds$ = this.getAllResearchersIdsFromSet(this.setId).pipe(
                tap(setResearchersIds => {
                    this.researchersIds = setResearchersIds;
                    console.log('All Researchers IDs:', this.researchersIds);
                })
            );
        } else {
            // If setId is null
            getAllResearchersIds$ = of(this.researchersIds);
        }

        // Wait for getAllResearchersIds$ to complete
        await getAllResearchersIds$.toPromise();

        let getAllCourses$: Observable<CourseData>;

        if (this.setId != null) {
          getAllCourses$ = this.getAllCourses().pipe(
                tap(courses => {
                    this.coursesList = courses;
                    console.log('All Courses Data: ', this.coursesList);
                })
            );
        } else {
            // If setId is null
            getAllCourses$ = of(this.coursesList);
        }

        await getAllCourses$.toPromise();

        const { settings, processingUnitToOrgUnitMapping } = await forkJoin({
            settings: this.configService.getSettings(),
            processingUnitToOrgUnitMapping: this.configService.getMappingTable('PlatformProcessingUnitToOrganizationalUnit')
        }).toPromise();

        this.settings = settings;
        this.processingUnitToOrgUnitMapping = processingUnitToOrgUnitMapping.row;
        this.matchedCoursesList = this.matchActivityMappings(this.coursesList, this.mappingProfile, this.researchersIds);

        console.log(this.matchedCoursesList);

        this.activitiesList = await this.createActivitiesFromCourses(this.matchedCoursesList, this.mappingProfile, this.settings.activitiesVisibilityPublicProfile, this.settings.activitiesVisibilityResearcherProfile, this.settings.activitiesLanguage);
        console.log(this.activitiesList);

        let totalRecords = this.activitiesList.length;
        console.log(totalRecords);

        this.activitiesList.forEach((activity: Activity) => {
          let response = {
            id: activity.activity_course_id,
            title: activity.activity_name[0].value,
            activities: []
          }
          this.activitiesResponse.set(activity.activity_course_id, response);
          // Call createActivity for each activity array
          const constResponses = this.activitiesResponse;
            this.activitiesService.createActivity(activity).subscribe(response => {
              constResponses.get(activity.activity_course_id).activities.push({
                researcherName: activity.member_researcher[0].user_primary_id,
                status: true, 
                msg: '' 
              });
            },
            error => {
                console.error('Error creating activity:', error);
                
                constResponses.get(activity.activity_course_id).activities.push({
                  researcherName: activity.member_researcher[0].user_primary_id,
                  status: false, 
                  msg: error.message 
                });

                // Update status in case of error
                this.status.recordCount++;
                console.log(this.status.recordCount);
                this.status.percentComplete = (this.status.recordCount / totalRecords) * 100; 
            });
  
            // Update status after each call to createActivity
            this.status.recordCount++;
            console.log(this.status.recordCount);
            this.status.percentComplete = (this.status.recordCount / totalRecords) * 100; 
        });

        this.status.isLoading = false;
    } catch (error) {
        console.error('Error creating activities:', error);
        this.status.isLoading = false;
    }
  }

  page() {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    this.dataSource.data = Array.from(this.activitiesResponse.values()).slice(startIndex, endIndex);
  }

  getAllResearchersIdsFromSet(setId: string, pageSize: number = 100): Observable<string[]> {
    return this.configService.getResearchersIdsFromSet(setId, 0, pageSize).pipe(
      expand((result: SetMembers) => {
        const currentPageSize = result.member.length;
        const totalRecordCount = result.total_record_count;
        const totalPages = Math.ceil(totalRecordCount / pageSize);
        const nextPageNumber = currentPageSize / pageSize + 1;

        if (totalPages > nextPageNumber) {
          return this.configService.getResearchersIdsFromSet(setId, nextPageNumber, pageSize);
        } else {
          return EMPTY; // Stop recursion
        }
      }),
      map((result: SetMembers) => result.member.map((member: SetMember) => member.id)),
      reduce((acc: string[], ids: string[]) => acc.concat(ids), [])
    );
  }

  getAllCourses(pageSize: number = 100): Observable<CourseData> {
    return this.courseService.getCourses(0, pageSize).pipe(
      expand((result: CourseData) => {
        const currentPageSize = result.course.length;
        const totalRecordCount = result.total_record_count;
        const totalPages = Math.ceil(totalRecordCount / pageSize);
        const nextPageNumber = currentPageSize / pageSize + 1;

        if (totalPages > nextPageNumber) {
          return this.courseService.getCourses(nextPageNumber, pageSize);
        } else {
          return EMPTY; // Stop recursion
        }
      }),
      toArray(),
      // Map over the array to merge all `CourseData` objects into a single one
      map((results: CourseData[]) => {
        // Assuming you want to merge all pages into one CourseData object
        return results.reduce((acc, result) => {
          acc.course = [...acc.course, ...result.course];
          acc.total_record_count = result.total_record_count;
          return acc;
        }, { ...results[0], course: [] } as CourseData);
      })
    );
  }

  matchActivityMappings(courses: CourseData, activityMapping: ActivityMappingDef, researcherIds: String[]): Course[] {
    const matchedCoursesList: Course[] = [];
    const matchedCoursesIds: Set<String> = new Set();

    courses.course.forEach(course => {
      if (this.courseMatchesMapping(course, activityMapping, researcherIds)) {          
        if (!matchedCoursesIds.has(course.id)) {
          matchedCoursesIds.add(course.id);
          matchedCoursesList.push(course);
        }
      }
    });

    return matchedCoursesList;
  }

  courseMatchesMapping(course: Course, mappingDef: ActivityMappingDef, researcherIds: String[]): boolean {
    const matchInstructorFound = this.findMatchingInstructors(course, researcherIds);
    if(matchInstructorFound) {
      const matchedOrgUnit = this.findOrgUnitByProcessingUnitValue(course.processing_department.value);
      if(matchedOrgUnit != undefined && matchedOrgUnit.column1 == mappingDef.esploroOrgUnit ) {
        if(course.status == mappingDef.courseStatus || mappingDef.courseStatus.toLocaleLowerCase() == "all") {
          if (course.term.find(t => t.value == mappingDef.courseTerm)) {
            return true;
          }
        }
      }
    }
  
    return false; 
  }

  findOrgUnitByProcessingUnitValue(searchValue: string): ConfTable.Mapping | undefined {
    return this.processingUnitToOrgUnitMapping.find(mapping => 
      mapping.column0 == searchValue
    );
  }

  findMatchingInstructors(course: Course, researchersIds: String[]): boolean {
    let result: boolean = false;
    course.instructor.forEach(instructor => {
        if (researchersIds.includes(instructor.primary_id)) {
          result = true;
        }
    });
    return result;
  }

  createActivityFromCourse(course: Course, activityMapping: ActivityMappingDef, activitiesVisibilityPublicProfile: boolean, 
    activitiesVisibilityResearcherProfile: boolean, activitiesLanguage: string): Activity {

    let memberResearchers: Activity['member_researcher'] = [];
    if (course.instructor) {
      course.instructor.forEach(inst => {
        memberResearchers.push({
          user_primary_id: inst.primary_id,
          role: activityMapping.activityResearcherRole,
          order: 0,
          display_in_profile: true,
          creator: false
        });
      });
      
    } 

    // Create activity based on mapping rules
    const activity: Activity = {
        activity_category: { desc: "activity.teaching", value: "activity.teaching" } ,
        activity_type: activityMapping.activityType ? { desc: activityMapping.activityType, value: activityMapping.activityType } : undefined,
        activity_name:  [{ language: activitiesLanguage, value: course.name }], 
        activity_start_date: this.convertDateFormat(course.start_date),
        activity_end_date: this.convertDateFormat(course.end_date),
        member_researcher: memberResearchers,
        profile_visibility: activitiesVisibilityResearcherProfile,
        portal_visibility: activitiesVisibilityPublicProfile,
        repository_status: {value: "approved", desc: "Approved"},
        input_method: {value: "activity.imported", desc: "activity.imported"},
        activity_course_term: {value: "term." + activityMapping.courseTerm.toLowerCase(), desc: activityMapping.courseTerm},
        activity_course_enrollment: course.participants,
        activity_course_id: course.code,
        activity_course_name: course.name,
        activity_course_hours: course.weekly_hours
    };

    return activity;
  }

  convertDateFormat(dateString: string): string {
    // Check if the input dateString matches the expected format
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
  
    if (!match) {
      return "";
    }
  
    // Extract day, month, and year from the match
    const [_, day, month, year] = match;
  
    // Convert to YYYYMMDD format
    return `${year}${month}${day}`;
  }

  getFirstTermValue(terms: { value?: string; desc?: string }[]): { value?: string; desc?: string } | undefined {
    if (terms && terms.length > 0) {
      return terms[0];
    }
    return undefined; // or you can return null, or an empty string based on your needs
  }

  findRowByCode(codeTable: ConfTable.CodeTable, searchCode: string): ConfTable.Code | undefined {
    return codeTable.row.find(code => code.code === searchCode);
  }

  async createActivitiesFromCourses(coursesList: Course[], activityMapping: ActivityMappingDef, activitiesVisibilityPublicProfile: boolean, activitiesVisibilityResearcherProfile: boolean, activitiesLanguage: string): Promise<Activity[]> {
    const activitiesList = [];

    coursesList.forEach((course) => {
        const activity = this.createActivityFromCourse(course, activityMapping, activitiesVisibilityPublicProfile, activitiesVisibilityResearcherProfile, activitiesLanguage);
           

        activitiesList.push(activity);
    });

    return activitiesList;
  }

}

@Injectable({
  providedIn: 'root',
})
export class LoaderResultGuard implements CanActivate {
  constructor(
    public configService: ConfigService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if ((!next.params['setId'] && !next.params['mmsIds'])) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}