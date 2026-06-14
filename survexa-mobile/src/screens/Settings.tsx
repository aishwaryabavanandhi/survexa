import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, TextInput } from 'react-native';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { useSurveyStore } from '../store/surveyStore';
import { useAuthStore } from '../store/authStore';

export default function Settings({ navigation }: any) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [apiUrl, setApiUrl] = useState('http://10.0.2.2:5000');
  const setSurveys = useSurveyStore((state) => state.setSurveys);
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Survey Cache',
      'This will delete all locally cached draft surveys. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setSurveys([]);
            Alert.alert('Success', 'Survey cache cleared successfully!');
          },
        },
      ]
    );
  };

  const handleSaveApiUrl = () => {
    Alert.alert('API Config', `Backend target updated to: ${apiUrl}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.sectionTitle}>Appearance & Audio</Text>
      
      <TouchableOpacity 
        style={styles.settingItem} 
        onPress={() => navigation.navigate('DarkModeSettings')}
      >
        <View style={styles.row}>
          <Text style={styles.icon}>🌓</Text>
          <View>
            <Text style={styles.settingLabel}>App Theme</Text>
            <Text style={styles.settingDesc}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.settingItem}>
        <View style={styles.row}>
          <Text style={styles.icon}>🔔</Text>
          <View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDesc}>Collect responses alerts</Text>
          </View>
        </View>
        <Switch 
          value={pushEnabled} 
          onValueChange={setPushEnabled}
          trackColor={{ false: '#CBD5E1', true: '#C8D4FF' }}
          thumbColor={pushEnabled ? '#8B5CF6' : '#F1F5F9'}
        />
      </View>

      <Text style={styles.sectionTitle}>Developer Settings</Text>
      <GlassCard style={styles.apiCard}>
        <Text style={styles.apiLabel}>Backend API Endpoint</Text>
        <Text style={styles.apiDesc}>Default is loopback to local machine backend on port 5000</Text>
        
        <TextInput
          style={styles.textInput}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://10.0.2.2:5000"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <CustomButton
          title="Save API Endpoint"
          onPress={handleSaveApiUrl}
          variant="soft"
          style={styles.saveBtn}
          textStyle={{ color: '#8B5CF6', fontSize: 13 }}
        />
      </GlassCard>

      <Text style={styles.sectionTitle}>Storage & Maintenance</Text>
      <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
        <View style={styles.row}>
          <Text style={styles.icon}>🗑️</Text>
          <View>
            <Text style={styles.settingLabel}>Clear Draft Surveys</Text>
            <Text style={styles.settingDesc}>Erase locally cached template drafts</Text>
          </View>
        </View>
        <Text style={styles.trashChevron}>Clear</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Survexa Mobile v1.0.0</Text>
        <Text style={styles.copyrightText}>© 2026 Survexa AI Platform</Text>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    color: '#94A3B8',
  },
  trashChevron: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  apiCard: {
    marginVertical: 4,
    padding: 16,
    alignItems: 'stretch',
  },
  apiLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  apiDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
    lineHeight: 16,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  saveBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 0,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
});
