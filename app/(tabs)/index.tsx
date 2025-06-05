
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Button, ActivityIndicator, ScrollView, Pressable } from "react-native";
import { collection, getDocs, query, orderBy, limit, startAfter, doc, getDoc } from "firebase/firestore";
import { db } from "firebaseConfig";
import { useRouter } from 'expo-router';

const PAGE_SIZE = 20

// Object description for grocery item in app.
interface Item {
  id: string;
  name: string;
  brand: string;
  sale_price: number;
  retail_price: number;
  quantity: number;
  store_name: string;
  store_address: string;
  store_id: string;
  barcode: string;
  tags: string[];
}

// Place where app will navigate to as the home page of the app. It is set as the SEARCH page so the home page of the app will be the Search page.
export default function Index() {

  // Navigation object for React Native.
  const router = useRouter();

  // State variables to keep track of item information, user input, and screen rendering.
  const [items, setItems] = useState<Item[]>([]);
  const [searchText, setSearchText] = useState("");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Load initial data from database.
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const q = query(collection(db, "items"), orderBy("name"), limit(PAGE_SIZE));
    const snapshot = await getDocs(q);
    const loadedItems = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        brand: data.brand,
        sale_price: Number(data.sale_price),
        retail_price: Number(data.retail_price),
        quantity: data.quantity,
        store_name: data.store_name,
        store_address: data.store_address,
        tags: data.tags || [],
        barcode: data.barcode,
      };
    }) as Item[];
    setItems(loadedItems);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    extractTags(loadedItems);
    setLoading(false);
  };

  // Loads more items from database if scrolling down.
  const loadMore = async () => {
    if (!lastVisible || loadingMore) return;
    setLoadingMore(true);
    const q = query(
      collection(db, "items"),
      orderBy("name"),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );
    const snapshot = await getDocs(q);
    const moreItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Item[];
    setItems(prev => [...prev, ...moreItems]);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    extractTags(moreItems);
    setLoadingMore(false);
  };

  // Extract tag information from database to be processed.
  const extractTags = (loadedItems: Item[]) => {
    const tags = new Set(allTags);
    loadedItems.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags).sort());
  };

  // Searches for item based on user input.
  const filteredItems = items.filter(item => {
    const query = searchText.toLowerCase();
    let matchesText;
    let matchesTag;
    if (item) {
      matchesText = (
        item.name.toString().toLowerCase().includes(query) ||
        item.brand.toString().toLowerCase().includes(query) ||
        item.quantity.toString().toLowerCase().includes(query) ||
        (Array.isArray(item.tags) && item.tags.some((tag) =>
        tag.toString().toLowerCase().includes(query)
        ))
      );
        matchesTag = selectedTag ? Array.isArray(item.tags) && item.tags.includes(selectedTag) : true;
        return matchesText && matchesTag;
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Items</Text>

      <TextInput
        style={styles.input}
        placeholder="Search by name, brand, or tags"
        value={searchText}
        onChangeText={setSearchText}
      />
    
    {/* Menu to select tags for filtering through tags. */}
    <View style={{ zIndex:1}}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagFilter}>
        <Button title="All" onPress={() => setSelectedTag(null)} color={!selectedTag ? "#007aff" : "#ccc"} />
        {allTags.map(tag => (
          <Button
            key={tag}
            title={tag}
            onPress={() => setSelectedTag(tag)}
            color={selectedTag === tag ? "#007aff" : "#ccc"}
          />
        ))}
      </ScrollView>
      {/* If loading, renders loading animation. */}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#888" style={{ marginTop: 10 }} />
      ) : (
        // Displays all item information.
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" /> : null}
          renderItem={({ item }) => (
            // Navigates to item page if selected.
            // Sorry for the long lines, back tick literals do not escape new lines!
            <Pressable style={styles.card} onPress = {() => { 
                  if (item.tags && item.tags.length !== 0) {
                    router.push(`/edit_item_page?id=${item.id}&name=${item.name}&sale_price=${item.sale_price}&retail_price=${item.retail_price}&brand=${item.brand}&quantity=${item.quantity}&store_name=${item.store_name}&store_id=${item.store_id}&store_address=${item.store_address}&barcode=${item.barcode}&upload=false&tags=${item.tags.join("-")}`); 
                  } else {
                    router.push(`/edit_item_page?id=${item.id}&name=${item.name}&sale_price=${item.sale_price}&retail_price=${item.retail_price}&brand=${item.brand}&quantity=${item.quantity}&store_name=${item.store_name}&store_id=${item.store_id}&store_address=${item.store_address}&barcode=${item.barcode}&upload=false`);
                  }
                }
              }  
            >
              
              <Text style={styles.name}>{item.name}</Text>
              <Text>Brand: {item.brand}</Text>
              <Text>Sale Price: ${item.sale_price}</Text>
              <Text>Retail Price: ${item.retail_price}</Text>
              <Text>Qty: {item.quantity}</Text>
              <Text>Store: {item.store_name}</Text>
              <Text>Address: {item.store_address}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
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
    marginBottom: 10,
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
  tagFilter: {
    marginBottom: 10,
    flexGrow: 0,
  },
});