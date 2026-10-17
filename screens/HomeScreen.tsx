import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TourItem, { Tour } from '../components/TourItem';
import { API_URL, MSSV, STUDENT_NAME } from '../constants/config';
import { formatDate, formatPrice, groupByCity } from '../utils/tour';

const HorizontalSeparator = () => <View style={styles.hSeparator} />;

export default function HomeScreen() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- GET -----
  const fetchTours = useCallback(async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Tour[] = await res.json();
    setTours(data);
    setError(null);
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      await fetchTours();
    } catch (e) {
      setError('Không tải được danh sách tour. Kiểm tra API_URL hoặc kết nối mạng.');
    } finally {
      setLoading(false);
    }
  }, [fetchTours]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Kéo xuống để làm mới: gọi lại GET, giữ nguyên keyword (không reset state keyword)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTours();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể làm mới danh sách tour.');
    } finally {
      setRefreshing(false);
    }
  }, [fetchTours]);

  // ----- PUT: cập nhật lạc quan + hoàn tác khi lỗi -----
  const handleToggleFavorite = useCallback(async (id: string, next: boolean) => {
    // 1. Cập nhật ngay trên state
    setTours(prev => prev.map(t => (t.id === id ? { ...t, isFavorite: next } : t)));

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      // 2. Lỗi (!res.ok hoặc mất mạng) → hoàn tác về trạng thái cũ
      setTours(prev => prev.map(t => (t.id === id ? { ...t, isFavorite: !next } : t)));
      Alert.alert('Lỗi', 'Không thể cập nhật yêu thích. Đã hoàn tác thay đổi.');
    }
  }, []);

  // ----- Nhấn thẻ → Alert chi tiết -----
  const handlePressTour = useCallback((tour: Tour) => {
    Alert.alert(
      tour.name,
      `Ngày khởi hành: ${formatDate(tour.departure)}\n` +
        `Số ngày: ${tour.days} ngày\n` +
        `Giá: ${formatPrice(tour.price)}`,
    );
  }, []);

  // ----- Tìm kiếm (useMemo, không phân biệt hoa thường, trim) -----
  const sections = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const filtered = q ? tours.filter(t => t.name.toLowerCase().includes(q)) : tours;
    // groupByCity chỉ tạo nhóm cho thành phố có tour → nhóm rỗng tự bị ẩn
    return groupByCity(filtered);
  }, [tours, keyword]);

  // Mục yêu thích lấy từ toàn bộ tours → không bị ảnh hưởng bởi ô tìm kiếm
  const favorites = useMemo(() => tours.filter(t => t.isFavorite), [tours]);

  const favoriteHeader = (
    <View style={styles.favSection}>
      <Text style={styles.favTitle}>Tour yêu thích ({favorites.length})</Text>
      {favorites.length === 0 ? (
        <Text style={styles.favEmpty}>Chưa có tour yêu thích</Text>
      ) : (
        <FlatList
          horizontal
          data={favorites}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={HorizontalSeparator}
          contentContainerStyle={styles.favList}
          renderItem={({ item }) => (
            <TourItem
              tour={item}
              compact
              onPress={handlePressTour}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tour Việt</Text>
        <Text style={styles.student}>
          {MSSV} – {STUDENT_NAME}
        </Text>
        <TextInput
          style={styles.search}
          placeholder="Tìm tour theo tên..."
          placeholderTextColor="#9ca3af"
          value={keyword}
          onChangeText={setKeyword}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Nội dung */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0e7490" />
          <Text style={styles.muted}>Đang tải dữ liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadInitial}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TourItem
              tour={item}
              onPress={handlePressTour}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {section.title} · {section.data.length} tour
              </Text>
            </View>
          )}
          stickySectionHeadersEnabled
          ListHeaderComponent={favoriteHeader}
          ListEmptyComponent={
            <Text style={styles.emptyList}>Không tìm thấy tour phù hợp</Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0e7490']} />
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#0e7490',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  student: {
    fontSize: 14,
    color: '#cffafe',
    marginTop: 2,
    marginBottom: 10,
  },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  muted: {
    color: '#6b7280',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#0e7490',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  favSection: {
    paddingVertical: 12,
  },
  favTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  favEmpty: {
    paddingHorizontal: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  favList: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  hSeparator: {
    width: 12,
  },
  sectionHeader: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c4a6e',
  },
  emptyList: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 32,
  },
});
