import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environements/environment';
import { Hero } from '../models/hero.model';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HeroService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/heroes`;

    getHeroData(): Observable<Hero> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => {

                if (Array.isArray(response)) {
                    return response.length > 0 ? response[0] : null;
                }
                return response;
            }),
            catchError((err) => {
                console.error('Hero Data Fetch Error:', err);
                return of(null as any);
            })
        );
    }

    updateHero(id: number | string, data: Hero): Observable<Hero> {
        return this.http.put<Hero>(`${this.apiUrl}/${id}`, data);
    }
}