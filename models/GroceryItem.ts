// models/GroceryItem.ts
//Grocery Items data structure

export interface GroceryItem {
    id: string;
    name: string;
    brand: string;
    price: number;
    quantityInPackage: string;
    barcode: string;
    tags: string[];
  }