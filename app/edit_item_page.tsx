import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput, Text, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from "expo-image";
import { doc, setDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Fontisto from '@expo/vector-icons/Fontisto';
import AntDesign from '@expo/vector-icons/AntDesign';
import { db, storage } from "../firebaseConfig";


// Page that displays item information from database, and also allows changing of item information in database.
export default function Edit_Item_Page() {

    const router = useRouter();

    // Various URL parameters to carry over information. Quite long and tedious, but tried to use local storage, specifically AsyncStorage library
    // but that caused more issues so sticking to this right now.
    // For Steve = once barcode scanner is implemented, pass barcode information through barcode URL parameter here.
    let { name, sale_price, retail_price, brand, quantity, store_name, store_id, store_address, photo_file, upload, barcode, id } = 
        useLocalSearchParams<{ name?: string; sale_price?: string; retail_price?: string; brand?: string; quantity?: string; store_name?: string; store_id?: string; store_address?: string; photo_file?: string; upload?: string; barcode?: string; id?: string }>();

    const [item_key, set_item_key] = useState("");
    const [new_name, name_input] = useState("");
    const [new_sale_price, sale_price_input] = useState("");
    const [new_retail_price, retail_price_input] = useState("");
    const [new_brand, brand_input] = useState("");
    const [new_quantity, quantity_input] = useState("");
    const [new_store_name, store_input] = useState("");
    const [new_photo_file, photo_file_input] = useState("");
    const [new_tag, tag_input] = useState("");
    // Barcode state variable to update screen.
    const [new_barcode, barcode_input] = useState("");
    const [current_upload, start_upload]= useState<any>(null);


    useEffect(() => {

        // Gets user-taken image of item from Firebase Storage Bucket. This happens when item is being displayed after being selected from search/index page.
        async function get_image_file(item_key: any) {
            try {
                const image_url = await getDownloadURL(ref(storage, `item_photos/${item_key}`));
                photo_file_input(image_url);
            } catch (exception) {
                console.log(exception);
            }
        }

        if (photo_file === undefined) {
            get_image_file(id);
        }

        // Uploads item data to Firebase. Item is uploaded for the first time, or after being edited. If there is no item_key (id), then it
        // is being uploaded for the first time.
        async function upload_item(item_key: any) {
            try {
                if (item_key === "") {
                    item_key = doc(collection(db, "items"));
                } else {
                    item_key = doc(db, "items", item_key);
                }
                // Quite tedious, but it is current workaround for uploading between state variables and variables from URL parameter variables.
                // These two types of variables don't mix in TextInput so using this right now.
                if (current_upload === true) {
                    let upload_name: any = new_name;
                    let upload_sale_price: any = new_sale_price;
                    let upload_retail_price: any = new_retail_price;
                    let upload_brand: any = new_brand;
                    let upload_quantity: any = new_quantity;
                    let upload_store_name: any = new_store_name;
                    if (new_name === "") {
                        upload_name = name;
                    }
                    if (new_sale_price === "") {
                        upload_sale_price = sale_price;
                    }
                    if (new_retail_price === "") {
                        upload_retail_price = retail_price;
                    }
                    if (new_brand === "") {
                        upload_brand = brand;
                    }
                    if (new_quantity === "") {
                        upload_quantity = quantity;
                    }
                    if (new_store_name === "") {
                        upload_store_name = store_name;
                    }
                    await setDoc(item_key, {
                        id: item_key.id,
                        name: upload_name,
                        sale_price: upload_sale_price,
                        retail_price: upload_retail_price,
                        brand: upload_brand,
                        quantity: upload_quantity,
                        store_name: upload_store_name,
                        store_address: store_address,
                        store_id: store_id,
                        // barcode: barcode
                    },
                    {
                        merge: true 
                    });
                    alert("Item saved.");
                    start_upload(false);
                    router.setParams({
                        name: upload_name, 
                        sale_price: upload_sale_price,
                        retail_price: upload_retail_price, 
                        brand: upload_brand, 
                        quantity: upload_quantity,
                        store_name: upload_store_name, 
                        store_id: store_id, 
                        store_address: store_address, 
                        photo_file: photo_file, 
                        upload: upload,
                        id: id
                    });
                }
                // This is if item is being uploaded for the first time.
                else {
                    await setDoc(item_key, {
                        id: item_key.id,
                        name: name,
                        sale_price: sale_price,
                        retail_price: retail_price,
                        brand: brand,
                        quantity: quantity,
                        store_name: store_name,
                        store_address: store_address,
                        store_id: store_id,
                        // barcode: barcode
                    },
                    {
                        merge: true 
                    });
                    alert("Item added!");
                }
                // Uploads user-taken photo if user took a photo.
                if (photo_file) {
                    const photo_file_upload = ref(storage, `item_photos/${item_key.id}`);
                    const photo_data = await fetch(photo_file);
                    const photo_data_blob = await photo_data.blob();
                    await uploadBytes(photo_file_upload, photo_data_blob);
                    console.log("photo");
                }
            } catch (exception) {
                console.log(exception);
            }
        }
        // upload is variable passed as URL parameter variable for item being uploaded for first time, current_upload is state variable after user
        // edits item data.
        if (upload === "true" || current_upload === true) {
            if (id !== undefined) {
                upload_item(id);
                console.log("uploading");
            } else {
                upload_item("");
            }
        }
    },
    [current_upload]
    );

    return (
        <SafeAreaView style = {styling.whole_area}>
            <View style = {styling.header}>
                <Pressable onPress = { () => { router.push("/"); } }>
                    <Fontisto name="arrow-left-l" size={29.6} color="black" />
                </Pressable>
                <Pressable onPress = { () => { start_upload(true); } }>
                    <AntDesign name="checkcircleo" size={33.2} color="black"/>
                </Pressable>
                
            </View>
            <View style = {styling.edit_area}>
                <View style = {styling.item_data_area}>
                    <View style = {styling.item_data}>
                        <TextInput style={ styling.item_text } placeholder={ name } onChangeText={ name_input } value={ new_name } textAlign="center" placeholderTextColor="black"/>
                    </View>
                    <View style = {styling.item_data}>
                        <TextInput style={ styling.item_text } placeholder={ brand } onChangeText={ brand_input } value={ new_brand } textAlign="center" placeholderTextColor="black"/>
                    </View>
                    <View style = {styling.item_data}>
                        <TextInput style={ styling.item_text } placeholder={ quantity } onChangeText={ quantity_input } value={ new_quantity } textAlign="center" placeholderTextColor="black"/>
                    </View>
                    <View style = {styling.item_data}>
                        <Text style={ styling.item_text }>
                            Retail Price = $
                        </Text>
                        <TextInput style={ styling.item_text } placeholder={ retail_price } onChangeText={ retail_price_input } value={ new_retail_price } textAlign="center" placeholderTextColor="black"/>
                    </View>
                    <View style = {styling.item_data}>
                        <Text style= { styling.item_text}>
                            Sale Price = $
                        </Text>
                        <TextInput style= { styling.item_text } placeholder={ sale_price } onChangeText={ sale_price_input } value={ new_sale_price } textAlign="center" placeholderTextColor="#72B1F5"/>
                    </View>
                    <View style = {styling.item_data}>
                        <TextInput style={ styling.item_text } placeholder={ store_name } onChangeText={ store_input } value={ new_store_name } textAlign="center" placeholderTextColor="black"/>
                    </View>
                    <View style = {styling.item_data}>
                        <TextInput style={ styling.item_text } placeholder={ "Tags" } onChangeText={ name_input } value={ new_tag } textAlign="center" placeholderTextColor="black"/>
                    </View>
                    <View style = {styling.item_data}>
                        <TextInput style={ styling.item_text } placeholder={ "Barcode" } onChangeText={ name_input } value={ new_barcode } textAlign="center" placeholderTextColor="black"/>
                    </View>
                </View>
                <View style = {styling.picture_area}>
                    <Image source= { photo_file ? photo_file : new_photo_file } style={styling.picture}/>
                </View>
            </View>
        </SafeAreaView>
    );
}


const styling = StyleSheet.create({
    whole_area: {
        height: "100%",
        width: "100%",
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'column',
    },
    edit_area: {
        height: "90%",
        width: "84.85%",
        borderWidth: 9.83,
        borderColor: "white",
        borderRadius: 62,
        alignItems: 'center'
    },
    header: {
        height: "5%",
        width: "84.85%",
        borderColor: "white",
        borderRadius: 13.8,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    item_data_area: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'column',
        height: "65.6%",
        width: "100%",
        marginTop: "3%"
    },
    item_data: {
        borderWidth: 5.87,
        borderColor: "white",
        borderRadius: 62,
        height: "10.5%",
        width: "96%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    picture_area: {
        height: "34.4%",
        borderColor: "white",
        borderRadius: 62,
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    item_text: {
        fontSize: 29
    },
    picture: {
        width: "67%",
        height: "80%",
        borderRadius: 62
    }
});