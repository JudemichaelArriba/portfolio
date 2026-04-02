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

    getExperiences(): Observable<Experience[]> {
        return this.http.get<{ data: Experience[] }>(this.apiUrl).pipe(
            map(res => res.data)
        );
    }

    createExperience(experience: Experience): Observable<Experience> {
        return this.http.post<{ data: Experience }>(this.apiUrl, experience).pipe(
            map(res => res.data)
        );
    }

    updateExperience(id: number, experience: Experience): Observable<Experience> {
        return this.http.put<{ data: Experience }>(`${this.apiUrl}/${id}`, experience).pipe(
            map(res => res.data)
        );
    }
}