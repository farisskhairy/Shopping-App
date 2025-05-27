import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Button, TouchableOpacity } from "react-native";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, where, getDoc } from "firebase/firestore";
import { db } from "firebaseConfig";

interface ShoppingItem {
  id: string;
  name: string;
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [bestStoreResult, setBestStoreResult] = useState<{ store: string; total: number; matchedItems: number; totalItems: number; } | null>(null);

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

  //Finds the best possible store based on a partial match or complete match
  const findBestStore = async () => {
    const storeTotals: Record<string, number> = {};
    const storeMatchCounts: Record<string, number> = {};
    const storeIdToName: Record<string, string> = {};
    const storeMatchedItems: Record<string, Set<string>> = {};
  
    for (const item of items) {
      const q = query(collection(db, "items"), where("name", "==", item.name));
      const snapshot = await getDocs(q);
      console.log(`Matching items for "${item.name}":`, snapshot.docs.map(doc => doc.data()));
  
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const storeId = data.store_id;
        const storeName = data.store_name;
        const price = data.sale_price;
  
        if (!storeId || typeof price !== "number") continue;
  
        // No need to query Firestore for store name — use directly
        if (!storeIdToName[storeId]) {
          storeIdToName[storeId] = storeName ?? "Unknown Store";
        }
  
        storeTotals[storeId] = (storeTotals[storeId] || 0) + price;
  
        if (!storeMatchedItems[storeId]) {
          storeMatchedItems[storeId] = new Set();
        }
        if (!storeMatchedItems[storeId].has(item.name)) {
          storeMatchedItems[storeId].add(item.name);
          storeMatchCounts[storeId] = (storeMatchCounts[storeId] || 0) + 1;
        }
      }
    }
  
    // Find the store with the lowest total
    let bestStoreId: string | null = null;
    let minTotal = Infinity;
  
    for (const [storeId, total] of Object.entries(storeTotals)) {
      if (total < minTotal) {
        minTotal = total;
        bestStoreId = storeId;
      }
    }
  
    if (bestStoreId) {
      setBestStoreResult({
        store: storeIdToName[bestStoreId],
        total: minTotal,
        matchedItems: storeMatchCounts[bestStoreId],
        totalItems: items.length,
      });
    } else {
      setBestStoreResult(null);
    }
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

      <View style={{ marginTop: 30 }}>
        <Button title="Find Best Store" onPress={findBestStore} />
        {bestStoreResult && (
          <Text style={{ marginTop: 10, fontSize: 16 }}>
            Best Store: {bestStoreResult.store} — ${bestStoreResult.total.toFixed(2)}{"\n"}
            Matches {bestStoreResult.matchedItems} of {bestStoreResult.totalItems} items
          </Text>
        )}
      </View>
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
