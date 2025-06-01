import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";

interface ItemMatchInfo {
  name: string;
  price: number;
  updatedBy: string;
  updatedAt: string | Date;
}

interface StoreMatch {
  id: string;
  name: string;
  address?: string;
  matchedItems: ItemMatchInfo[];
  total: number;
}

export default function StoreComparisonScreen() {
  const { storeMatches } = useLocalSearchParams();
  const parsedMatches: StoreMatch[] = storeMatches ? JSON.parse(storeMatches as string) : [];

  const [selectedStoreId, setSelectedStoreId] = useState(parsedMatches[0]?.id || "");
  const selectedStore = parsedMatches.find((s) => s.id === selectedStoreId);

  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Store Price Comparison</Text>

      <Button title="Back to List" onPress={() => router.back()} />

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Select a Store:</Text>
        <View style={styles.pickerContainer}>
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

      {selectedStore && (
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{selectedStore.name}</Text>
          {selectedStore.address && <Text style={styles.address}>{selectedStore.address}</Text>}
          <Text style={styles.total}>Total: ${selectedStore.total.toFixed(2)}</Text>
          {selectedStore.matchedItems.map((item, index) => (
            <Text key={index} style={styles.item}>
              {item.name} — ${item.price.toFixed(2)}: {formatDistanceToNow(new Date(item.updatedAt))} ago by {item.updatedBy}
            </Text>
          ))}
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
    height: 50,
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
