import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';
import { Seat } from '../types/database';

type SeatMapProps = {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggle: (seat: Seat) => void;
};

export function SeatMap({ seats, selectedSeatIds, onToggle }: SeatMapProps) {
  const rows = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    acc[seat.row_label] = [...(acc[seat.row_label] ?? []), seat];
    return acc;
  }, {});

  return (
    <View style={styles.wrap}>
      <View style={styles.screen}>
        <Text style={styles.screenText}>SCREEN</Text>
      </View>
      {Object.entries(rows).map(([row, rowSeats]) => (
        <View key={row} style={styles.row}>
          <Text style={styles.rowLabel}>{row}</Text>
          <View style={styles.seats}>
            {rowSeats.map((seat) => {
              const selected = selectedSeatIds.includes(seat.id);
              const booked = seat.status === 'booked';
              return (
                <Pressable
                  key={seat.id}
                  onPress={() => onToggle(seat)}
                  disabled={booked}
                  style={[
                    styles.seat,
                    booked && styles.booked,
                    selected && styles.selected,
                    seat.status === 'held' && styles.held,
                  ]}
                >
                  <Text style={[styles.seatText, selected && styles.selectedText, booked && styles.bookedText]}>
                    {seat.seat_number}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      <View style={styles.legend}>
        <Legend color={colors.panelSoft} label="Available" />
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
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  screen: {
    height: 34,
    borderTopWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  screenText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    width: 18,
    color: colors.muted,
    fontWeight: '800',
  },
  seats: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seat: {
    width: 30,
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.borderBright,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  booked: {
    backgroundColor: colors.slate,
    borderColor: colors.slate,
  },
  held: {
    borderColor: colors.red,
  },
  seatText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
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
