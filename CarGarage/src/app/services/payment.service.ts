import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = 'http://localhost:3000/api/payments';

    constructor(private http: HttpClient) { }

    getPayments(): Observable<Payment[]> {
        return this.http.get<Payment[]>(this.apiUrl);
    }

    createPayment(payment: Payment): Observable<Payment> {
        return this.http.post<Payment>(this.apiUrl, payment);
    }

    updatePayment(id: string, payment: Payment): Observable<Payment> {
        return this.http.put<Payment>(`${this.apiUrl}/${id}`, payment);
    }

    deletePayment(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
