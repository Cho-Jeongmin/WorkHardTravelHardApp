import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TODO_KEY = "@toDos";
const MODE_KEY = "@working";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
    loadMode();
    setLoading(false);
  }, []);
  const travel = () => {
    setWorking(false);
    saveMode(false);
  };
  const work = () => {
    setWorking(true);
    saveMode(true);
  };
  const saveMode = async (working) => {
    await AsyncStorage.setItem(MODE_KEY, JSON.stringify(working));
  };
  const loadMode = async () => {
    const s = await AsyncStorage.getItem(MODE_KEY);
    if (s !== null) setWorking(JSON.parse(s));
  };
  const onChangeText = (payload) => setText(payload);
  const complete = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(TODO_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(TODO_KEY);
      if (s !== null) setToDos(JSON.parse(s));
    } catch (e) {}
  };
  const addToDo = async (event) => {
    if (text === "") return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do", "Are you sure you want to delete the To Do?", [
      { text: "Cancel" },
      {
        text: "OK",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };
  console.log(working);
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={onChangeText}
        onSubmitEditing={addToDo}
        returnKeyType="done"
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
      />
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <ScrollView>
          {Object.keys(toDos).map(
            (key) =>
              working === toDos[key].working && (
                <View style={styles.toDo} key={key}>
                  <Checkbox
                    value={toDos[key].completed}
                    onValueChange={() => {
                      complete(key);
                    }}
                  />
                  <Text
                    style={{
                      ...styles.toDoText,
                      textDecorationLine: toDos[key].completed
                        ? "line-through"
                        : "none",
                      color: toDos[key].completed ? "#909090" : "white",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      deleteToDo(key);
                    }}
                  >
                    <MaterialIcons name="cancel" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  btnText: {
    fontSize: 35,
    fontWeight: 600,
    color: "white",
  },
  input: {
    fontSize: 18,
    backgroundColor: "white",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  toDo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  toDoText: { color: "white", fontSize: 16, fontWeight: 500 },
});
