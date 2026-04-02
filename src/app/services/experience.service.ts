import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Experience } from '../models/experience.model';
import { environment } from '../../environements/environment';

@Injectable({
    providedIn: 'root'
})
export class ExperienceService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/experiences`;

    // Helper to handle API responses that might or might not be wrapped in "data"
    private extractData(res: any): any {
        return res && res.data ? res.data : res;
    }

    getExperiences(): Observable<Experience[]> {
        return this.http.get<any>(this.apiUrl).pipe(map(this.extractData));
    }

    createExperience(experience: Experience): Observable<Experience> {
        return this.http.post<any>(this.apiUrl, experience).pipe(map(this.extractData));
    }

    updateExperience(id: number, experience: Experience): Observable<Experience> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, experience).pipe(map(this.extractData));
    }

    deleteExperience(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}