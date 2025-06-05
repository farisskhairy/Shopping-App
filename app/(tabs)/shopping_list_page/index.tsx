import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Alert, ScrollView } from "react-native";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "firebaseConfig";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";

// Object description for grocery item.
interface ShoppingItem {
  id: string;
  name: string;
}

// Object description for displaying item in cart.
interface ItemMatchInfo {
  name: string;
  price: number;
  updatedBy: string;
  updatedAt: Date;
}

// Object description for the store that is best to shop at.
interface StoreMatch {
  id: string;
  name: string;
  address?: string;
  matchedItems: ItemMatchInfo[];
  total: number;
}

export default function ShoppingListPage() {
  // Checks for user authentication.
  const auth = getAuth();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);
  const router = useRouter();

  // Variables with values that persist even through refreshing/re-rendering.
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
    // Variable for optimal stores calculated by algorithm.
  const [storeMatches, setStoreMatches] = useState<StoreMatch[]>([]);
  // Variable for items that match user's input.
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    // Queries items made by user to be added to shopping cart.
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

  // Add item information to user's shopping cart.
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

  // Searches for possible matches of items based on user's input.
  const fetchSuggestions = async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }
  
    const lowerTerm = term.trim().toLowerCase();
    const q = query(collection(db, "items"));
    const snapshot = await getDocs(q);
  
    const matches = new Set<string>();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name?.toLowerCase().includes(lowerTerm)) {
        matches.add(data.name);
      }
      if (Array.isArray(data.tags)) {
        data.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(lowerTerm)) {
            matches.add(tag);
          }
        });
      }
    });
  
    setSuggestions(Array.from(matches).slice(0, 6));
  };
  

  // Algorithm to calculate best store to shop at, based on items and most recent price.
  const loadAndNavigateToBestStore = async () => {
    // Loads grocery items to be processed.
    const uniqueNames = [...new Set(items.map((item) => item.name.trim()))];
    const storeMap: Record<string, StoreMatch> = {};
    
    for (const name of uniqueNames) {
      const nameQuery = query(
        collection(db, "items"),
        where("name", ">=", name),
        where("name", "<=", name + "\uf8ff")
      );
      
      // Searches for items in database based on its tags.
      const tagQuery = query(
        collection(db, "items"),
        where("tags", "array-contains", name.toLowerCase())
      );
      
      // Retrieves item data from database based on shopping cart.
      const [nameSnap, tagSnap] = await Promise.all([getDocs(nameQuery), getDocs(tagQuery)]);
  
      const allDocs = [...nameSnap.docs, ...tagSnap.docs];
      const seen = new Set(); // to prevent duplicates
      
      // Adds item and store data to be processed.
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
        // If store info is not retrieved yet, program will retrieve data from database.
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
    
    // Checks if there are optimal stores to be shopped.
    const matches = Object.values(storeMap).sort((a, b) => b.matchedItems.length - a.matchedItems.length || a.total - b.total);
    setStoreMatches(matches);
    if (matches.length > 0) {
      router.push({
        pathname: "/(tabs)/shopping_list_page/store_comparison",
        params: { storeMatches: JSON.stringify(matches), shoppingList: JSON.stringify(uniqueNames) }
      });
    } else {
      Alert.alert("No store matches found.");
    }
  };

  // Renders a screen to ask for authentication first.
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

      {/* Place to enter item search and possible item matches will be shown. */}
      <TextInput
        style={styles.input}
        placeholder="Enter item"
        value={newItemName}
        onChangeText={(text) => {setNewItemName(text); fetchSuggestions(text);}}
        onSubmitEditing={addItem}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          {suggestions.map((suggestion, idx) => (
            <TouchableOpacity key={idx} onPress={() => {
              setNewItemName(suggestion);
              setSuggestions([]);
            }}>
              <Text style={styles.suggestionItem}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Button title="Add Item" onPress={addItem}/>


      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.itemName}>{item.name}</Text>
          <TouchableOpacity onPress={() => deleteItem(item.id)}>
            <Text style={styles.deleteButton}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Proceeds to page to calculate optimal store to shop. */}
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
  button: {
    backgroundColor: '#984063',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  suggestionBox: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    color: "#333",
  },
  
});
