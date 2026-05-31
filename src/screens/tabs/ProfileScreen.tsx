import { router } from 'expo-router';
import {
  CalendarDays,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Globe2,
  LogOut,
  ShieldCheck,
  Tag,
  UserRound,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StateView } from '../../ui/StateView';
import { useAuth } from '../../core/auth/useAuth';
import { supabase } from '../../api/supabase';
import { colors } from '../../core/theme';
import { UserProfile } from '../../types/database';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'EN' | 'TH'>('EN');

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
        <Text style={styles.logo}>Account</Text>
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

        <View style={styles.stats}>
          <StatCard icon={<CalendarDays color={colors.gold} size={22} />} label="SCREENINGS" value="42" />
          <StatCard icon={<Tag color={colors.gold} size={22} />} label="NOIR POINTS" value="12.5k" />
        </View>

        <Text style={styles.sectionTitle}>Personal information</Text>
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

        <Text style={styles.sectionTitle}>Membership</Text>
        <Pressable
          onPress={() => Alert.alert('Noir Concierge', 'Your membership includes priority booking and private-screening benefits.')}
          style={styles.membershipCard}
        >
          <View style={styles.membershipIcon}>
            <ShieldCheck color={colors.gold} size={27} />
          </View>
          <View style={styles.membershipBody}>
            <Text style={styles.membershipName}>NOIR CONCIERGE</Text>
            <Text style={styles.membershipCopy}>Priority booking and private-screening benefits</Text>
          </View>
          <ChevronRight color={colors.muted} size={20} />
        </Pressable>

        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.menu}>
          <MenuRow
            icon={<CreditCard color={colors.gold} size={19} />}
            label="Saved payment methods"
            onPress={() => Alert.alert('Payment methods', 'No saved payment methods yet.')}
          />
          <MenuRow
            icon={<Globe2 color={colors.gold} size={19} />}
            label="Language"
            detail={language}
            onPress={() => setLanguage((current) => current === 'EN' ? 'TH' : 'EN')}
          />
          <MenuRow
            icon={<CircleHelp color={colors.gold} size={19} />}
            label="Help and concierge"
            onPress={() => Linking.openURL('mailto:concierge@noir.example?subject=Noir%20support')}
          />
        </View>

        <View style={styles.actions}>
          <Pressable onPress={saveProfile} disabled={saving} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, saving && styles.disabled]}>
            {saving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveText}>SAVE PROFILE</Text>}
          </Pressable>
          <Pressable onPress={logout} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
            <LogOut color={colors.red} size={17} />
            <Text style={styles.signOutText}>SIGN OUT</Text>
          </Pressable>
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

function MenuRow({ icon, label, detail, onPress }: { icon: React.ReactNode; label: string; detail?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
      {detail ? <Text style={styles.menuDetail}>{detail}</Text> : null}
      <ChevronRight color={colors.muted} size={19} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logo: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
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
    paddingTop: 22,
    paddingBottom: 110,
    alignItems: 'center',
  },
  avatarFrame: {
    width: 94,
    height: 94,
    borderRadius: 47,
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
    marginBottom: 16,
  },
  sectionTitle: {
    width: '100%',
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 28,
    marginBottom: 14,
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
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.panel,
  },
  signOutText: {
    color: colors.red,
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
    marginTop: 6,
  },
  statCard: {
    flex: 1,
    minHeight: 98,
    borderRadius: 14,
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
  membershipCard: {
    width: '100%',
    minHeight: 96,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
  },
  membershipIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelSoft,
  },
  membershipBody: { flex: 1, gap: 6 },
  membershipName: { color: colors.gold, fontSize: 14, fontWeight: '900', letterSpacing: 1.3 },
  membershipCopy: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  menu: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.panel,
  },
  menuRow: {
    minHeight: 62,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  menuIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.panelSoft },
  menuLabel: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700' },
  menuDetail: { color: colors.gold, fontWeight: '900' },
});
