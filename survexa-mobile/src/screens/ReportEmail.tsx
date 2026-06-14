import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import Input from '../components/Input';
import CustomButton from '../components/CustomButton';

export default function ReportEmail({ navigation }: any) {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('Survexa NPS Report — Q2 2026');
  const [message, setMessage] = useState('Please find attached the latest survey analytics report.');
  const [attachPdf, setAttachPdf] = useState(true);

  const handleSend = () => {
    if (!recipients) {
      Alert.alert('Error', 'Please enter at least one recipient email address');
      return;
    }

    Alert.alert('Email Sent', `Report successfully emailed to ${recipients}.`, [
      { text: 'OK', onPress: () => navigation.popToTop() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Email report</Text>

      <Input
        label="Recipients"
        placeholder="team@company.com, ceo@company.com"
        value={recipients}
        onChangeText={setRecipients}
      />

      <Input
        label="Subject"
        placeholder="Subject line"
        value={subject}
        onChangeText={setSubject}
      />

      <Input
        label="Message"
        placeholder="Enter email message body"
        value={message}
        onChangeText={setMessage}
        style={{ minHeight: 80 }}
      />

      <View style={styles.toggleCard}>
        <Text style={styles.toggleText}>Attach PDF report</Text>
        <Switch
          value={attachPdf}
          onValueChange={setAttachPdf}
          trackColor={{ false: '#767577', true: '#8B5CF6' }}
          thumbColor={attachPdf ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>

      <CustomButton
        title="Send report"
        onPress={handleSend}
        variant="primary"
        style={styles.btn}
      />
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
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    marginVertical: 14,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  btn: {
    marginTop: 20,
    width: '100%',
  },
});
