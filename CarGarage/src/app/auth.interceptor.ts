import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    let token = null;
    if (typeof localStorage !== 'undefined') {
        token = localStorage.getItem('token');
    }

    // Clone the request and add the authorization header
    const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    const authService = inject(AuthService);

    return next(authReq).pipe(
        catchError((err) => {
            if (err.status === 401) {
                // Auto logout if 401 response returned from api
                authService.logout();
            }
            return throwError(() => err);
        })
    );
};
