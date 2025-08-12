import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppSettings {
  units: 'metric' | 'imperial';
  notifications: boolean;
  darkMode: boolean;
  autoOptimize: boolean;
  defaultDuration: number;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    units: 'metric',
    notifications: true,
    darkMode: true,
    autoOptimize: true,
    defaultDuration: 30,
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
  });

  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    loadSettings();
    loadUserProfile();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('user_profile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const saveUserProfile = async () => {
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
      setEditingProfile(false);
      Alert.alert('Saved', 'Your profile has been updated successfully.');
    } catch (error) {
      console.error('Failed to save user profile:', error);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will clear all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'milestones',
                'route_history',
                'app_settings',
                'user_profile',
                'saved_locations',
              ]);
              Alert.alert('Logged Out', 'All data has been cleared.');
              // Reset states
              setSettings({
                units: 'metric',
                notifications: true,
                darkMode: true,
                autoOptimize: true,
                defaultDuration: 30,
              });
              setUserProfile({ name: '', email: '', phone: '' });
            } catch (error) {
              console.error('Failed to logout:', error);
              Alert.alert('Error', 'Failed to logout.');
            }
          },
        },
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your milestones, history, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'milestones',
                'route_history',
                'saved_locations',
              ]);
              Alert.alert('Cleared', 'All route data has been cleared.');
            } catch (error) {
              console.error('Failed to clear data:', error);
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const openLocationIQInfo = () => {
    Linking.openURL('https://locationiq.com/');
  };

  const SettingItem = ({ 
    title, 
    description, 
    children 
  }: { 
    title: string; 
    description?: string; 
    children: React.ReactNode; 
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <View style={styles.settingControl}>
        {children}
      </View>
    </View>
  );

  const DurationButton = ({ duration }: { duration: number }) => (
    <TouchableOpacity
      style={[
        styles.durationButton,
        settings.defaultDuration === duration && styles.durationButtonActive,
      ]}
      onPress={() => updateSetting('defaultDuration', duration)}
    >
      <Text
        style={[
          styles.durationButtonText,
          settings.defaultDuration === duration && styles.durationButtonTextActive,
        ]}
      >
        {duration}m
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Profile</Text>
          
          {editingProfile ? (
            <View style={styles.profileEditForm}>
              <TextInput
                style={styles.profileInput}
                placeholder="Full Name"
                placeholderTextColor="#8E8E93"
                value={userProfile.name}
                onChangeText={(text) => setUserProfile({...userProfile, name: text})}
              />
              <TextInput
                style={styles.profileInput}
                placeholder="Email Address"
                placeholderTextColor="#8E8E93"
                value={userProfile.email}
                onChangeText={(text) => setUserProfile({...userProfile, email: text})}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.profileInput}
                placeholder="Phone Number"
                placeholderTextColor="#8E8E93"
                value={userProfile.phone}
                onChangeText={(text) => setUserProfile({...userProfile, phone: text})}
                keyboardType="phone-pad"
              />
              <View style={styles.profileActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingProfile(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveUserProfile}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileDisplay}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.name || 'Add your name'}</Text>
                <Text style={styles.profileEmail}>{userProfile.email || 'Add your email'}</Text>
                <Text style={styles.profilePhone}>{userProfile.phone || 'Add your phone'}</Text>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditingProfile(true)}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <SettingItem
            title="Units"
            description="Distance and speed units"
          >
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  settings.units === 'metric' && styles.segmentButtonActive,
                ]}
                onPress={() => updateSetting('units', 'metric')}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    settings.units === 'metric' && styles.segmentButtonTextActive,
                  ]}
                >
                  Metric
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  settings.units === 'imperial' && styles.segmentButtonActive,
                ]}
                onPress={() => updateSetting('units', 'imperial')}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    settings.units === 'imperial' && styles.segmentButtonTextActive,
                  ]}
                >
                  Imperial
                </Text>
              </TouchableOpacity>
            </View>
          </SettingItem>

          <SettingItem
            title="Default Duration"
            description="Default time to spend at each location"
          >
            <View style={styles.durationContainer}>
              {[15, 30, 60, 120].map((duration) => (
                <DurationButton key={duration} duration={duration} />
              ))}
            </View>
          </SettingItem>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Planning</Text>
          
          <SettingItem
            title="Auto-optimize Routes"
            description="Automatically optimize route order for shortest distance"
          >
            <Switch
              value={settings.autoOptimize}
              onValueChange={(value) => updateSetting('autoOptimize', value)}
              trackColor={{ false: '#3e3e3e', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </SettingItem>

          <SettingItem
            title="Notifications"
            description="Get notified about route updates and milestones"
          >
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
              trackColor={{ false: '#3e3e3e', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </SettingItem>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.infoItem} onPress={openLocationIQInfo}>
            <View>
              <Text style={styles.infoTitle}>Powered by LocationIQ</Text>
              <Text style={styles.infoDescription}>
                Real-time location search and mapping services
              </Text>
            </View>
            <Text style={styles.linkIcon}>🔗</Text>
          </TouchableOpacity>

          <View style={styles.infoItem}>
            <View>
              <Text style={styles.infoTitle}>Micro Adventure Route Planner</Text>
              <Text style={styles.infoDescription}>
                Plan your perfect micro-adventures with real-time route optimization
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Text style={styles.dangerButtonText}>Clear Route Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.dangerButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.dangerButtonText}>Logout & Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version 1.0.0 • Built with React Native & Expo
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  profileDisplay: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  profileInfo: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#8E8E93',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  profileEditForm: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  profileInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingControl: {
    alignItems: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 2,
  },
  segmentButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#007AFF',
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  segmentButtonTextActive: {
    color: '#ffffff',
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  durationButtonActive: {
    backgroundColor: '#007AFF',
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  durationButtonTextActive: {
    color: '#ffffff',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  linkIcon: {
    fontSize: 18,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#FF6B35',
  },
  dangerButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
