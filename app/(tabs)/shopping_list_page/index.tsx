import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Alert, ScrollView } from "react-native";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "firebaseConfig";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";

interface ShoppingItem {
  id: string;
  name: string;
}

interface ItemMatchInfo {
  name: string;
  price: number;
  updatedBy: string;
  updatedAt: Date;
}

interface StoreMatch {
  id: string;
  name: string;
  address?: string;
  matchedItems: ItemMatchInfo[];
  total: number;
}

export default function ShoppingListPage() {
  const auth = getAuth();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);
  const router = useRouter();

  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [storeMatches, setStoreMatches] = useState<StoreMatch[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "shoppingLists"),
      orderBy("name")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemList: ShoppingItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setItems(itemList);
    });

    return () => unsubscribe();
  }, [user]);

  const addItem = async () => {
    if (!user) return;

    const trimmed = newItemName.trim();
    if (trimmed) {
      await addDoc(collection(db, "users", user.uid, "shoppingLists"), {
        name: trimmed,
      });
      setNewItemName("");
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "shoppingLists", id));
  };

  const loadAndNavigateToBestStore = async () => {
    const uniqueNames = [...new Set(items.map((item) => item.name.trim()))];
    const storeMap: Record<string, StoreMatch> = {};
  
    for (const name of uniqueNames) {
      const nameQuery = query(
        collection(db, "items"),
        where("name", ">=", name),
        where("name", "<=", name + "\uf8ff")
      );
  
      const tagQuery = query(
        collection(db, "items"),
        where("tags", "array-contains", name.toLowerCase())
      );
  
      const [nameSnap, tagSnap] = await Promise.all([getDocs(nameQuery), getDocs(tagQuery)]);
  
      const allDocs = [...nameSnap.docs, ...tagSnap.docs];
      const seen = new Set(); // to prevent duplicates
  
      allDocs.forEach(docSnap => {
        const id = docSnap.id;
        if (seen.has(id)) return;
        seen.add(id);
  
        const data = docSnap.data();
        const storeId = data.store_id;
        const storeName = data.store_name;
        const price = data.sale_price;
  
        if (!storeId || !storeName || typeof price !== 'number') return;
  
        if (!storeMap[storeId]) {
          storeMap[storeId] = {
            id: storeId,
            name: storeName,
            address: data.store_address || "",
            matchedItems: [],
            total: 0,
          };
        }
  
        const alreadyMatched = storeMap[storeId].matchedItems.some(i => i.name === data.name);
        if (!alreadyMatched) {
          storeMap[storeId].matchedItems.push({
            name: data.name,
            price,
            updatedBy: data.updated_by || "Unknown",
            updatedAt: data.updated_at?.toDate?.() || new Date()
          });
          storeMap[storeId].total += price;
        }
      });
    }
  
    const matches = Object.values(storeMap).sort((a, b) => b.matchedItems.length - a.matchedItems.length || a.total - b.total);
    setStoreMatches(matches);
    if (matches.length > 0) {
      router.push({
        pathname: "/(tabs)/shopping_list_page/store_comparison",
        params: { storeMatches: JSON.stringify(matches) }
      });
    } else {
      Alert.alert("No store matches found.");
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Please log in to view your shopping list.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Build a Shopping List</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter item"
        value={newItemName}
        onChangeText={setNewItemName}
        onSubmitEditing={addItem}
      />
      <Button title="Add Item" onPress={addItem} />

      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.itemName}>{item.name}</Text>
          <TouchableOpacity onPress={() => deleteItem(item.id)}>
            <Text style={styles.deleteButton}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={{ marginTop: 30 }}>
        <Button title="View Store Prices" onPress={loadAndNavigateToBestStore} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
