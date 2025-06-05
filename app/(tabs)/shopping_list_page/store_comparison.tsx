import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "firebaseConfig";

// Object definition for item at optimal store.
interface ItemMatchInfo {
  name: string;
  price: number;
  updatedBy: string;
  updatedAt?: Date;
}

// Object definition for store with best prices.
interface StoreMatch {
  id: string;
  name: string;
  address?: string;
  matchedItems: {
    name: string;
    price: number;
  }[];
  total: number;
}

export default function StoreComparisonScreen() {
  // Data passed from shooping cart page for best stores information and user's items in cart.
  const { storeMatches, shoppingList } = useLocalSearchParams();
  const parsedMatches: StoreMatch[] = storeMatches ? JSON.parse(storeMatches as string) : [];
  const fullShoppingList: string[] = shoppingList ? JSON.parse(shoppingList as string) : [];
  const normalizedShoppingList = fullShoppingList.map(n => n.trim().toLowerCase());

  // Keeps track of items that are available at store.
  const [matchedItemDetails, setMatchedItemDetails] = useState<ItemMatchInfo[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState(parsedMatches[0]?.id || "");
  const selectedStore = parsedMatches.find((s) => s.id === selectedStoreId);
  const router = useRouter();
  // Keeps track of unavailable items at store.
  const [missingItems, setMissingItems] = useState<string[]>([]);

  // Gets item information from database, sorts through items on whether they are available at store or not,
  // and its previous sale prices.
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!selectedStore) return;

      const q = query(collection(db, "items"), where("store_id", "==", selectedStore.id));
      const snapshot = await getDocs(q);

      const foundTerms = new Set<string>();
      const updatedItems: ItemMatchInfo[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const name = data.name?.toLowerCase().trim();
        const tags: string[] = Array.isArray(data.tags) ? data.tags.map(t => t.toLowerCase()) : [];

        const matches = normalizedShoppingList.filter(term => name === term || tags.includes(term));
        
        // Keeps track of prvious sale price of items.
        if (matches.length > 0) {
          updatedItems.push({
            name: data.name,
            price: data.sale_price,
            updatedBy: typeof data.updatedBy === "string" ? data.updatedBy : "Unknown",
            updatedAt: data.updatedAt?.toDate?.()
          });

          matches.forEach(term => foundTerms.add(term));
        }
      });

      // Updates state variables with new information from database.
      setMatchedItemDetails(updatedItems);

      // Keeps track of items unavailable at store.
      const missing = normalizedShoppingList.filter(term => !foundTerms.has(term));
      setMissingItems(missing);
    };

    fetchItemDetails();
  }, [selectedStoreId]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Store Price Comparison</Text>

      <Button title="Back to List" onPress={() => router.back()} />

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Select a Store:</Text>
        <View style={styles.pickerContainer}>
          {/* Choose optimal store and see item price and info. */}
          <Picker
            selectedValue={selectedStoreId}
            onValueChange={(val) => setSelectedStoreId(val)}
            style={styles.picker}
          >
            <Picker.Item label="Select a Store" value="" enabled={false} />
            {parsedMatches.map((store) => (
              <Picker.Item key={store.id} label={store.name} value={store.id} color="#000" />
            ))}
          </Picker>
        </View>
      </View>
      
      {/* Displays best prices of items at the optimal store. */}
      {selectedStore && (
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{selectedStore.name}</Text>
          {selectedStore.address && <Text style={styles.address}>{selectedStore.address}</Text>}
          <Text style={styles.total}>Total: ${selectedStore.total.toFixed(2)}</Text>

          {matchedItemDetails.map((item, index) => (
            <Text key={index} style={styles.item}>
              {item.name} — ${item.price.toFixed(2)}: {item.updatedAt
                ? `${formatDistanceToNow(new Date(item.updatedAt))} ago`
                : "Update date unknown"} updated by {item.updatedBy || "Unknown"}
            </Text>
          ))}

          {missingItems.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 4, color: "black" }}>Missing Items:</Text>
              {missingItems.map((name, idx) => (
                <Text key={idx} style={{ fontStyle: "italic", color: "red", marginBottom: 4 }}>
                  {name}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  pickerWrapper: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
    height: 120,
    justifyContent: "center",
  },
  picker: {
    height: 50,
    marginTop: -160,
  },
  storeInfo: {
    marginTop: 20,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  total: {
    fontSize: 16,
    marginBottom: 10,
  },
  item: {
    fontSize: 14,
    marginBottom: 6,
  },
});
