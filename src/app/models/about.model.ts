export interface About {
    id?: number;
    quote: string;
    paragraph_1: string;
    paragraph_2: string;
    paragraph_3: string;
    location: string;
    focus: string;
    education: string;
    preferred_editor: string;
    work_preference: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}
