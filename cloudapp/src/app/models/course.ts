export interface Instructor {
    primary_id: string;
    first_name: string;
    last_name: string;
}

export interface Course {
    id: string;
    code: string;
    name: string;
    section: string;
    academic_department: {
        value?: string;
        desc?: string;
    };
    processing_department: {
        value?: string;
        desc?: string;
    };
    status: string;
    visibility: string;
    start_date: string;
    end_date: string;
    weekly_hours: string;
    participants: string;
    year: string;
    instructor: Instructor[];
    campus: any[]; // Adjust type as needed
    note: any[]; // Adjust type as needed
    created_by: string;
    created_date: string;
    last_modified_by: string;
    last_modified_date: string;
    rolled_from: string;
    link: string;
    term: {
        value?: string;
        desc?: string;
    }[];
}

export interface CourseData {
    course: Course[];
    total_record_count: number;
}
