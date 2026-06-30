import { Component, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaintOrder } from '../../models/paint';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPage {
  orders = input<PaintOrder[]>([]);
  carCount = input<number>(0);

  dateSpan = signal<'Today' | 'This Month' | 'This Year' | 'All Time'>('This Month');
  taskFilter = signal<'All Tasks' | 'Completed' | 'Pending' | 'Painting'>('All Tasks');

  stats = computed(() => {
    let revenue = 0;
    let completedRev = 0;
    let paintingRev = 0;
    let pendingRev = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let relevantOrders = this.orders();

    if (this.dateSpan() === 'Today') {
      const todayStr = now.toDateString();
      relevantOrders = relevantOrders.filter(o => {
        if (!(o as any).createdAt) return true;
        return new Date((o as any).createdAt).toDateString() === todayStr;
      });
    } else if (this.dateSpan() === 'This Month') {
      relevantOrders = relevantOrders.filter(o => {
        if (!(o as any).createdAt) return true;
        const d = new Date((o as any).createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else if (this.dateSpan() === 'This Year') {
      relevantOrders = relevantOrders.filter(o => {
        if (!(o as any).createdAt) return true;
        const d = new Date((o as any).createdAt);
        return d.getFullYear() === currentYear;
      });
    }

    if (this.taskFilter() !== 'All Tasks') {
      relevantOrders = relevantOrders.filter(o => o.status === this.taskFilter());
    }

    relevantOrders.forEach(o => {
      const p = o.price || 0;
      revenue += p;
      if (o.status === 'Completed') completedRev += p;
      else if (o.status === 'Painting') paintingRev += p;
      else pendingRev += p;
    });

    const orderCount = relevantOrders.length;
    const total = revenue || 1;
    const completedPct = Math.round((completedRev / total) * 100);
    const paintingPct = Math.round((paintingRev / total) * 100);
    const pendingPct = revenue === 0 ? 0 : 100 - completedPct - paintingPct;

    const p1 = paintingPct;
    const p2 = p1 + pendingPct;
    const gradient = `conic-gradient(#4f46e5 0% ${p1}%, #f59e0b ${p1}% ${p2}%, #10b981 ${p2}% 100%)`;

    return {
      revenue, orderCount,
      completedPct, paintingPct, pendingPct,
      gradient: revenue === 0 ? 'conic-gradient(#e5e7eb 0% 100%)' : gradient
    };
  });
}
