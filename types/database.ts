export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'instructor' | 'student';
    status: 'active' | 'inactive' | 'suspended';
    profile_image_url?: string;
    phone_number?: string;
    department?: string;
    position?: string;
    last_login?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor_id: string;
    duration: number;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    is_active: boolean;
    objectives?: string;
    requirements?: string;
    thumbnail_url?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    instructor_first_name?: string;
    instructor_last_name?: string;
    enrolled_students?: number;
    certificates_issued?: number;
}

export interface CourseModule {
    id: string;
    course_id: string;
    title: string;
    description: string;
    content_type: 'video' | 'image' | 'text' | 'pdf' | 'quiz';
    media_id?: string;
    order_index: number;
    duration: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    content_url?: string;
    media_filename?: string;
    media_type?: string;
}

export interface Certificate {
    id: string;
    user_id: string;
    course_id: string;
    certificate_number: string;
    issued_at: string;
    expiration_date: string;
    score: number;
    issued_by: string;
    created_at: string;
    updated_at: string;
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    progress_percentage: number;
    completed_at?: string;
    status: 'enrolled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Media {
    id: string;
    title: string;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    file_type: string;
    media_type_id: string;
    course_id?: string;
    module_id?: string;
    uploaded_by: string;
    thumbnail_url?: string;
    duration?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface Evaluation {
    id: string;
    title: string;
    description: string;
    course_id: string;
    module_id?: string;
    time_limit: number;
    passing_score: number;
    max_attempts: number;
    shuffle_questions: boolean;
    shuffle_options: boolean;
    show_correct_answers: boolean;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalCertificates: number;
    completedCourses: number;
    certificatesIssued: number;
    passRate: number;
    recentEnrollments: any[];
    popularCourses: any[];
}


export interface User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
    profile_image_url?: string;
    phone_number?: string;
    department?: string;
    position?: string;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor_id: string;
    duration: number;
    is_active: boolean;
    category: string;
    level: string;
    thumbnail_url?: string;
    objectives?: string;
    requirements?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}