import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../core/theme';
import { Seat } from '../types/database';

type SeatMapProps = {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggle: (seat: Seat) => void;
};

const rowOrder = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const seatRowsTopFirst = [...rowOrder].reverse();

export function SeatMap({ seats, selectedSeatIds, onToggle }: SeatMapProps) {
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
      <View style={styles.screenShell}>
        <View style={styles.screenGlow} />
        <Text style={styles.screenText}>SCREEN</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.auditorium}>
          {sortedRows.map(([row, rowSeats]) => (
            <View key={row} style={[styles.row, row <= 'C' && styles.frontRow]}>
              <Text style={styles.rowLabel}>{row}</Text>
              <View style={styles.seats}>
                {rowSeats.map((seat) => {
                  const selected = selectedSeatIds.includes(seat.id);
                  const booked = seat.status === 'booked';
                  const held = seat.status === 'held';
                  const aisleAfter = seat.seat_number === 8 || seat.seat_number === 20;

                  return (
                    <View key={seat.id} style={[styles.seatSlot, aisleAfter && styles.aisleAfter]}>
                      <Pressable
                        onPress={() => onToggle(seat)}
                        disabled={booked}
                        accessibilityRole="button"
                        accessibilityLabel={`Seat ${seat.label}`}
                        style={({ pressed }) => [
                          styles.seat,
                          booked && styles.booked,
                          held && styles.held,
                          selected && styles.selected,
                          pressed && !booked && styles.pressed,
                        ]}
                      >
                        <View style={[styles.seatBack, selected && styles.selectedBack, booked && styles.bookedBack]} />
                        <View style={[styles.seatBase, selected && styles.selectedBase, booked && styles.bookedBase]}>
                          <Text style={[styles.seatText, selected && styles.selectedText, booked && styles.bookedText]}>
                            {seat.row_label}
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.rowLabel}>{row}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Legend color={colors.red} label="Available" />
        <Legend color={colors.gold} label="Selected" />
        <Legend color={colors.slate} label="Booked" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
    backgroundColor: '#090909',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  screenShell: {
    height: 76,
    marginHorizontal: 18,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    borderTopWidth: 5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18110b',
  },
  screenGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(215,181,109,0.12)',
  },
  screenText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  auditorium: {
    gap: 4,
    minWidth: 620,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  frontRow: {
    marginTop: 8,
    justifyContent: 'center',
  },
  rowLabel: {
    width: 16,
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  seats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seatSlot: {
    width: 18,
    height: 18,
  },
  aisleAfter: {
    marginRight: 22,
  },
  seat: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
  seatBack: {
    position: 'absolute',
    top: 1,
    width: 15,
    height: 9,
    borderRadius: 3,
    backgroundColor: '#d73327',
    borderColor: '#7e1711',
    borderWidth: 1,
  },
  seatBase: {
    width: 18,
    height: 9,
    borderRadius: 3,
    backgroundColor: '#b8251c',
    borderColor: '#70140f',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    fontSize: 6,
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
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    color: colors.muted,
    fontSize: 12,
  },
});
