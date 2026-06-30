import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaintColor, PaintOrder } from '../models/paint';

@Injectable({
    providedIn: 'root'
})
export class PaintService {
    private urlColors = 'http://localhost:3000/api/paints/colors';
    private urlOrders = 'http://localhost:3000/api/paints/orders';

    constructor(private http: HttpClient) { }

    // --- Colors ---
    getColors(): Observable<PaintColor[]> {
        return this.http.get<PaintColor[]>(this.urlColors);
    }

    createColor(color: PaintColor): Observable<PaintColor> {
        return this.http.post<PaintColor>(this.urlColors, color);
    }

    updateColor(id: string, color: PaintColor): Observable<PaintColor> {
        return this.http.put<PaintColor>(`${this.urlColors}/${id}`, color);
    }

    deleteColor(id: string): Observable<any> {
        return this.http.delete(`${this.urlColors}/${id}`);
    }

    // --- Orders ---
    getOrders(): Observable<PaintOrder[]> {
        return this.http.get<PaintOrder[]>(this.urlOrders);
    }

    createOrder(order: PaintOrder): Observable<PaintOrder> {
        return this.http.post<PaintOrder>(this.urlOrders, order);
    }

    updateOrder(id: string, order: PaintOrder): Observable<PaintOrder> {
        return this.http.put<PaintOrder>(`${this.urlOrders}/${id}`, order);
    }

    deleteOrder(id: string): Observable<any> {
        return this.http.delete(`${this.urlOrders}/${id}`);
    }
}
