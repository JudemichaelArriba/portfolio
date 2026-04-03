import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Projects } from '../models/projects.model';
import { environment } from '../../environements/environment';

@Injectable({
    providedIn: 'root'
})
export class ProjectsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/projects`;

    getProjects(): Observable<Projects[]> {
        return this.http.get<{ data: Projects[] }>(this.apiUrl).pipe(
            map(res => res.data)
        );
    }

    createProject(data: Partial<Projects>): Observable<Projects> {
        return this.http.post<{ data: Projects }>(this.apiUrl, data).pipe(
            map(res => res.data)
        );
    }

    updateProject(id: number, data: Partial<Projects>): Observable<Projects> {
        return this.http.put<{ data: Projects }>(`${this.apiUrl}/${id}`, data).pipe(
            map(res => res.data)
        );
    }

    deleteProject(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}