export interface PaintColor {
    _id?: string;
    name: string;
    code?: string;
    price: number;
}

import { Customer } from './customer';
import { Car } from './car';

export interface PaintOrder {
    _id?: string;
    customerId: string | Customer;
    carId: string | Car;
    colorId: string | PaintColor;
    paintType: string;
    price: number;
    status: 'Pending' | 'Preparing' | 'Painting' | 'Drying' | 'Completed';
    startDate?: Date;
    finishDate?: Date;
    note?: string;
}
