// CalendarScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';

export default function CalendarScreen() {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('mensuel'); // 'mensuel', 'hebdomadaire', 'quotidien'
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [tasks, setTasks] = useState([]);
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const dayNamesFull = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  
  useFocusEffect(
    React.useCallback(() => {
      const loadTasks = async () => {
        const savedTasks = await AsyncStorage.getItem('tasks');
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
      };
      loadTasks();
    }, [])
  );
  
  // Calcul du début de la semaine (lundi)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour que lundi = 1
    return new Date(d.setDate(diff));
  };
  
  // Obtenir les jours de la semaine
  const getWeekDays = () => {
    const weekStart = getWeekStart(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };
  
  const changePeriod = (direction) => {
    const newDate = new Date(currentDate);
    if (viewType === 'mensuel') {
      newDate.setMonth(currentMonth + direction);
    } else if (viewType === 'hebdomadaire') {
      newDate.setDate(currentDay + (direction * 7));
    } else if (viewType === 'quotidien') {
      newDate.setDate(currentDay + direction);
    }
    setCurrentDate(newDate);
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  const getTasksForDate = (date) => {
    const dateStr = formatDate(date);
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDateStr = formatDate(new Date(task.deadline));
      return taskDateStr === dateStr;
    });
  };
  
  const renderMonthlyCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // Ajuster pour commencer la semaine au lundi (0 = lundi, 6 = dimanche)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const days = [];
    
    // Jours vides avant le premier jour du mois
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={{
          width: '13.28%',
          aspectRatio: 1,
          marginHorizontal: 0.5,
          marginBottom: 8,
        }} />
      );
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && 
                      currentMonth === new Date().getMonth() && 
                      currentYear === new Date().getFullYear();
      
      // Obtenir les tâches pour ce jour
      const dayDate = new Date(currentYear, currentMonth, day);
      const dayTasks = getTasksForDate(dayDate);
      
      // Trouver le tag prioritaire (urgent > travail > perso)
      let borderColor = colors.border;
      let borderWidth = 1;
      const tasksWithTag = dayTasks.filter(task => task.tag);
      if (tasksWithTag.length > 0) {
        // Priorité : urgent > travail > perso
        const hasUrgent = tasksWithTag.some(task => task.tag === 'urgent');
        const hasTravail = tasksWithTag.some(task => task.tag === 'travail');
        const hasPerso = tasksWithTag.some(task => task.tag === 'perso');
        
        if (hasUrgent) {
          borderColor = '#F44336'; // Rouge
          borderWidth = 2;
        } else if (hasTravail) {
          borderColor = '#4CAF50'; // Vert
          borderWidth = 2;
        } else if (hasPerso) {
          borderColor = '#4A90E2'; // Bleu
          borderWidth = 2;
        }
      }
      
      days.push(
        <TouchableOpacity
          key={day}
          style={{
            width: '13.28%',
            aspectRatio: 1,
            marginHorizontal: 0.5,
            marginBottom: 8,
            backgroundColor: isToday ? colors.text : 'transparent',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: borderWidth,
            borderColor: borderColor,
          }}
        >
          <Text style={{
            color: isToday ? colors.background : colors.text,
            fontSize: 14,
            fontWeight: isToday ? 'bold' : 'normal',
          }}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };
  
  const renderWeeklyCalendar = () => {
    const weekDays = getWeekDays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return weekDays.map((day, index) => {
      const isToday = day.getTime() === today.getTime();
      const dayTasks = getTasksForDate(day);
      
      return (
        <View key={index} style={{
          width: '100%',
          marginBottom: 10,
          backgroundColor: colors.card,
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: isToday ? colors.text : colors.border,
        }}>
          <Text style={{
            color: isToday ? colors.text : colors.placeholder,
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 4,
          }}>
            {dayNames[index]} {day.getDate()}
          </Text>
          {dayTasks.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {dayTasks.map((task, idx) => (
                <View key={idx} style={{
                  backgroundColor: colors.input,
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 6,
                }}>
                  <Text style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: 'bold',
                    marginBottom: 2,
                  }}>
                    {task.title}
                  </Text>
                  {task.details && (
                    <Text style={{
                      color: colors.placeholder,
                      fontSize: 12,
                    }} numberOfLines={2}>
                      {task.details}
                    </Text>
                  )}
                  {task.deadline && (
                    <Text style={{
                      color: colors.placeholder,
                      fontSize: 10,
                      marginTop: 4,
                    }}>
                      {new Date(task.deadline).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      );
    });
  };
  
  const renderDailyCalendar = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    
    const dayTasks = getTasksForDate(currentDate);
    const tasksByHour = {};
    
    dayTasks.forEach(task => {
      if (task.deadline) {
        const taskDate = new Date(task.deadline);
        const hour = taskDate.getHours();
        if (!tasksByHour[hour]) {
          tasksByHour[hour] = [];
        }
        tasksByHour[hour].push(task);
      }
    });
    
    return hours.map((hour) => {
      const hourTasks = tasksByHour[hour] || [];
      const isCurrentHour = new Date().getDate() === currentDay &&
                            new Date().getMonth() === currentMonth &&
                            new Date().getFullYear() === currentYear &&
                            new Date().getHours() === hour;
      
      return (
        <View key={hour} style={{
          flexDirection: 'row',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <View style={{
            width: 60,
            alignItems: 'flex-end',
            paddingRight: 10,
          }}>
            <Text style={{
              color: isCurrentHour ? colors.text : colors.placeholder,
              fontSize: 14,
              fontWeight: isCurrentHour ? 'bold' : 'normal',
            }}>
              {hour.toString().padStart(2, '0')}:00
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            {hourTasks.map((task, idx) => (
              <View key={idx} style={{
                backgroundColor: colors.input,
                borderRadius: 6,
                padding: 8,
                marginBottom: 4,
                borderLeftWidth: 3,
                borderLeftColor: task.tag === 'urgent' ? '#F44336' : 
                                task.tag === 'travail' ? '#4CAF50' : 
                                task.tag === 'perso' ? '#4A90E2' : colors.border,
              }}>
                <Text style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: 'bold',
                  marginBottom: 2,
                }}>
                  {task.title}
                </Text>
                {task.details && (
                  <Text style={{
                    color: colors.placeholder,
                    fontSize: 12,
                  }} numberOfLines={2}>
                    {task.details}
                  </Text>
                )}
                <Text style={{
                  color: colors.placeholder,
                  fontSize: 10,
                  marginTop: 4,
                }}>
                  {new Date(task.deadline).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    });
  };
  
  const getPeriodTitle = () => {
    if (viewType === 'mensuel') {
      return `${monthNames[currentMonth]} ${currentYear}`;
    } else if (viewType === 'hebdomadaire') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `Semaine du ${weekStart.getDate()}/${weekStart.getMonth() + 1} au ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
    } else if (viewType === 'quotidien') {
      return `${dayNamesFull[currentDate.getDay()]} ${currentDate.getDate()} ${monthNames[currentMonth]} ${currentYear}`;
    }
    return '';
  };
  
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      paddingTop: 60,
    },
    header: {
      color: colors.text,
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 30,
      textAlign: 'center',
    },
    periodHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    periodText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
    },
    calendarContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      marginHorizontal: -0.5,
    },
    dayName: {
      width: '13.28%',
      aspectRatio: 1,
      margin: 0.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayNameText: {
      color: colors.placeholder,
      fontSize: 12,
      fontWeight: 'bold',
    },
  };
  
  const isToday = currentDate.getDate() === new Date().getDate() &&
                  currentMonth === new Date().getMonth() &&
                  currentYear === new Date().getFullYear();
  
  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Top bar avec menu burger */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.header}>📅 Calendrier</Text>
        
        {/* Menu déroulant de type d'affichage */}
        <View style={{ marginBottom: 20, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setShowViewMenu(!showViewMenu)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 15,
              backgroundColor: colors.input,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              width: '70%',
              minWidth: 200,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 15 }}>
              {viewType === 'mensuel' ? '📅 Mensuel' : viewType === 'hebdomadaire' ? '📆 Hebdomadaire' : '📋 Quotidien'}
            </Text>
            <Ionicons 
              name={showViewMenu ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.text} 
            />
          </TouchableOpacity>
          
          {showViewMenu && (
            <View style={{
              marginTop: 5,
              backgroundColor: colors.card,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
              width: '70%',
              minWidth: 200,
            }}>
              <TouchableOpacity
                onPress={() => {
                  setViewType('mensuel');
                  setShowViewMenu(false);
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ color: viewType === 'mensuel' ? '#4A90E2' : colors.text, fontSize: 14, fontWeight: viewType === 'mensuel' ? 'bold' : 'normal', textAlign: 'center' }}>
                  📅 Mensuel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setViewType('hebdomadaire');
                  setShowViewMenu(false);
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ color: viewType === 'hebdomadaire' ? '#4CAF50' : colors.text, fontSize: 14, fontWeight: viewType === 'hebdomadaire' ? 'bold' : 'normal', textAlign: 'center' }}>
                  📆 Hebdomadaire
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setViewType('quotidien');
                  setShowViewMenu(false);
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                }}
              >
                <Text style={{ color: viewType === 'quotidien' ? '#FF9800' : colors.text, fontSize: 14, fontWeight: viewType === 'quotidien' ? 'bold' : 'normal', textAlign: 'center' }}>
                  📋 Quotidien
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      
        <View style={styles.periodHeader}>
          <TouchableOpacity onPress={() => changePeriod(-1)}>
            <Text style={{ color: colors.text, fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.periodText}>
            {getPeriodTitle()}
          </Text>
          <TouchableOpacity onPress={() => changePeriod(1)}>
            <Text style={{ color: colors.text, fontSize: 24 }}>›</Text>
          </TouchableOpacity>
        </View>
        
        {viewType === 'mensuel' && (
          <>
            <View style={styles.calendarContainer}>
              {dayNames.map((day, index) => (
                <View key={index} style={styles.dayName}>
                  <Text style={styles.dayNameText}>{day}</Text>
                </View>
              ))}
            </View>
            <View style={styles.calendarContainer}>
              {renderMonthlyCalendar()}
            </View>
          </>
        )}
        
        {viewType === 'hebdomadaire' && (
          <View style={{ marginTop: 10 }}>
            {renderWeeklyCalendar()}
          </View>
        )}
        
        {viewType === 'quotidien' && (
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 8,
            padding: 10,
            marginTop: 10,
          }}>
            {renderDailyCalendar()}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
