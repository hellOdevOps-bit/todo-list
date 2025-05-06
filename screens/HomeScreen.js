//HomeScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext'; // <--- à la fin des imports custom
import { Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
const { colors } = useContext(ThemeContext);
const [taskEditing, setTaskEditing] = useState(null);

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
      right: 20,
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

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (tasks.length > 0) {
      AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    }
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

  const handleAddTask = () => {
    if (title.trim() === '') return;

    const newTask = {
      id: Date.now().toString(),
      title,
      details,
      done: false,
    };

    setTasks([...tasks, newTask]);
    setTitle('');
    setDetails('');
  };

  const toggleTaskDone = (id) => {
    const wasDone = tasks.find((t) => t.id === id)?.done;
  
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    setTasks(updatedTasks);
  
    if (!checkAnimations[id]) {
      checkAnimations[id] = {
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      };
    } else {
      // Reset les valeurs si elles existent
      checkAnimations[id].scale.setValue(0);
      checkAnimations[id].opacity.setValue(0);
    }
  
    // Lance l'animation peu importe si on coche ou décoche
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
  
  const deleteTask = (id) => {
    const filtered = tasks.filter((task) => task.id !== id);
    setTasks(filtered);
  };
  
  const navigation = useNavigation();
  const checkAnimations = useRef({}).current;

  const handleUpdateTask = () => {
    if (!title.trim()) return;
  
    const updated = tasks.map((task) =>
      task.id === taskEditing
        ? { ...task, title, details }
        : task
    );
  
    setTasks(updated);
    setTitle('');
    setDetails('');
    setTaskEditing(null); // on sort du mode édition
  };  

  return (

    <View style={styles.container}>
      <Text style={styles.header}>🧠 To-Do List</Text>
  
      <TextInput
        style={styles.input}
        placeholder="Titre de la tâche"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Détails de la tâche"
        placeholderTextColor="#888"
        value={details}
        onChangeText={setDetails}
      />
  
  <TouchableOpacity
  style={styles.button}
  onPress={taskEditing ? handleUpdateTask : handleAddTask}
>
  <Text style={styles.buttonText}>
    {taskEditing ? 'Mettre à jour' : 'Ajouter'}
  </Text>
</TouchableOpacity>
  
<FlatList
  data={tasks}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={styles.taskItem}>
      {/* Zone 1 : checkbox */}
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

      {/* Zone 2 : texte */}
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskTitle, item.done && styles.taskTitleDone]}>
          {item.title}
        </Text>
        <Text style={[styles.taskDetails, item.done && styles.taskTitleDone]}>
          {item.details}
        </Text>
      </View>

      {/* Zone 3 : icônes édition + suppression */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => {
            setTaskEditing(item.id);
            setTitle(item.title);
            setDetails(item.details);
          }}
          style={{ marginRight: 10 }}
        >
          <Ionicons name="pencil-outline" size={20} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#f55" />
        </TouchableOpacity>
      </View>
    </View>
  )}
/>

<View style={styles.topBar}>
  <TouchableOpacity onPress={() => navigation.navigate('Paramètres')}>
    <Ionicons name="settings-outline" size={24} color="gray" />
  </TouchableOpacity>
</View>
    </View>
  );  
} 