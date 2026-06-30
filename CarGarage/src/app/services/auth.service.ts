import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
    _id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    status: string;
    createdAt?: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';

    // State signal
    currentUser = signal<User | null>(null);

    constructor(private http: HttpClient) {
        this.checkToken();
    }

    // Hydrate state from localStorage
    private checkToken() {
        if (typeof localStorage !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                // Decode token or fetch 'me'. For simplicity, fetch /me or rely on local user data
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    try {
                        this.currentUser.set(JSON.parse(savedUser));
                    } catch (e) { }
                }
            }
        }
    }

    login(credentials: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(res => this.handleAuth(res))
        );
    }

    register(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap(res => this.handleAuth(res))
        );
    }

    private handleAuth(res: AuthResponse) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
        }
        this.currentUser.set(res.user);
    }

    logout() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        this.currentUser.set(null);
        // Optional: Call logout endpoint if needed
        // this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    }
}
