import { router } from 'expo-router';
import { Image } from 'expo-image';
import { QrCode, Ticket } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../ui/Screen';
import { StateView } from '../../ui/StateView';
import { useAuth } from '../../core/auth/useAuth';
import { supabase } from '../../api/supabase';
import { colors } from '../../core/theme';
import { Booking } from '../../types/database';

export default function TicketsScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TicketTab>('active');

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

  if (loading) return <StateView loading title="Loading your tickets" />;
  if (error) return <StateView title="Could not load tickets" message={error} actionLabel="Retry" onAction={() => load()} />;

  const visibleTickets = tickets.filter((ticket) => {
    const startsAt = ticket.showtimes?.starts_at;
    const isPast = ticket.status === 'cancelled' || (startsAt ? new Date(startsAt) < new Date() : false);
    return activeTab === 'past' ? isPast : !isPast;
  });

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Tickets</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.segment}>
        <TicketTabButton active={activeTab === 'active'} label="ACTIVE PASSES" onPress={() => setActiveTab('active')} />
        <TicketTabButton active={activeTab === 'past'} label="PAST SCREENINGS" onPress={() => setActiveTab('past')} />
      </View>

      <FlatList
        data={visibleTickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
        ListEmptyComponent={<EmptyTickets past={activeTab === 'past'} />}
        ListFooterComponent={visibleTickets.length ? <ConciergePanel /> : null}
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
              {date ? `${date.toLocaleString(undefined, { month: 'short' })} ${date.getDate()} \u00b7 ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Reserved'}
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
          <Pressable onPress={() => showTicketDetails(booking)} style={primary ? styles.digitalPass : styles.receiptButton}>
            <Text style={primary ? styles.digitalPassText : styles.receiptText}>{primary ? 'Digital Pass' : 'View Receipt'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function showTicketDetails(booking: Booking) {
  Alert.alert(
    'Digital pass',
    `Booking NR-${booking.id.slice(0, 3).toUpperCase()}-${booking.id.slice(-2).toUpperCase()}\nSeats ${booking.seat_labels.join(', ')}\nTotal \u0e3f${booking.total_price.toFixed(0)}`,
  );
}

function EmptyTickets({ past = false }: { past?: boolean }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ticket color={colors.gold} size={64} strokeWidth={1.4} />
        <QrCode color={colors.gold} size={28} />
      </View>
      <Text style={styles.emptyTitle}>{past ? 'No past screenings' : 'No tickets yet'}</Text>
      <Text style={styles.emptyCopy}>{past ? 'Your screening history will appear here.' : 'Your confirmed screenings and digital passes will appear here.'}</Text>
      {!past ? (
        <Pressable onPress={() => router.replace('/(protected)/(tabs)')} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>EXPLORE MOVIES</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ConciergePanel() {
  return (
    <View style={styles.concierge}>
      <Text style={styles.conciergeTitle}>Need Assistance?</Text>
      <Text style={styles.conciergeCopy}>Our concierge is available 24/7 to handle your booking inquiries and special requests.</Text>
      <Pressable onPress={() => Linking.openURL('mailto:concierge@noir.example?subject=Noir%20booking%20assistance')} style={styles.conciergeButton}>
        <Text style={styles.conciergeButtonText}>CONTACT NOIR CONCIERGE</Text>
      </Pressable>
    </View>
  );
}

type TicketTab = 'active' | 'past';

function TicketTabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.segmentItem}>
      <Text style={active ? styles.segmentActive : styles.segmentInactive}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 16 },
  title: { color: colors.text, fontSize: 34, fontWeight: '900' },
  subtitle: { color: colors.muted, marginTop: 5, fontWeight: '700', fontSize: 12 },
  segment: { flexDirection: 'row', borderRadius: 26, padding: 4, backgroundColor: colors.panelSoft, marginBottom: 16 },
  segmentActive: { borderRadius: 22, color: colors.background, backgroundColor: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.1, paddingVertical: 12, textAlign: 'center' },
  segmentInactive: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.1, paddingVertical: 12, textAlign: 'center' },
  segmentItem: { flex: 1 },
  list: { gap: 18, paddingBottom: 92 },
  empty: { minHeight: 470, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 },
  emptyIcon: { width: 132, height: 108, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: colors.panel },
  emptyTitle: { color: colors.text, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  emptyCopy: { maxWidth: 280, color: colors.muted, lineHeight: 21, textAlign: 'center' },
  emptyButton: { marginTop: 8, borderRadius: 22, paddingHorizontal: 22, paddingVertical: 13, backgroundColor: colors.gold },
  emptyButtonText: { color: colors.background, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
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
