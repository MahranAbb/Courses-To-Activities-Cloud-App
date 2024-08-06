export interface Activity {
    activity_category: {
        desc: string;
        value: string;
    };
    activity_type: {
        desc: string;
        value: string;
    };
    activity_name: {
        language: string;
        value: string;
    }[];
    activity_description_translation?: {
        language: string;
        value: string;
    }[];
    activity_subject?: {
        subject_code: {
            desc: string;
            value: string;
        };
        subject_type: string;
    }[];
    activity_keyword_translation?: {
        language: string;
        value: string;
    }[];
    activity_start_date?: string;
    activity_end_date?: string;
    member_researcher: {
        user_primary_id: string;
        role: string;
        order: number;
        display_in_profile: boolean;
        creator: boolean;
    }[];
    related_assets?: {
        target_mms_id: string;
        visible: boolean;
        order: number;
    }[];
    student?: {
        name: string;
        department: string;
    }[];
    link?: {
        link_url: string;
        link_title: string;
    }[];
    activity_thesis_level?: {
        desc: string;
        value: number;
    };
    activity_thesis_title?: {
        language: string;
        value: string;
    }[];
    activity_degree_awarded?: {
        desc: string;
        value: string;
    };
    repository_status: {
        desc: string;
        value: string;
    };
    profile_visibility: boolean;
    portal_visibility: boolean;
    input_method: {
        desc: string;
        value: string;
    };
    activity_course_term?: {
        value?: string;
        desc?: string;
    };
    activity_course_enrollment?: string;
    activity_course_hours?: string;
    activity_course_id?: string;
    activity_course_name?: string;
    activity_course_section?: string;
}

export interface ActivitiesResponse {
    id: string;
    title: string;
    activities: {
        researcherName: string;
        status: boolean;
        msg: string;
    }[];
}