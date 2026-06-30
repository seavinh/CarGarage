import { PaintOrder } from './paint';

export interface Payment {
    _id?: string;
    orderId: string | PaintOrder;
    amount: number;
    method: 'Cash' | 'Bakong';
    status: 'Pending' | 'Paid';
}
