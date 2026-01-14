// HomeScreen.js
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Animated,
  Platform,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { ThemeContext } from '../ThemeContext';

import DateTimePicker from '@react-native-community/datetimepicker';

export default function HomeScreen() {

  /* =======================
     CONTEXT & STATE
  ======================= */

  const { colors } = useContext(ThemeContext);

  const [taskEditing, setTaskEditing] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [tasks, setTasks] = useState([]);

  const navigation = useNavigation();
  const checkAnimations = useRef({}).current;

  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortType, setSortType] = useState('creation'); // 'deadline', 'tag', 'creation', 'alphabetical'
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /* =======================
     STYLES
  ======================= */

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
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.input,
      color: colors.text,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
    },
    button: {
      backgroundColor: colors.text,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonText: {
      color: colors.background,
      fontWeight: 'bold',
      fontSize: 16,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: 12,
    },
    checkboxChecked: {
      backgroundColor: colors.text,
    },
    taskTextContainer: {
      flex: 1,
    },
    taskTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    taskDetails: {
      color: colors.placeholder,
      fontSize: 14,
    },
    taskTitleDone: {
      textDecorationLine: 'line-through',
      color: colors.doneText,
    },
    deleteText: {
      fontSize: 18,
      color: '#f55',
      marginLeft: 10,
    },
    topBar: {
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1,
    },
    checkmark: {
      color: 'green',
      fontSize: 22,
      position: 'absolute',
      top: -5,
      left: -1,
    },
  };

  /* =======================
     EFFECTS
  ======================= */

  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };

    loadTasks();
  }, []);

  /* =======================
     HANDLERS
  ======================= */

  const showDeadlinePicker = () => {
    const currentDate = selectedDeadline ? new Date(selectedDeadline) : new Date();
    setTempSelectedDate(currentDate);
    setShowDatePicker(true);
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    
    if (event.type === 'set' && date) {
      setTempSelectedDate(date);
      if (Platform.OS === 'android') {
        // Sur Android, ouvrir le time picker après la sélection de la date
        setTimeout(() => {
          setShowTimePicker(true);
        }, 300);
      } else {
        // Sur iOS
        setSelectedDeadline(date);
      }
    }
  };

  const onTimeChange = (event, time) => {
    setShowTimePicker(false);
    
    if (event.type === 'set' && time) {
      const finalDate = new Date(tempSelectedDate);
      finalDate.setHours(time.getHours());
      finalDate.setMinutes(time.getMinutes());
      setSelectedDeadline(finalDate);
    }
  };

  const handleAddTask = async () => {
    if (title.trim() === '') {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour la tâche.');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      details,
      done: false,
      deadline: selectedDeadline,
      tag: selectedTag,
    };

    setTasks([...tasks, newTask]);
    
    // Incrémenter le compteur de tâches créées
    try {
      const currentCount = await AsyncStorage.getItem('tasksCreated');
      const newCount = (parseInt(currentCount) || 0) + 1;
      await AsyncStorage.setItem('tasksCreated', newCount.toString());
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compteur:', error);
    }
    
    setTitle('');
    setDetails('');
    setSelectedDeadline(null);
    setSelectedTag(null);
  };

  const handleUpdateTask = () => {
    if (!title.trim()) return;

    const updated = tasks.map(task =>
      task.id === taskEditing
        ? { ...task, title, details, deadline: selectedDeadline, tag: selectedTag }
        : task
    );

    setTasks(updated);
    setTitle('');
    setDetails('');
    setSelectedDeadline(null);
    setSelectedTag(null);
    setTaskEditing(null);
  };

  const deleteTask = (id) => {
    const taskToDelete = tasks.find(task => task.id === id);
    const taskTitle = taskToDelete ? taskToDelete.title : 'cette tâche';
    
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer "${taskTitle}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const filtered = tasks.filter(task => task.id !== id);
            setTasks(filtered);
            
            // Incrémenter le compteur de tâches supprimées
            try {
              const currentCount = await AsyncStorage.getItem('tasksDeleted');
              const newCount = (parseInt(currentCount) || 0) + 1;
              await AsyncStorage.setItem('tasksDeleted', newCount.toString());
            } catch (error) {
              console.error('Erreur lors de la mise à jour du compteur de suppressions:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleTaskDone = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id
        ? { ...task, done: !task.done }
        : task
    );

    setTasks(updatedTasks);

    if (!checkAnimations[id]) {
      checkAnimations[id] = {
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      };
    } else {
      checkAnimations[id].scale.setValue(0);
      checkAnimations[id].opacity.setValue(0);
    }

    Animated.parallel([
      Animated.timing(checkAnimations[id].scale, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(checkAnimations[id].opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* =======================
     SORTING
  ======================= */

  const getSortedTasks = () => {
    // Filtrer d'abord par recherche
    let filteredTasks = tasks;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.details && task.details.toLowerCase().includes(query))
      );
    }
    
    const tasksCopy = [...filteredTasks];
    
    switch (sortType) {
      case 'deadline':
        return tasksCopy.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        });
      
      case 'tag':
        const tagOrder = { 'urgent': 0, 'travail': 1, 'perso': 2, null: 3 };
        return tasksCopy.sort((a, b) => {
          const aOrder = tagOrder[a.tag] !== undefined ? tagOrder[a.tag] : 3;
          const bOrder = tagOrder[b.tag] !== undefined ? tagOrder[b.tag] : 3;
          return aOrder - bOrder;
        });
      
      case 'alphabetical':
        return tasksCopy.sort((a, b) => {
          return a.title.localeCompare(b.title, 'fr');
        });
      
      case 'creation':
      default:
        return tasksCopy.sort((a, b) => {
          return parseInt(b.id) - parseInt(a.id); // Plus récent en premier
        });
    }
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <View style={styles.container}>

      <Text style={styles.header}>🧠 To-Do List</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setTitle('');
          setDetails('');
          setSelectedDeadline(null);
          setSelectedTag(null);
          setTaskEditing(null);
          setTaskModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>➕ Nouvelle tâche</Text>
      </TouchableOpacity>

      {/* Champ de recherche */}
      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <TextInput
          style={styles.input}
          placeholder="🔍 Rechercher dans les titres et détails..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Menu déroulant de tri */}
      <View style={{ marginBottom: 15, marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => setShowSortMenu(!showSortMenu)}
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
          }}
        >
          <Text style={{ color: colors.text, fontSize: 15 }}>
            Trier par : {sortType === 'deadline' ? '📅 Deadline' : sortType === 'tag' ? '🏷️ Tag' : sortType === 'creation' ? '🕐 Création' : '🔤 Alphabétique'}
          </Text>
          <Ionicons 
            name={showSortMenu ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={colors.text} 
          />
        </TouchableOpacity>

        {showSortMenu && (
          <View style={{
            marginTop: 5,
            backgroundColor: colors.card,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}>
            <TouchableOpacity
              onPress={() => {
                setSortType('deadline');
                setShowSortMenu(false);
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ color: sortType === 'deadline' ? '#4A90E2' : colors.text, fontSize: 14, fontWeight: sortType === 'deadline' ? 'bold' : 'normal' }}>
                📅 Deadline
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSortType('tag');
                setShowSortMenu(false);
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ color: sortType === 'tag' ? '#4CAF50' : colors.text, fontSize: 14, fontWeight: sortType === 'tag' ? 'bold' : 'normal' }}>
                🏷️ Tag
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSortType('creation');
                setShowSortMenu(false);
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ color: sortType === 'creation' ? '#FF9800' : colors.text, fontSize: 14, fontWeight: sortType === 'creation' ? 'bold' : 'normal' }}>
                🕐 Création
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSortType('alphabetical');
                setShowSortMenu(false);
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 15,
              }}
            >
              <Text style={{ color: sortType === 'alphabetical' ? '#9C27B0' : colors.text, fontSize: 14, fontWeight: sortType === 'alphabetical' ? 'bold' : 'normal' }}>
                🔤 Alphabétique
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={getSortedTasks()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const getBorderColor = () => {
            switch (item.tag) {
              case 'perso':
                return '#4A90E2'; // Bleu
              case 'travail':
                return '#4CAF50'; // Vert
              case 'urgent':
                return '#F44336'; // Rouge
              default:
                return colors.border;
            }
          };

          return (
            <View style={[styles.taskItem, { borderColor: getBorderColor(), borderWidth: item.tag ? 2 : 1 }]}>

            {/* Checkbox */}
            <TouchableOpacity onPress={() => toggleTaskDone(item.id)}>
              <View style={[styles.checkbox, item.done && styles.checkboxChecked]}>
                {item.done && checkAnimations[item.id] && (
                  <Animated.View
                    style={{
                      transform: [{ scale: checkAnimations[item.id].scale }],
                      opacity: checkAnimations[item.id].opacity,
                      position: 'absolute',
                      top: -6,
                      left: -4,
                    }}
                  >
                    <MaterialIcons name="check" size={22} color="green" />
                  </Animated.View>
                )}
              </View>
            </TouchableOpacity>

            {/* Texte */}
            <TouchableOpacity
              style={styles.taskTextContainer}
              onPress={() => {
                setSelectedTask(item);
                setViewModalVisible(true);
              }}
            >
              <Text style={[styles.taskTitle, item.done && styles.taskTitleDone]}>
                {item.title}
              </Text>

              <Text
                numberOfLines={3}
                ellipsizeMode="tail"
                style={[
                  styles.taskDetails,
                  item.done && styles.taskTitleDone,
                  { marginTop: 10 },
                ]}
              >
                {item.details}
              </Text>
              {item.deadline && (
                <Text
                  style={[
                    styles.taskDetails,
                    item.done && styles.taskTitleDone,
                    { marginTop: 5, fontSize: 12, fontStyle: 'italic' },
                  ]}
                >
                  📅 {new Date(item.deadline).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </TouchableOpacity>

            {/* Actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={{ marginRight: 10 }}
                onPress={() => {
                  setTaskEditing(item.id);
                  setTitle(item.title);
                  setDetails(item.details);
                  setSelectedDeadline(item.deadline || null);
                  setSelectedTag(item.tag || null);
                  setTaskModalVisible(true);
                }}
              >
                <Ionicons name="pencil-outline" size={20} color="gray" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#f55" />
              </TouchableOpacity>
            </View>

            </View>
          );
        }}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.getParent()?.openDrawer()}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Paramètres')}>
          <Ionicons name="settings-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={taskModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: colors.card,
            padding: 20,
            borderRadius: 12,
            width: '100%',
          }}>
            <TextInput
              style={styles.input}
              placeholder="Titre de la tâche"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Détails"
              placeholderTextColor="#888"
              value={details}
              onChangeText={setDetails}
              multiline
            />
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center', height: 45 }]}
              onPress={showDeadlinePicker}
            >
              <Text style={{ color: selectedDeadline ? colors.text : '#888' }}>
                {selectedDeadline
                  ? `📅 ${new Date(selectedDeadline).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : '📅 Choisir une deadline'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={tempSelectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}

            {showTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={tempSelectedDate}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}

            {/* Sélection de tag */}
            <View style={{ marginBottom: 10 }}>
              <Text style={{ color: colors.text, marginBottom: 8, fontSize: 14, fontWeight: '500' }}>
                Tag :
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={() => setSelectedTag(selectedTag === 'perso' ? null : 'perso')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: selectedTag === 'perso' ? '#4A90E2' : colors.border,
                    backgroundColor: selectedTag === 'perso' ? '#4A90E220' : 'transparent',
                    alignItems: 'center',
                    marginRight: 5,
                  }}
                >
                  <Text style={{ color: selectedTag === 'perso' ? '#4A90E2' : colors.text, fontWeight: selectedTag === 'perso' ? 'bold' : 'normal' }}>
                    Perso
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedTag(selectedTag === 'travail' ? null : 'travail')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: selectedTag === 'travail' ? '#4CAF50' : colors.border,
                    backgroundColor: selectedTag === 'travail' ? '#4CAF5020' : 'transparent',
                    alignItems: 'center',
                    marginHorizontal: 5,
                  }}
                >
                  <Text style={{ color: selectedTag === 'travail' ? '#4CAF50' : colors.text, fontWeight: selectedTag === 'travail' ? 'bold' : 'normal' }}>
                    Travail
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedTag(selectedTag === 'urgent' ? null : 'urgent')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: selectedTag === 'urgent' ? '#F44336' : colors.border,
                    backgroundColor: selectedTag === 'urgent' ? '#F4433620' : 'transparent',
                    alignItems: 'center',
                    marginLeft: 5,
                  }}
                >
                  <Text style={{ color: selectedTag === 'urgent' ? '#F44336' : colors.text, fontWeight: selectedTag === 'urgent' ? 'bold' : 'normal' }}>
                    Urgent
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, (!title.trim() && !taskEditing) && { opacity: 0.5 }]}
              onPress={() => {
                if (taskEditing) {
                  handleUpdateTask();
                  setTaskModalVisible(false);
                } else {
                  if (title.trim()) {
                    handleAddTask();
                    setTaskModalVisible(false);
                  } else {
                    Alert.alert('Erreur', 'Veuillez saisir un titre pour la tâche.');
                  }
                }
              }}
              disabled={!title.trim() && !taskEditing}
            >
              <Text style={styles.buttonText}>
                {taskEditing ? 'Mettre à jour' : 'Ajouter'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTaskModalVisible(false)}>
              <Text style={{ color: '#f55', marginTop: 10, textAlign: 'center' }}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {viewModalVisible && selectedTask && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: colors.card,
            padding: 20,
            borderRadius: 12,
            width: '100%',
            maxHeight: '80%',
          }}>
            <Text style={[styles.taskTitle, { marginBottom: 10 }]}>
              {selectedTask.title}
            </Text>
            <ScrollView>
              <Text style={styles.taskDetails}>
                {selectedTask.details}
              </Text>
            </ScrollView>
            {selectedTask.deadline && (
              <Text
                style={{
                  marginTop: 15,
                  fontSize: 14,
                  color: colors.placeholder,
                  fontStyle: 'italic',
                  textAlign: 'right',
                }}
              >
                ⏳ Deadline : {new Date(selectedTask.deadline).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
            <TouchableOpacity onPress={() => setViewModalVisible(false)}>
              <Text style={{ color: '#f55', marginTop: 10, textAlign: 'center' }}>
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}
