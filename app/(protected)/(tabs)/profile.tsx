import { router } from 'expo-router';
import { CalendarDays, ChevronLeft, Tag, UserRound } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StateView } from '../../../src/components/StateView';
import { useAuth } from '../../../src/hooks/useAuth';
import { supabase } from '../../../src/lib/supabase';
import { colors } from '../../../src/styles/theme';
import { UserProfile } from '../../../src/types/database';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
    } else {
      const nextProfile = data as UserProfile | null;
      setProfile(nextProfile);
      setDisplayName(nextProfile?.display_name ?? '');
      setAvatarUrl(nextProfile?.avatar_url ?? '');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error: updateError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email ?? profile?.email ?? '',
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      });

    setSaving(false);
    if (updateError) {
      Alert.alert('Save failed', updateError.message);
      return;
    }
    await loadProfile();
    Alert.alert('Profile saved', 'Your Noir profile has been updated.');
  }

  async function logout() {
    await signOut();
    router.replace('/auth/login');
  }

  if (loading) return <StateView loading title="Loading profile" />;
  if (error) return <StateView title="Could not load profile" message={error} actionLabel="Retry" onAction={loadProfile} />;

  const memberName = displayName.trim() || 'Noir Member';
  const accountEmail = profile?.email ?? user?.email ?? '';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <ChevronLeft color={colors.gold} size={26} />
        </Pressable>
        <Text style={styles.logo}>NOIR</Text>
        <View style={styles.miniAvatar}>
          {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.miniAvatarImage} /> : <UserRound color={colors.gold} size={18} />}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarFrame}>
          {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarImage} /> : <UserRound color={colors.gold} size={48} />}
        </View>

        <Text style={styles.memberName}>{memberName}</Text>
        <Text style={styles.level}>CONCIERGE LEVEL</Text>

        <View style={styles.form}>
          <ProfileField
            label="DISPLAY NAME"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Noir Member"
          />
          <ProfileField
            label="ACCOUNT EMAIL"
            value={accountEmail}
            editable={false}
            placeholder="member@noir.com"
          />
          <ProfileField
            label="AVATAR URL"
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="https://images.noir.com/profiles/user.jpg"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.actions}>
          <Pressable onPress={saveProfile} disabled={saving} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, saving && styles.disabled]}>
            {saving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveText}>SAVE PROFILE</Text>}
          </Pressable>
          <Pressable onPress={logout} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
            <Text style={styles.signOutText}>SIGN OUT</Text>
          </Pressable>
        </View>

        <View style={styles.stats}>
          <StatCard icon={<CalendarDays color={colors.gold} size={22} />} label="SCREENINGS" value="42" />
          <StatCard icon={<Tag color={colors.gold} size={22} />} label="NOIR POINTS" value="12.5k" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ProfileFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onChangeText?: (value: string) => void;
};

function ProfileField({ label, value, placeholder, editable = true, autoCapitalize, onChangeText }: ProfileFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#4f4a43"
        editable={editable}
        autoCapitalize={autoCapitalize}
        style={[styles.fieldInput, !editable && styles.disabledInput]}
      />
    </View>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: colors.gold,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0,
    fontFamily: 'serif',
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.borderBright,
    borderWidth: 1,
    backgroundColor: colors.panel,
    overflow: 'hidden',
  },
  miniAvatarImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 86,
    alignItems: 'center',
  },
  avatarFrame: {
    width: 94,
    height: 94,
    borderRadius: 12,
    borderColor: colors.gold,
    borderWidth: 2,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
    shadowColor: colors.gold,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  memberName: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  level: {
    color: '#b9ad98',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 8,
    marginBottom: 20,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  field: {
    gap: 10,
  },
  fieldLabel: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 4,
  },
  fieldInput: {
    minHeight: 42,
    color: colors.text,
    fontSize: 14,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  disabledInput: {
    color: colors.muted,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  saveButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  signOutButton: {
    height: 42,
    borderRadius: 10,
    borderColor: colors.gold,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101010',
  },
  signOutText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.55,
  },
  stats: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 34,
  },
  statCard: {
    flex: 1,
    minHeight: 98,
    borderRadius: 8,
    backgroundColor: colors.panel,
    borderColor: '#24201a',
    borderWidth: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  statLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  statValue: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    fontFamily: 'serif',
  },
});
