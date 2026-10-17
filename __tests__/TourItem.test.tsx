import { fireEvent, render } from '@testing-library/react-native';
import TourItem, { Tour } from '../components/TourItem';

const mockTour: Tour = {
  id: '1',
  name: 'Đà Lạt mộng mơ',
  city: 'Đà Lạt',
  days: 3,
  price: 3590000,
  seats: 2,
  departure: '2026-11-05',
  image: 'https://example.com/dalat.jpg',
  isFavorite: false,
};

describe('TourItem - bố cục', () => {
  it('compact = true: không hiển thị thành phố, chỉ có tên và giá', async () => {
    const { queryByText, getByText } = await render(
      <TourItem tour={mockTour} compact onPress={jest.fn()} onToggleFavorite={jest.fn()} />,
    );

    expect(queryByText('Đà Lạt')).toBeNull();
    expect(queryByText('📅 05/11/2026 · 3 ngày')).toBeNull();
    expect(queryByText('Chỉ còn 2 chỗ')).toBeNull();
    expect(getByText('Đà Lạt mộng mơ')).toBeTruthy();
    expect(getByText('3.590.000 ₫')).toBeTruthy();
  });

  it('compact = false (mặc định): hiển thị đầy đủ thông tin', async () => {
    const { getByText } = await render(
      <TourItem tour={mockTour} onPress={jest.fn()} onToggleFavorite={jest.fn()} />,
    );

    expect(getByText('Đà Lạt')).toBeTruthy();
    expect(getByText('📅 05/11/2026 · 3 ngày')).toBeTruthy();
    expect(getByText('3.590.000 ₫')).toBeTruthy();
    expect(getByText('Chỉ còn 2 chỗ')).toBeTruthy();
  });
});

describe('TourItem - sự kiện', () => {
  it('nhấn fav-btn → gọi onToggleFavorite(id, true) đúng 1 lần, không gọi onPress', async () => {
    const onPress = jest.fn();
    const onToggleFavorite = jest.fn();
    const { getByTestId } = await render(
      <TourItem tour={mockTour} onPress={onPress} onToggleFavorite={onToggleFavorite} />,
    );

    await fireEvent.press(getByTestId('fav-btn'));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith('1', true);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('nhấn tên tour → gọi onPress với cả object tour', async () => {
    const onPress = jest.fn();
    const onToggleFavorite = jest.fn();
    const { getByText } = await render(
      <TourItem tour={mockTour} onPress={onPress} onToggleFavorite={onToggleFavorite} />,
    );

    await fireEvent.press(getByText('Đà Lạt mộng mơ'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(mockTour);
    expect(onToggleFavorite).not.toHaveBeenCalled();
  });
});
