// @ts-nocheck (CameraView has mode barcode scanner bug)

import React, { useState, useRef } from "react";
import { CameraMode, CameraType, CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Alert, Button, Pressable, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Scanner() {

  const router = useRouter();

  // // State variables to allow display of camera through refreshes.
  const { store_id, store_name, store_address } = useLocalSearchParams<{ store_id?: string; store_name?: string; store_address?: string }>();
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const scannedRef = useRef(false);

  // Processes barcode information if item has been scanned. Parameter is information from camera of barcode.
  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (!result?.data || scannedRef.current) return;
    scannedRef.current = (true);
    console.log("Barcode scanned:", result.data);

    const barcode = result.data;
    // Retrieves data of barcode from Open Food Facts API.
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      // If data exists, sends data to adding item page for confirmation and upload.
      if (data.status === 1) {
        const product = data.product;
        const name = encodeURIComponent(product.product_name || "");
        const brand = encodeURIComponent(product.brands || "");
        const quantity = encodeURIComponent(product.quantity || "");
        const encodedBarcode = encodeURIComponent(barcode);

        if (store_name) {
          router.push(`/add_item_and_location/add_item?store_id=${store_id}&store_name=${store_name}&store_address=${store_address}&name=${name}&brand=${brand}&quantity=${quantity}&barcode=${encodedBarcode}`);
        } else {
          router.push(`/add_item_and_location/add_item?name=${name}&brand=${brand}&quantity=${quantity}&barcode=${encodedBarcode}`);
        }
        } else {
        Alert.alert("Item not found", "No product found for that barcode.");
        setTimeout(() => (scannedRef.current = false), 2000);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to fetch product data.");
      setTimeout(() => (scannedRef.current = false), 2000);
    }
  };

  // Returns nothing if camera permission is not granted.
  if (!cameraPermission) return null;

  // Asks for camera permission.
  if (!cameraPermission.granted) {
    return (
      <View>
        <Button onPress={requestPermission} title="Allow Camera Access" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        mode="barcode-scanner"
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
      />
      <View style={styles.closeButton}>
        <Pressable onPress={() => router.back()}>
          <AntDesign name="closecircle" size={40} color="black" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    top: "12.9%",
    left: "79%",
  },
});
