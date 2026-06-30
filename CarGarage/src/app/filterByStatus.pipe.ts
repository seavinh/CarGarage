import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterByStatus',
    standalone: true
})
export class FilterByStatusPipe implements PipeTransform {
    transform(items: any[], status: string): any[] {
        if (!items) return [];
        if (!status) return items;
        return items.filter(it => it.status === status);
    }
}
