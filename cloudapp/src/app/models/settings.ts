import { ActivityMappings, defaultActivityMappings } from "./activity-mapping";

export class Settings {
    activitiesVisibilityPublicProfile: boolean = true;
    activitiesVisibilityResearcherProfile: boolean = true;
    activitiesLanguage: string = "und";
    activityMapping: ActivityMappings = defaultActivityMappings;
}