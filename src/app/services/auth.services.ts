import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environements/environment';
import { User, LoginResponse } from '../models/user.model';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { map } from 'rxjs/operators'; // Add this import

@Injectable({ providedIn: 'root' })
export class AuthServices {

    private readonly tokenKey = 'auth_token';
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    constructor(private http: HttpClient, private dialog: DialogService) {
        const token = localStorage.getItem(this.tokenKey);
        if (token) {
            this.currentUserSubject.next({ name: '', email: '', token });
        }

    }
    get currentUser$(): Observable<User | null> {
        return this.currentUserSubject.asObservable();
    }
    get token(): string | null {
        return localStorage.getItem(this.tokenKey);
    }


    login(email: string, password: string): Observable<User> {
        return this.http.post<LoginResponse>(
            `${environment.apiUrl}/login`,
            { email, password }
        ).pipe(
            tap(res => {

                localStorage.setItem(this.tokenKey, res.token);

                this.currentUserSubject.next({ ...res.user, token: res.token });
            }),

            map(res => {
                return { ...res.user, token: res.token };
            }),
            catchError(err => this.handleError(err))
        );
    }

    private handleError(error: HttpErrorResponse) {
        const message = error.error?.message || 'Login failed. Please try again.';
        this.dialog.error('Authentication Error', message);
        return throwError(() => error);
    }


    logout(): void {

        this.http.post(`${environment.apiUrl}/logout`, {}).subscribe({
            error: (err) => console.error('Backend logout failed', err)
        });

        localStorage.removeItem(this.tokenKey);
        this.currentUserSubject.next(null);
    }
}
