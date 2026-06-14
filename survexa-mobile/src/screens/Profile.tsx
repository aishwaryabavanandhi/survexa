import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { useAuthStore } from '../store/authStore';
import { useBillingStore } from '../store/billingStore';
import { brandColors } from '../theme/colors';

export default function Profile({ navigation }: any) {
  const { user, clearSession } = useAuthStore();
  const { currentPlan } = useBillingStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Survexa?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          clearSession();
        },
      },
    ]);
  };

  const handleUpgrade = () => {
    // Navigate to a payment screen or handle integration
    Alert.alert('Upgrade Plan', 'Ready to unlock premium analytics & PDF reports?', [
      { text: 'Later', style: 'cancel' },
      {
        text: 'Upgrade to Pro',
        onPress: () => {
          // Mock successful upgrade
          useBillingStore.getState().setPlan('pro', 'SUB-PRO-NEW');
          Alert.alert('Success', 'You are now a PRO member!');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Profile</Text>
      </View>

      <GlassCard style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'AM'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Alex Morgan'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'alex.morgan@survexa.io'}</Text>
        
        <View style={[styles.planBadge, { backgroundColor: currentPlan === 'free' ? brandColors.peach : brandColors.mint }]}>
          <Text style={styles.planBadgeText}>
            {currentPlan.toUpperCase()} MEMBER
          </Text>
        </View>
      </GlassCard>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>32</Text>
          <Text style={styles.statLbl}>Surveys</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>4.8k</Text>
          <Text style={styles.statLbl}>Responses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>94%</Text>
          <Text style={styles.statLbl}>Completion</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Account Actions</Text>

      <TouchableOpacity style={styles.menuItem} onPress={handleUpgrade}>
        <View style={styles.menuIconContainer}>
          <Text style={styles.menuIcon}>⭐</Text>
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Manage Subscription</Text>
          <Text style={styles.menuSub}>Current plan: {currentPlan.toUpperCase()}</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
        <View style={styles.menuIconContainer}>
          <Text style={styles.menuIcon}>⚙️</Text>
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Application Settings</Text>
          <Text style={styles.menuSub}>Themes, Notifications, Storage</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      {user?.role === 'admin' && (
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🔑</Text>
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Admin Dashboard</Text>
            <Text style={styles.menuSub}>System stats, Payment metrics</Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>
      )}

      <CustomButton
        title="Log Out"
        onPress={handleLogout}
        variant="secondary"
        style={styles.logoutBtn}
        textStyle={{ color: '#EF4444' }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D6C6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  planBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  statLbl: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    color: '#94A3B8',
  },
  logoutBtn: {
    marginTop: 30,
    borderColor: '#FCA5A5',
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
});
