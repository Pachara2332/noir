import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LogOut, QrCode } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../ui/Screen';
import { StateView } from '../../ui/StateView';
import { useAuth } from '../../core/auth/useAuth';
import { supabase } from '../../api/supabase';
import { colors } from '../../core/theme';
import { Booking } from '../../types/database';

export default function TicketsScreen() {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    const { data, error: ticketError } = await supabase
      .from('bookings')
      .select('*, showtimes(*, movies(*), cinemas(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (ticketError) setError(ticketError.message);
    else setTickets((data ?? []) as Booking[]);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await signOut();
    router.replace('/auth/login');
  }

  if (loading) return <StateView loading title="Loading your tickets" />;
  if (error) return <StateView title="Could not load tickets" message={error} actionLabel="Retry" onAction={() => load()} />;

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>NOIR</Text>
          <Text style={styles.title}>My Tickets</Text>
          <Text style={styles.subtitle}>@ {user?.email}</Text>
        </View>
      </View>

      <View style={styles.segment}>
        <Text style={styles.segmentActive}>ACTIVE PASSES</Text>
        <Text style={styles.segmentInactive}>PAST SCREENINGS</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
        ListEmptyComponent={<StateView title="No active passes" message="Reserve a screening and your pass will appear here." />}
        ListFooterComponent={<ConciergePanel />}
        renderItem={({ item, index }) => <TicketPass booking={item} primary={index === 0} />}
      />
    </Screen>
  );
}

function TicketPass({ booking, primary }: { booking: Booking; primary: boolean }) {
  const showtime = booking.showtimes;
  const movie = showtime?.movies;
  const image = movie?.backdrop_url ?? movie?.poster_url;
  const date = showtime?.starts_at ? new Date(showtime.starts_at) : null;

  return (
    <View style={styles.pass}>
      {image ? (
        <Image source={{ uri: image }} style={styles.passImage} contentFit="cover" />
      ) : (
        <View style={styles.passImage} />
      )}
      <View style={styles.passShade} />
      <View style={styles.passBody}>
        <Text style={styles.passBadge}>{primary ? 'EXCLUSIVE PREMIER' : 'PRIVATE SCREENING'}</Text>
        <Text style={styles.passTitle}>{movie?.title ?? 'Private Screening'}</Text>
        <Text style={styles.passLabel}>EXPERIENCE</Text>
        <Text style={styles.experience}>{primary ? 'The Golden Balcony' : 'Private Screening'}</Text>
        <Text style={styles.passLabel}>CINEMA</Text>
        <Text style={styles.passText}>{showtime?.cinemas?.name ?? 'Noir Embassy Screens'}</Text>
        <View style={styles.passGrid}>
          <View>
            <Text style={styles.passLabel}>DATE & TIME</Text>
            <Text style={styles.passText}>
              {date ? `${date.toLocaleString(undefined, { month: 'short' })} ${date.getDate()} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Reserved'}
            </Text>
          </View>
          <View>
            <Text style={styles.passLabel}>SEAT ASSIGNMENT</Text>
            <Text style={styles.seatText}>Seats {booking.seat_labels.join(', ')}</Text>
          </View>
        </View>
        <View style={styles.passFooter}>
          <View style={styles.qrRow}>
            <QrCode color={colors.gold} size={18} />
            <Text style={styles.code}>NR-{booking.id.slice(0, 3).toUpperCase()}-{booking.id.slice(-2).toUpperCase()}</Text>
          </View>
          <View style={primary ? styles.digitalPass : styles.receiptButton}>
            <Text style={primary ? styles.digitalPassText : styles.receiptText}>{primary ? 'Digital Pass' : 'View Receipt'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ConciergePanel() {
  return (
    <View style={styles.concierge}>
      <Text style={styles.conciergeTitle}>Need Assistance?</Text>
      <Text style={styles.conciergeCopy}>Our concierge is available 24/7 to handle your booking inquiries and special requests.</Text>
      <View style={styles.conciergeButton}>
        <Text style={styles.conciergeButtonText}>CONTACT NOIR CONCIERGE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 16 },
  logo: { color: colors.gold, fontSize: 23, fontWeight: '900', fontFamily: 'serif' },
  title: { color: colors.gold, fontSize: 24, fontWeight: '900', fontFamily: 'serif', marginTop: 18 },
  subtitle: { color: colors.text, marginTop: 5, fontWeight: '800', fontSize: 12 },
  logout: { width: 38, height: 38, borderRadius: 9, borderColor: colors.borderBright, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', gap: 18, borderBottomColor: colors.border, borderBottomWidth: 1, marginBottom: 16 },
  segmentActive: { color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.4, paddingBottom: 11, borderBottomColor: colors.gold, borderBottomWidth: 2 },
  segmentInactive: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.4, paddingBottom: 11 },
  list: { gap: 18, paddingBottom: 92 },
  pass: { minHeight: 330, borderRadius: 8, borderColor: colors.borderBright, borderWidth: 1, overflow: 'hidden', backgroundColor: colors.panel },
  passImage: { height: 124, backgroundColor: colors.slate },
  passShade: { position: 'absolute', left: 0, right: 0, top: 0, height: 124, backgroundColor: 'rgba(0,0,0,0.28)' },
  passBody: { padding: 14, backgroundColor: 'rgba(16,16,16,0.96)', gap: 7 },
  passBadge: { alignSelf: 'flex-start', backgroundColor: colors.gold, color: colors.background, fontSize: 9, fontWeight: '900', paddingHorizontal: 7, paddingVertical: 5 },
  passTitle: { color: colors.text, fontSize: 18, fontFamily: 'serif', fontWeight: '900', marginBottom: 5 },
  passLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  experience: { color: colors.gold, fontSize: 18, fontFamily: 'serif', fontWeight: '900' },
  passText: { color: colors.text, fontSize: 13 },
  passGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, marginTop: 8 },
  seatText: { color: colors.gold, fontSize: 13, fontWeight: '900' },
  passFooter: { borderTopColor: colors.border, borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 11, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qrRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  code: { color: colors.text, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  digitalPass: { minWidth: 88, height: 30, borderRadius: 8, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  digitalPassText: { color: colors.background, fontWeight: '900' },
  receiptButton: { minWidth: 94, height: 30, borderRadius: 8, borderColor: colors.gold, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  receiptText: { color: colors.gold, fontWeight: '900' },
  concierge: { marginTop: 14, borderRadius: 8, backgroundColor: '#0d0d0d', alignItems: 'center', padding: 18, gap: 10 },
  conciergeTitle: { color: colors.gold, fontSize: 18, fontWeight: '900', fontFamily: 'serif' },
  conciergeCopy: { color: colors.text, textAlign: 'center', lineHeight: 20, fontSize: 13 },
  conciergeButton: { marginTop: 6, height: 38, alignSelf: 'stretch', borderColor: colors.gold, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  conciergeButtonText: { color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.3, textAlign: 'center' },
});
