import { StatusBar } from "expo-status-bar";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
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

  const addToDo = async (event) => {
    if (text === "") return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false, modifying: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
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

  const completeToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    saveToDos(newToDos);
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
  const showTextInput = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].modifying = true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const onModifyToDo = (text, key) => {
    const newToDos = { ...toDos };
    newToDos[key].text = text;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const hideTextInput = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].modifying = false;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
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
        maxLength={15}
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
                      completeToDo(key);
                    }}
                    style={{ flex: 0.5, marginRight: 10 }}
                  />
                  <Text
                    style={{
                      ...styles.toDoText,
                      flex: 8,
                      textDecorationLine: toDos[key].completed
                        ? "line-through"
                        : "none",
                      color: toDos[key].completed ? "#909090" : "white",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                  <TextInput
                    value={toDos[key].text}
                    onChangeText={(text) => {
                      onModifyToDo(text, key);
                    }}
                    onSubmitEditing={() => {
                      hideTextInput(key);
                    }}
                    style={{
                      ...styles.modifyingInput,
                      width: toDos[key].modifying ? 250 : 0,
                      paddingHorizontal: toDos[key].modifying ? 20 : 0,
                    }}
                    maxLength={15}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      showTextInput(key);
                    }}
                    style={{ flex: 1 }}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      deleteToDo(key);
                    }}
                  >
                    <MaterialIcons
                      name="cancel"
                      size={20}
                      color="white"
                      style={{
                        marginLeft: 10,
                      }}
                    />
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
  modifyingInput: {
    position: "absolute",
    fontSize: 18,
    backgroundColor: "white",
    borderRadius: 30,
    paddingVertical: 5,
    marginVertical: 20,
    marginLeft: 60,
  },
});
