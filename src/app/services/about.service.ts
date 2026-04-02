import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environements/environment';
import { About } from '../models/about.model';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/about`;

  getAboutData(): Observable<About> {
    return this.http.get<{ message: string, data: About }>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }

  updateAbout(id: number, data: About): Observable<About> {
    return this.http.put<{ message: string, data: About }>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res.data)
    );
  }
}