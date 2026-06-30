import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaintColor } from '../../models/paint';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-colors-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './colors-page.html',
  styleUrl: './colors-page.css'
})
export class ColorsPage {
  colors = input<PaintColor[]>([]);
  addColor = output<PaintColor>();
  editColor = output<PaintColor>();
  deleteColor = output<string>();

  colorSearch = signal<string>('');
  showModal = false;
  editing: PaintColor | null = null;
  form: Partial<PaintColor> = { name: '', code: '', price: 0 };

  filteredColors = () => {
    const q = this.colorSearch().toLowerCase();
    if (!q) return this.colors();
    return this.colors().filter(c => c.name.toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q));
  };

  openAdd() {
    this.editing = null;
    this.form = { name: '', code: '', price: 0 };
    this.showModal = true;
  }

  openEdit(color: PaintColor) {
    this.editing = color;
    this.form = { ...color };
    this.showModal = true;
  }

  save() {
    if (!this.form.name) return;
    if (this.editing) {
      this.editColor.emit({ ...this.editing, ...this.form } as PaintColor);
    } else {
      this.addColor.emit(this.form as PaintColor);
    }
    this.showModal = false;
  }

  onDelete(id: string) {
    Swal.fire({
      title: 'Delete this color?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteColor.emit(id);
      }
    });
  }
}
