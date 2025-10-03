import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const settingsSections = [
    {
      title: 'General',
      items: [
        {
          title: 'Notificaciones',
          type: 'switch',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
          icon: 'notifications-outline',
          color: '#4CAF50',
        },
        {
          title: 'Modo Oscuro',
          type: 'switch',
          value: darkModeEnabled,
          onValueChange: setDarkModeEnabled,
          icon: 'moon-outline',
          color: '#9C27B0',
        },
        {
          title: 'Ubicación',
          type: 'switch',
          value: locationEnabled,
          onValueChange: setLocationEnabled,
          icon: 'location-outline',
          color: '#FF9800',
        },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        {
          title: 'Cambiar Contraseña',
          type: 'navigate',
          icon: 'lock-closed-outline',
          color: '#607D8B',
        },
        {
          title: 'Configuración de Privacidad',
          type: 'navigate',
          icon: 'shield-outline',
          color: '#9C27B0',
        },
        {
          title: 'Eliminar Cuenta',
          type: 'navigate',
          icon: 'trash-outline',
          color: '#F44336',
        },
      ],
    },
    {
      title: 'Soporte',
      items: [
        {
          title: 'Ayuda',
          type: 'navigate',
          icon: 'help-circle-outline',
          color: '#2196F3',
        },
        {
          title: 'Contactar Soporte',
          type: 'navigate',
          icon: 'mail-outline',
          color: '#4CAF50',
        },
        {
          title: 'Acerca de',
          type: 'navigate',
          icon: 'information-circle-outline',
          color: '#607D8B',
        },
      ],
    },
  ];

  const renderSettingItem = (item, index) => {
    return (
      <TouchableOpacity
        key={index}
        style={[styles.settingItem, { borderLeftColor: item.color }]}
        onPress={() => {
          if (item.type === 'navigate') {
            // Handle navigation
            console.log(`Navigate to ${item.title}`);
          }
        }}
      >
        <View style={styles.settingContent}>
          <Ionicons
            name={item.icon}
            size={24}
            color={item.color}
            style={styles.settingIcon}
          />
          <Text style={styles.settingText}>{item.title}</Text>
          {item.type === 'switch' ? (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={item.value ? '#2196F3' : '#f4f3f4'}
            />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#666"
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) =>
                renderSettingItem(item, itemIndex)
              )}
            </View>
          </View>
        ))}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  settingItem: {
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});
