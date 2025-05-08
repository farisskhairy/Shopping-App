import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Button, TouchableOpacity } from "react-native";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "firebaseConfig";

interface ShoppingItem {
  id: string;
  name: string;
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    const q = query(collection(db, "shoppingLists"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList: ShoppingItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setItems(itemList);
    });

    return () => unsubscribe();
  }, []);

  const addItem = async () => {
    const trimmed = newItemName.trim();
    if (trimmed) {
      await addDoc(collection(db, "shoppingLists"), { name: trimmed });
      setNewItemName("");
    }
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "shoppingLists", id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Build a Shopping List</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter item"
        value={newItemName}
        onChangeText={setNewItemName}
        onSubmitEditing={addItem}
      />
      <Button title="Add Item" onPress={addItem} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
  },
  itemName: {
    fontSize: 16,
  },
  deleteButton: {
    color: "red",
    fontWeight: "bold",
  },
});
