import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { Settings } from "../models/settings";
import { ActivityMappingDef } from "../models/activity-mapping";

export const settingsFormGroup = (settings: Settings): FormGroup => {
  let activityMappingFormGroups = new FormGroup({});
  Object.entries(settings.activityMapping).forEach(([key, value]) => 
    activityMappingFormGroups.addControl(key, activityMappingFormGroup(value))
  );
  return new FormGroup({
    activitiesVisibilityPublicProfile: new FormControl(settings.activitiesVisibilityPublicProfile),
    activitiesVisibilityResearcherProfile: new FormControl(settings.activitiesVisibilityResearcherProfile),
    activitiesLanguage: new FormControl(settings.activitiesLanguage),
    activityMapping: activityMappingFormGroups
  });
}

export const activityMappingFormGroup = (value: ActivityMappingDef) => {
  return new FormGroup({
    name: new FormControl(value.name, Validators.required),
    activityCategory: new FormControl(value.activityCategory),
    activityType: new FormControl(value.activityType),
    activityResearcherRole: new FormControl(value.activityResearcherRole),
    esploroOrgUnit: new FormControl(value.esploroOrgUnit),
    courseTerm: new FormControl(value.courseTerm)
  })
}