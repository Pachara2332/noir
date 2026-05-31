import { Minus, Plus, Scan } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../core/theme';
import { Seat } from '../types/database';

type SeatMapProps = {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggle: (seat: Seat) => void;
  basePrice: number;
};

const rowOrder = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const seatRowsTopFirst = [...rowOrder].reverse();
const seatNumbers = Array.from({ length: 28 }, (_, index) => index + 1);
const zoomLevels = [
  { label: 'Fit', scale: 1 },
  { label: '125%', scale: 1.25 },
  { label: '150%', scale: 1.5 },
];

export function SeatMap({ seats, selectedSeatIds, onToggle, basePrice }: SeatMapProps) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = zoomLevels[zoomIndex];
  const metrics = getSeatMetrics(zoom.scale);
  const rows = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    acc[seat.row_label] = [...(acc[seat.row_label] ?? []), seat];
    return acc;
  }, {});

  const sortedRows = Object.entries(rows)
    .sort(([a], [b]) => seatRowsTopFirst.indexOf(a) - seatRowsTopFirst.indexOf(b))
    .map(([row, rowSeats]) => [
      row,
      rowSeats.sort((a, b) => a.seat_number - b.seat_number),
    ] as const);

  return (
    <View style={styles.wrap}>
      <View style={styles.mapHeading}>
        <View style={styles.mapCopy}>
          <Text style={styles.mapTitle}>Select your seats</Text>
          <Text style={styles.mapSubtitle}>Zoom in, then tap an available seat</Text>
        </View>
        <View style={styles.zoomControls}>
          <Pressable
            accessibilityLabel="Zoom out"
            disabled={zoomIndex === 0}
            onPress={() => setZoomIndex((current) => Math.max(0, current - 1))}
            style={[styles.zoomButton, zoomIndex === 0 && styles.zoomDisabled]}
          >
            <Minus color={colors.text} size={14} />
          </Pressable>
          <Pressable accessibilityLabel="Fit seat map to screen" onPress={() => setZoomIndex(0)} style={styles.zoomLabel}>
            <Scan color={colors.gold} size={13} />
            <Text style={styles.zoomText}>{zoom.label}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Zoom in"
            disabled={zoomIndex === zoomLevels.length - 1}
            onPress={() => setZoomIndex((current) => Math.min(zoomLevels.length - 1, current + 1))}
            style={[styles.zoomButton, zoomIndex === zoomLevels.length - 1 && styles.zoomDisabled]}
          >
            <Plus color={colors.text} size={14} />
          </Pressable>
        </View>
      </View>
      <View style={styles.screenShell}>
        <View style={styles.screenGlow} />
        <View style={styles.screenLine} />
        <Text style={styles.screenText}>SCREEN</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.auditorium, { minWidth: metrics.auditoriumWidth }]}>
          {sortedRows.map(([row, rowSeats], index) => (
            <View key={row} style={[styles.row, index === 3 && styles.zoneBreak]}>
              <Text style={[styles.rowLabel, { width: metrics.labelWidth, fontSize: metrics.labelFontSize }]}>{row}</Text>
              <View style={[styles.seats, { gap: metrics.gap }]}>
                {seatNumbers.map((seatNumber) => {
                  const seat = rowSeats.find((candidate) => candidate.seat_number === seatNumber);
                  const aisleAfter = seatNumber === 8 || seatNumber === 20;
                  const slotStyle = { width: metrics.slotWidth, height: metrics.slotHeight };

                  if (!seat) {
                    return <View key={`${row}-${seatNumber}`} style={[slotStyle, aisleAfter && { marginRight: metrics.aisleWidth }]} />;
                  }

                  const selected = selectedSeatIds.includes(seat.id);
                  const booked = seat.status === 'booked';
                  const held = seat.status === 'held';
                  const variant = getSeatVariant(seat);

                  return (
                    <View key={seat.id} style={[slotStyle, aisleAfter && { marginRight: metrics.aisleWidth }]}>
                      <Pressable
                        onPress={() => onToggle(seat)}
                        disabled={booked}
                        accessibilityRole="button"
                        accessibilityLabel={`Seat ${seat.label}`}
                        style={({ pressed }) => [
                          styles.seat,
                          slotStyle,
                          booked && styles.booked,
                          held && styles.held,
                          selected && styles.selected,
                          pressed && !booked && styles.pressed,
                        ]}
                      >
                        <View style={[
                          styles.seatBack,
                          { width: metrics.backWidth, height: metrics.backHeight, borderRadius: metrics.radius },
                          styles[`${variant}Back`],
                          selected && styles.selectedBack,
                          booked && styles.bookedBack,
                        ]} />
                        <View style={[
                          styles.seatBase,
                          { width: metrics.slotWidth, height: metrics.baseHeight, borderRadius: metrics.radius },
                          styles[`${variant}Base`],
                          selected && styles.selectedBase,
                          booked && styles.bookedBase,
                        ]}>
                          <Text style={[styles.seatText, { fontSize: metrics.seatFontSize }, selected && styles.selectedText, booked && styles.bookedText]}>
                            {seat.row_label}
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
              <Text style={[styles.rowLabel, { width: metrics.labelWidth, fontSize: metrics.labelFontSize }]}>{row}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <SeatTypeCard color="#d73327" label="Standard" price={basePrice} />
        <SeatTypeCard color="#7045b8" label="Comfort" price={basePrice + 90} />
        <SeatTypeCard color={colors.gold} label="Premium" price={basePrice + 140} />
      </View>
      <View style={styles.statusLegend}>
        <StatusLegend color={colors.gold} label="Selected" />
        <StatusLegend color={colors.slate} label="Booked" />
      </View>
    </View>
  );
}

type SeatVariant = 'standard' | 'comfort' | 'premium';

function getSeatMetrics(scale: number) {
  const slotWidth = 9 * scale;
  const gap = 1 * scale;
  const aisleWidth = 7 * scale;
  const labelWidth = 10 * scale;

  return {
    slotWidth,
    slotHeight: 12 * scale,
    gap,
    aisleWidth,
    labelWidth,
    labelFontSize: 8 * scale,
    backWidth: 8 * scale,
    backHeight: 7 * scale,
    baseHeight: 6 * scale,
    radius: 2 * scale,
    seatFontSize: 4 * scale,
    auditoriumWidth: (slotWidth * 28) + (gap * 27) + (aisleWidth * 2) + (labelWidth * 2) + (12 * scale),
  };
}

function getSeatVariant(seat: Seat): SeatVariant {
  if (seat.price_modifier >= 140) return 'premium';
  if (seat.price_modifier >= 90) return 'comfort';
  return 'standard';
}

function SeatTypeCard({ color, label, price }: { color: string; label: string; price: number }) {
  return (
    <View style={[styles.typeCard, { borderColor: color }]}>
      <View style={styles.typeSeat}>
        <View style={[styles.typeSeatBack, { backgroundColor: color }]} />
        <View style={[styles.typeSeatBase, { backgroundColor: color }]} />
      </View>
      <Text style={styles.typeLabel}>{label}</Text>
      <Text style={styles.typePrice}>{'\u0e3f'}{price.toFixed(0)}</Text>
    </View>
  );
}

function StatusLegend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.statusItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 18,
    overflow: 'hidden',
  },
  mapHeading: { paddingHorizontal: 16, gap: 8 },
  mapCopy: { gap: 4 },
  zoomControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  zoomButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.panelSoft },
  zoomDisabled: { opacity: 0.35 },
  zoomLabel: { height: 30, borderRadius: 15, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.panelSoft },
  zoomText: { color: colors.gold, fontSize: 11, fontWeight: '900' },
  mapTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  mapSubtitle: { color: colors.muted, fontSize: 12 },
  screenShell: {
    height: 92,
    marginHorizontal: 22,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    borderTopWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  screenGlow: {
    ...StyleSheet.absoluteFill,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    backgroundColor: 'rgba(242,185,59,0.13)',
  },
  screenLine: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    height: 5,
    borderRadius: 5,
    backgroundColor: colors.gold,
  },
  screenText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  auditorium: {
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoneBreak: { marginTop: 13 },
  rowLabel: {
    color: colors.text,
    fontWeight: '900',
    textAlign: 'center',
  },
  seats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seat: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
  seatBack: {
    position: 'absolute',
    top: 1,
    borderWidth: 1,
  },
  seatBase: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardBack: { backgroundColor: '#d73327', borderColor: '#7e1711' },
  standardBase: { backgroundColor: '#b8251c', borderColor: '#70140f' },
  comfortBack: { backgroundColor: '#7045b8', borderColor: '#41266f' },
  comfortBase: { backgroundColor: '#583494', borderColor: '#35205c' },
  premiumBack: { backgroundColor: '#f04b3d', borderColor: '#922218' },
  premiumBase: { backgroundColor: '#ca3026', borderColor: '#7a1d17' },
  selected: {},
  selectedBack: {
    backgroundColor: colors.gold,
    borderColor: colors.goldDeep,
  },
  selectedBase: {
    backgroundColor: colors.goldDeep,
    borderColor: colors.gold,
  },
  booked: {},
  bookedBack: {
    backgroundColor: '#5f6268',
    borderColor: '#2e3135',
  },
  bookedBase: {
    backgroundColor: '#3d4046',
    borderColor: '#202328',
  },
  held: {
    opacity: 0.5,
  },
  seatText: {
    color: '#2b0705',
    fontWeight: '900',
  },
  selectedText: {
    color: colors.background,
  },
  bookedText: {
    color: colors.muted,
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
  },
  typeCard: {
    flex: 1,
    minHeight: 108,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.panelSoft,
  },
  typeSeat: { width: 30, height: 24, alignItems: 'center', justifyContent: 'flex-end' },
  typeSeatBack: { position: 'absolute', top: 0, width: 25, height: 14, borderRadius: 4 },
  typeSeatBase: { width: 30, height: 12, borderRadius: 4 },
  typeLabel: { color: colors.text, fontSize: 12, fontWeight: '900' },
  typePrice: { color: colors.text, fontSize: 15, fontWeight: '900' },
  statusLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  statusText: {
    color: colors.muted,
    fontSize: 12,
  },
});
