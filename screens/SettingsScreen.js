//SettingsScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);
  const [tasks, setTasks] = useState([]);
  const [tasksCreated, setTasksCreated] = useState(0);
  const [tasksDeleted, setTasksDeleted] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        const savedTasks = await AsyncStorage.getItem('tasks');
        const savedTasksCreated = await AsyncStorage.getItem('tasksCreated');
        const savedTasksDeleted = await AsyncStorage.getItem('tasksDeleted');
        if (savedTasks !== null) {
          try {
            const parsedTasks = JSON.parse(savedTasks);
            setTasks(Array.isArray(parsedTasks) ? parsedTasks : []);
          } catch (error) {
            setTasks([]);
          }
        } else {
          setTasks([]);
        }
        if (savedTasksCreated) {
          setTasksCreated(parseInt(savedTasksCreated) || 0);
        }
        if (savedTasksDeleted) {
          setTasksDeleted(parseInt(savedTasksDeleted) || 0);
        }
      };
      loadData();
    }, [])
  );

  // Calcul des statistiques
  const now = new Date();
  
  const activeTasks = tasks.filter(task => {
    if (task.done) return false;
    if (task.deadline) {
      return new Date(task.deadline) > now;
    }
    return true;
  });

  const completedTasks = tasks.filter(task => task.done);
  
  const uncompletedTasks = tasks.filter(task => {
    if (task.done) return false;
    if (task.deadline) {
      return new Date(task.deadline) <= now;
    }
    return false;
  });

  const tasksByTag = {
    perso: tasks.filter(task => task.tag === 'perso').length,
    travail: tasks.filter(task => task.tag === 'travail').length,
    urgent: tasks.filter(task => task.tag === 'urgent').length,
    sansTag: tasks.filter(task => !task.tag || task.tag === null).length,
  };

  const resetStatistics = () => {
    Alert.alert(
      'Réinitialiser les statistiques',
      'Êtes-vous sûr de vouloir réinitialiser les compteurs de statistiques ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            setTasksCreated(0);
            setTasksDeleted(0);
            await AsyncStorage.setItem('tasksCreated', '0');
            await AsyncStorage.setItem('tasksDeleted', '0');
          },
        },
      ]
    );
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      paddingTop: 60,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 30,
    },
    label: {
      color: colors.text,
      fontSize: 18,
      marginBottom: 10,
      fontWeight: 'bold',
    },
    statItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statLabel: {
      color: colors.text,
      fontSize: 15,
    },
    statValue: {
      color: colors.text,
      fontSize: 15,
      fontWeight: 'bold',
    },
    tagStat: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 15,
      marginBottom: 5,
    },
    tagLabel: {
      color: colors.placeholder,
      fontSize: 14,
    },
    tagValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    resetButton: {
      marginTop: 20,
      padding: 15,
      borderRadius: 8,
      backgroundColor: '#f55',
      alignItems: 'center',
    },
    resetText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 60 }}
    >
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}>
        ⚙️ Paramètres
      </Text>

      {/* Mode sombre */}
      <View style={styles.section}>
        <Text style={styles.label}>🌗 Mode</Text>
        <View style={[styles.statItem, { justifyContent: 'flex-start', alignItems: 'center' }]}>
          <Text style={styles.statLabel}>Mode sombre</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ccc', true: '#666' }}
            thumbColor={isDarkMode ? '#fff' : '#000'}
            style={{ marginLeft: 'auto' }}
          />
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.section}>
        <Text style={styles.label}>📊 Statistiques</Text>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tâches créées</Text>
          <Text style={styles.statValue}>{tasksCreated}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tâches supprimées</Text>
          <Text style={styles.statValue}>{tasksDeleted}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tâches actives</Text>
          <Text style={styles.statValue}>{activeTasks.length}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tâches effectuées</Text>
          <Text style={styles.statValue}>{completedTasks.length}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tâches non effectuées</Text>
          <Text style={styles.statValue}>{uncompletedTasks.length}</Text>
        </View>

        <View style={[styles.statItem, { flexDirection: 'column', paddingVertical: 15 }]}>
          <Text style={[styles.statLabel, { marginBottom: 10 }]}>Par tags :</Text>
          <View style={styles.tagStat}>
            <Text style={[styles.tagLabel, { color: '#4A90E2' }]}>Perso</Text>
            <Text style={[styles.tagValue, { color: '#4A90E2' }]}>{tasksByTag.perso}</Text>
          </View>
          <View style={styles.tagStat}>
            <Text style={[styles.tagLabel, { color: '#4CAF50' }]}>Travail</Text>
            <Text style={[styles.tagValue, { color: '#4CAF50' }]}>{tasksByTag.travail}</Text>
          </View>
          <View style={styles.tagStat}>
            <Text style={[styles.tagLabel, { color: '#F44336' }]}>Urgent</Text>
            <Text style={[styles.tagValue, { color: '#F44336' }]}>{tasksByTag.urgent}</Text>
          </View>
          <View style={styles.tagStat}>
            <Text style={styles.tagLabel}>Sans tag</Text>
            <Text style={styles.tagValue}>{tasksByTag.sansTag}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetStatistics}>
          <Text style={styles.resetText}>Réinitialiser les statistiques</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    
    {/* Texte développeur en bas à droite */}
    <Text style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      color: colors.placeholder,
      fontSize: 12,
      fontStyle: 'italic',
    }}>
      developed by HelloDevOps
    </Text>
    </View>
  );
}