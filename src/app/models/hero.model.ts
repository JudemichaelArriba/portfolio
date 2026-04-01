export interface Hero {
    id?: number;
    name: string;
    tagline: string;
    bio: string;
    profile_pic: string | null; 
    created_at?: string;
    updated_at?: string;
}