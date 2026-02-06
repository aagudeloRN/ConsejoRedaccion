export interface User {
    id: number;
    name: string;
    role: string;
    active: boolean;
}

export interface News {
    id: number;
    title: string;
    content_processed: string;
    summary: string;
    original_url?: string;
    detection_date: string;
    status: string;
    classifications?: any;
    postulator_id?: number;
    postulator?: User;  // Populated from relationship
    in_council?: boolean;
    is_prioritized?: boolean;
    editorial_focus?: string;
    assignees?: User[];
    votes?: any[];
    category?: string;
}

export interface User {
    id: number;
    name: string;
    role: string;
    active: boolean;
    // Do not include password in interface
}

// Product Types
export interface Product {
    id: number;
    news_id: number;
    user_id: number;
    product_type: 'Boletín' | 'Cápsula' | 'Análisis' | 'Link' | 'Nota';
    name: string;
    description?: string;
    file_path?: string;
    url?: string;
    created_at: string;
}
