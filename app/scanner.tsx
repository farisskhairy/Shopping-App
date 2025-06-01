import React, { useState, useRef } from "react";
import { CameraMode, CameraType, CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Alert, Button, Pressable, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Scanner() {
  const router = useRouter();
  const { store_id, store_name, store_address } = useLocalSearchParams<{ store_id?: string; store_name?: string; store_address?: string }>();
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (!result?.data || scanned) return;
    setScanned(true);

    const barcode = result.data;
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1) {
        const product = data.product;
        const name = encodeURIComponent(product.product_name || "");
        const brand = encodeURIComponent(product.brands || "");
        const quantity = encodeURIComponent(product.quantity || "");
        const barcode = encodeURIComponent(result.data);

        router.push(`/add_item_and_location/add_item?store_id=${store_id}&store_name=${store_name}&store_address=${store_address}&name=${name}&brand=${brand}&quantity=${quantity}&barcode=${barcode}`);
      } else {
        Alert.alert("Item not found", "No product found for that barcode.");
        setScanned(false);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to fetch product data.");
      setScanned(false);
    }
  };

  if (!cameraPermission) return null;

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
