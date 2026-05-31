import { Tabs } from 'expo-router';
import { Clapperboard, MapPinned, Ticket, UserRound } from 'lucide-react-native';
import { colors } from '../core/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1f1f21',
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
        },
        tabBarItemStyle: {
          borderRadius: 12,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Movies',
          tabBarIcon: ({ color, size }) => <Clapperboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cinemas"
        options={{
          title: 'Cinemas',
          tabBarIcon: ({ color, size }) => <MapPinned color={color} size={size} />,
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
