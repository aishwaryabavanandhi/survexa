import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

// Import screens
import Splash from '../screens/Splash';
import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import OTP from '../screens/OTP';
import ForgotPassword from '../screens/ForgotPassword';
import TabNavigator from './TabNavigator';
import Notifications from '../screens/Notifications';
import Settings from '../screens/Settings';
import DarkModeSettings from '../screens/DarkModeSettings';
import AdminDashboard from '../screens/AdminDashboard';
import CreateSurvey from '../screens/CreateSurvey';
import AIGenerator from '../screens/AIGenerator';
import SurveyBuilder from '../screens/SurveyBuilder';
import SurveyPreview from '../screens/SurveyPreview';
import SurveySharing from '../screens/SurveySharing';
import QRCode from '../screens/QRCode';
import ResponseCollection from '../screens/ResponseCollection';
import BarChart from '../screens/BarChart';
import PieChart from '../screens/PieChart';
import LineChart from '../screens/LineChart';
import AIInsights from '../screens/AIInsights';
import Recommendations from '../screens/Recommendations';
import PDFPreview from '../screens/PDFPreview';
import ReportDownload from '../screens/ReportDownload';
import ReportEmail from '../screens/ReportEmail';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth flow
        <>
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="OTP" component={OTP} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </>
      ) : (
        // Authenticated flow
        <>
          <Stack.Screen name="Home" component={TabNavigator} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="DarkModeSettings" component={DarkModeSettings} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="CreateSurvey" component={CreateSurvey} />
          <Stack.Screen name="AIGenerator" component={AIGenerator} />
          <Stack.Screen name="SurveyBuilder" component={SurveyBuilder} />
          <Stack.Screen name="SurveyPreview" component={SurveyPreview} />
          <Stack.Screen name="SurveySharing" component={SurveySharing} />
          <Stack.Screen name="QRCode" component={QRCode} />
          <Stack.Screen name="ResponseCollection" component={ResponseCollection} />
          <Stack.Screen name="BarChart" component={BarChart} />
          <Stack.Screen name="PieChart" component={PieChart} />
          <Stack.Screen name="LineChart" component={LineChart} />
          <Stack.Screen name="AIInsights" component={AIInsights} />
          <Stack.Screen name="Recommendations" component={Recommendations} />
          <Stack.Screen name="PDFPreview" component={PDFPreview} />
          <Stack.Screen name="ReportDownload" component={ReportDownload} />
          <Stack.Screen name="ReportEmail" component={ReportEmail} />
        </>
      )}
    </Stack.Navigator>
  );
}
