import { Tabs } from 'expo-router';
import { Film, MapPin, Ticket, UserRound } from 'lucide-react-native';
import { colors } from '../../../src/styles/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#070707',
          borderTopColor: colors.border,
          minHeight: 56,
          paddingTop: 4,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '800',
          textTransform: 'uppercase',
        },
        tabBarItemStyle: {
          borderRadius: 8,
          marginHorizontal: 3,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: 'rgba(215,181,109,0.13)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Now Playing',
          tabBarIcon: ({ color, size }) => <Film color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cinemas"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color, size }) => <Ticket color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
