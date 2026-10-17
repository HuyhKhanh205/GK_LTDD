import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDate, formatPrice, getSeatLabel } from '../utils/tour';

export type Tour = {
  id: string;
  name: string;
  city: string;
  days: number;
  price: number;
  seats: number;
  departure: string; // "YYYY-MM-DD"
  image: string;
  isFavorite: boolean;
};

export type TourItemProps = {
  tour: Tour;
  compact?: boolean;
  onPress: (tour: Tour) => void;
  onToggleFavorite: (id: string, next: boolean) => void;
};

function TourItem({ tour, compact = false, onPress, onToggleFavorite }: TourItemProps) {
  const isLowSeats = tour.seats <= 3;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(tour)}
      style={[styles.card, compact ? styles.cardCompact : styles.cardRow]}
    >
      <Image
        source={{ uri: tour.image }}
        style={[styles.image, compact ? styles.imageCompact : styles.imageRow]}
      />

      <View style={[styles.info, compact ? styles.infoCompact : styles.infoRow]}>
        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={compact ? 1 : 2}>
          {tour.name}
        </Text>

        {!compact && <Text style={styles.city}>{tour.city}</Text>}

        {!compact && (
          <Text style={styles.meta}>
            📅 {formatDate(tour.departure)} · {tour.days} ngày
          </Text>
        )}

        <Text style={styles.price}>{formatPrice(tour.price)}</Text>

        {!compact && (
          <Text style={[styles.seats, isLowSeats && styles.seatsLow]}>
            {getSeatLabel(tour.seats)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        testID="fav-btn"
        accessibilityRole="button"
        accessibilityLabel={tour.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
        hitSlop={8}
        onPress={() => onToggleFavorite(tour.id, !tour.isFavorite)}
        style={[styles.favBtn, compact ? styles.favBtnCompact : styles.favBtnRow]}
      >
        <Text style={[styles.heart, tour.isFavorite && styles.heartActive]}>
          {tour.isFavorite ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ----- chung -----
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    backgroundColor: '#e5e7eb',
  },
  info: {
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  city: {
    fontSize: 13,
    color: '#4b5563',
  },
  meta: {
    fontSize: 13,
    color: '#4b5563',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0e7490',
  },
  seats: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  seatsLow: {
    color: '#dc2626',
  },
  favBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 22,
    color: '#9ca3af',
  },
  heartActive: {
    color: '#e11d48',
  },

  // ----- compact = false: bố cục ngang -----
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  imageRow: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  infoRow: {
    flex: 1,
    marginLeft: 12,
  },
  favBtnRow: {
    width: 36,
    height: 36,
    marginLeft: 4,
  },

  // ----- compact = true: thẻ dọc rộng 160 -----
  cardCompact: {
    width: 160,
    flexDirection: 'column',
  },
  imageCompact: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  infoCompact: {
    padding: 8,
  },
  nameCompact: {
    fontSize: 14,
  },
  favBtnCompact: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});

export default React.memo(TourItem);
