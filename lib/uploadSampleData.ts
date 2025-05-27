import { db } from '../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { sampleStores } from '../data/sampleStores';
import { sampleGroceryItems } from '../data/sampleGroceryItems';

export const uploadStoresAndGroceries = async () => {
  const storeRef = collection(db, 'stores');
  const groceryRef = collection(db, 'groceries');
  const storeIdMap: Record<string, string> = {};

  // upload stores and store their IDs
  for (const store of sampleStores) {
    const docRef = await addDoc(storeRef, store);
    storeIdMap[store.name] = docRef.id;
  }

  // upload groceries with reference to storeId
  for (const item of sampleGroceryItems) {
    const { storeName, ...groceryData } = item;
    const storeId = storeIdMap[storeName];
    if (storeId) {
      await addDoc(groceryRef, {
        ...groceryData,
        storeId
      });
    } else {
      console.warn(`Store not found for item: ${item.name}`);
    }
  }

  console.log('Uploaded stores and groceries');
};
