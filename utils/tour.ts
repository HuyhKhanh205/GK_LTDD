import type { Tour } from '../components/TourItem';

export type TourSection = {
  title: string;
  data: Tour[];
};

/**
 * Nhóm tour theo thành phố.
 * - Các nhóm sắp xếp theo tên thành phố A → Z (theo bảng chữ cái tiếng Việt).
 * - Tour trong mỗi nhóm sắp xếp theo departure tăng dần.
 * Không làm thay đổi mảng đầu vào.
 */
export function groupByCity(tours: Tour[]): TourSection[] {
  const map = new Map<string, Tour[]>();

  for (const tour of tours) {
    const list = map.get(tour.city);
    if (list) {
      list.push(tour);
    } else {
      map.set(tour.city, [tour]);
    }
  }

  return Array.from(map, ([title, data]) => ({
    title,
    data: [...data].sort((a, b) => a.departure.localeCompare(b.departure)),
  })).sort((a, b) => a.title.localeCompare(b.title, 'vi'));
}

/** "2026-11-05" → "05/11/2026" */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

/** 0 → "Hết chỗ"; 1–3 → "Chỉ còn N chỗ"; > 3 → "Còn N chỗ" */
export function getSeatLabel(seats: number): string {
  if (seats <= 0) return 'Hết chỗ';
  if (seats <= 3) return `Chỉ còn ${seats} chỗ`;
  return `Còn ${seats} chỗ`;
}

/** 3590000 → "3.590.000 ₫" (không phụ thuộc Intl của máy) */
export function formatPrice(price: number): string {
  const digits = String(Math.round(price)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${digits} ₫`;
}
