import { Customer } from './customer';

export interface Car {
    _id?: string;
    customerId: string | Customer;
    brand: string;
    model?: string;
    year?: number;
    plateNumber: string;
    color?: string;
}
