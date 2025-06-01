import React from 'react';
import { View, StyleSheet, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
// Imports for icons
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';


// Place to add item or store information.
export default function Add_Item_and_Location_Page() {

    const router = useRouter();

    // URL Parameters to carry data over from choose_store page.
    let { store_id, store_name, store_address } = useLocalSearchParams<{ store_id?: string; store_name?: string; store_address?: string }>();
    
    // Trim length of name of store to fit display area. ~ Will reconsider implementation soon.
    let abbreviated_store_name = store_name;
    if (abbreviated_store_name === undefined) {
        abbreviated_store_name = "Choose Store Location";
    } else if (abbreviated_store_name.length > 30) {
        store_name = abbreviated_store_name.substring(0, 28) + " ..";
    }
    
    return (
        <View style = {styling.whole_area}>
            {/* Button to select manual adding of item information. onPress prop renders manual adding buttons. */}
            <Pressable style={styling.intro_add_button} onPress= {() => {
                        if (store_name) {
                            router.push(`/add_item_and_location/add_item?store_id=${store_id}&store_name=${store_name}&store_address=${store_address}`);
                        } else {
                            router.push("/add_item_and_location/add_item");
                        }
                    }
                }
            >
                <Text style={styling.text_intro_add_button}>New Item</Text>
                <Ionicons name="sparkles-sharp" size={24} color='black'/>
            </Pressable>
            {/* Button for BARCODE SCANNING. Recommend that you use code similar to camera.tsx, but create new file for barcode scanner. */}
            <Pressable
                style={styling.intro_camera_button}
                onPress={() => {
                    const params = new URLSearchParams();
                    if (store_id) params.append("store_id", store_id);
                    if (store_name) params.append("store_name", store_name);
                    if (store_address) params.append("store_address", store_address);

                    router.push(`/scanner?${params.toString()}`);
                }}
            >
                <Text style={styling.text_intro_camera_button}>Add through Barcode</Text>
                <Entypo name="camera" size={32.4} color="black" />
            </Pressable>
            <Pressable style={styling.choose_location_button} onPress= {() => router.push("/add_item_and_location/choose_store?prev=index")}>
                <FontAwesome6 name="location-dot" size={16.42} color="black" />
                <Text style={styling.text_choose_location_button}>{ abbreviated_store_name }</Text>
            </Pressable>
        </View>
    );
    
}

const styling = StyleSheet.create({
    whole_area: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
        width: "100%"
    },
    intro_add_button: {
        width: 392,
        height: 87,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 4.7,
        borderRadius: 15.6,
        borderColor: '#72B1F5',
        marginBottom: 11.46
    },
    intro_camera_button: {
        width: 392,
        height: 87,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 4.7,
        borderRadius: 15.6,
        borderColor: '#72B1F5',
    },
    text_intro_add_button: {
        fontSize: 17.7,
        marginRight: 10.42
    },
    text_intro_camera_button: {
        fontSize: 17.7,
        marginRight: 10.76
    },
    choose_location_button: {
        position: "absolute",
        left: "17.2%",
        top: "72.76%",
        borderWidth: 2.93,
        borderRadius: 9,
        borderColor: "#d6c527",
        alignItems: "center",
        justifyContent: "center",
        height: "4.9%",
        width: "65.3%",
        flexDirection: "row",
    },
        text_choose_location_button: {
        fontSize: 17.7,
        marginLeft: "2.76%"
    }
});