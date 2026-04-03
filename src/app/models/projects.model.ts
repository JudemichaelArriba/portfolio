export interface Projects {
    id: number;
    title: string;
    description: string;
    image: string | null;
    github_url: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}