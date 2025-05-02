import React, { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import { GroceryItem } from "../../models/GroceryItem";

// Sample test data using the GroceryItem model
const sampleItems: GroceryItem[] = [
  {
    id: "1",
    name: "Oat Milk",
    brand: "Oatly",
    price: 3.99,
    quantityInPackage: "1L",
    barcode: "1234567890123",
    tags: ["vegan", "dairy-free", "non-gmo"],
  },
  {
    id: "2",
    name: "Eggs",
    brand: "Happy Hen",
    price: 4.5,
    quantityInPackage: "12 pack",
    barcode: "2345678901234",
    tags: ["organic", "protein"],
  },
  {
    id: "3",
    name: "Ben & Jerry's Chocolate Fudge Brownie",
    brand: "Ben & Jerry's",
    price: 5.25,
    quantityInPackage: "465ml",
    barcode: "2345678901235",
    tags: ["dairy", "dessert", "frozen foods", "ice cream"],
  },
  {
    id: "4",
    name: "Almond Butter",
    brand: "Barney",
    price: 8.99,
    quantityInPackage: "10 oz",
    barcode: "3456789012345",
    tags: ["gluten-free", "protein"],
  }
];

//const [items, setItems] = useState<GroceryItem[]>([]);

// Place where app will navigate to as the home page of the app. It is set as the SEARCH page so the home page of the app will be the Search page.
export default function Index() {
  const [items, setItems] = useState<GroceryItem[]>(sampleItems);
  const [searchText, setSearchText] = useState("");
  //item filtering across all data fields
  const filteredItems = items.filter((item) => {
    const query = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query) ||
      item.quantityInPackage.toLowerCase().includes(query) ||
      item.barcode.includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Groceries</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by name, brand, barcode or tags"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Brand: {item.brand}</Text>
            <Text>Price: ${item.price.toFixed(2)}</Text>
            <Text>Qty: {item.quantityInPackage}</Text>
            <Text>Barcode: {item.barcode}</Text>
            <Text>Tags: {item.tags.join(", ")}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    flex: 1,
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
    marginBottom: 20,
  },
  card: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
  },
});