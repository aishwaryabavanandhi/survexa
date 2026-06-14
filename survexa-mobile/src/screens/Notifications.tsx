import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Notifications() {
  const notifications = [
    { title: 'New response batch', body: '47 new responses on Customer NPS', unread: true },
    { title: 'AI insight ready', body: 'Weekly recommendations are now available', unread: true },
    { title: 'Report generated', body: 'PDF executive summary completed successfully', unread: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Notifications</Text>

      {notifications.map((notif, idx) => (
        <View
          key={idx}
          style={[
            styles.card,
            notif.unread && styles.unreadCard,
          ]}
        >
          <View style={styles.left}>
            <View style={[styles.iconBox, notif.unread && styles.unreadIconBox]}>
              <Text style={styles.bell}>🔔</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{notif.title}</Text>
              <Text style={styles.body}>{notif.body}</Text>
            </View>
          </View>
          {notif.unread && <View style={styles.dot} />}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    marginVertical: 6,
  },
  unreadCard: {
    borderColor: '#D6C6FF',
    backgroundColor: 'rgba(214, 198, 255, 0.08)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unreadIconBox: {
    backgroundColor: 'rgba(214, 198, 255, 0.25)',
  },
  bell: {
    fontSize: 15,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  body: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
});
