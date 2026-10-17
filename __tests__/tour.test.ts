import type { Tour } from '../components/TourItem';
import { formatDate, getSeatLabel, groupByCity } from '../utils/tour';

const makeTour = (id: string, city: string, departure: string): Tour => ({
  id,
  name: `Tour ${id}`,
  city,
  days: 3,
  price: 3590000,
  seats: 5,
  departure,
  image: 'https://example.com/tour.jpg',
  isFavorite: false,
});

const mockTours: Tour[] = [
  makeTour('1', 'Huế', '2026-12-01'),
  makeTour('2', 'Đà Lạt', '2026-11-20'),
  makeTour('3', 'Cần Thơ', '2026-11-01'),
  makeTour('4', 'Đà Lạt', '2026-11-05'),
  makeTour('5', 'Huế', '2026-10-30'),
  makeTour('6', 'Đà Lạt', '2026-12-15'),
];

describe('groupByCity', () => {
  it('trả về đúng số nhóm (mỗi thành phố một nhóm)', () => {
    const sections = groupByCity(mockTours);
    expect(sections).toHaveLength(3);
  });

  it('sắp xếp tên thành phố A → Z', () => {
    const sections = groupByCity(mockTours);
    expect(sections.map(s => s.title)).toEqual(['Cần Thơ', 'Đà Lạt', 'Huế']);
  });

  it('sắp xếp tour trong một nhóm theo departure tăng dần', () => {
    const sections = groupByCity(mockTours);
    const daLat = sections.find(s => s.title === 'Đà Lạt')!;
    expect(daLat.data.map(t => t.departure)).toEqual(['2026-11-05', '2026-11-20', '2026-12-15']);
    expect(daLat.data.map(t => t.id)).toEqual(['4', '2', '6']);

    const hue = sections.find(s => s.title === 'Huế')!;
    expect(hue.data.map(t => t.departure)).toEqual(['2026-10-30', '2026-12-01']);
  });

  it('trả về mảng rỗng khi không có tour', () => {
    expect(groupByCity([])).toEqual([]);
  });
});

describe('formatDate', () => {
  it('"2026-11-05" → "05/11/2026"', () => {
    expect(formatDate('2026-11-05')).toBe('05/11/2026');
  });
});

describe('getSeatLabel', () => {
  it('0 → "Hết chỗ"', () => {
    expect(getSeatLabel(0)).toBe('Hết chỗ');
  });

  it('3 → "Chỉ còn 3 chỗ"', () => {
    expect(getSeatLabel(3)).toBe('Chỉ còn 3 chỗ');
  });

  it('4 → "Còn 4 chỗ"', () => {
    expect(getSeatLabel(4)).toBe('Còn 4 chỗ');
  });
});
