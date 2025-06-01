import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, Text, Pressable, Keyboard, FlatList } from "react-native";
import * as Location from "expo-location";
import { fetch } from "expo/fetch";
import Fontisto from '@expo/vector-icons/Fontisto';



export default function Choose_Store() {

    // URL Parameter to carry over user-taken photo file.
    let { photo_file, prev } = useLocalSearchParams<{ photo_file?: string; prev?: string }>();

    // API Key for Google Places API.
    const google_places_api_key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

    const router = useRouter();

    // User GPS Location object from Expo's Location library.
    const [current_gps_location, set_gps_location] = useState<Location.LocationObject | null>(null);
    // Data retrieved from Places API.
    const [nearby_stores, update_nearby_stores] = useState<any>(null);


    useEffect(() => {
            // Async function to get user's GPS location and search nearby stores using Places API.
            async function get_nearby_stores() {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    return;
                }
                const user_location = await Location.getCurrentPositionAsync({});
                const incoming_data = await fetch(
                    `https://places.googleapis.com/v1/places:searchNearby?key=${google_places_api_key}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Goog-FieldMask": "places.displayName,places.id,places.formattedAddress,places.location"
                        },
                        body: JSON.stringify(
                            {
                                "includedTypes": ["grocery_store", "supermarket"],
                                "maxResultCount": 10,
                                "rankPreference": "DISTANCE",
                                "locationRestriction":
                                    {
                                        "circle": {
                                            "center": 
                                                {
                                                    "latitude": user_location.coords.latitude,
                                                    "longitude": user_location.coords.longitude
                                                },
                                            "radius": 50000
                                        }
                                    }
                            }
                        ),
                    }
                );
                const data = await incoming_data.json();
                set_gps_location(user_location);
                update_nearby_stores(data["places"]);
            }
            get_nearby_stores();
        },
        []
    );


    return (
        <Pressable style = { styling.outside_store_page_area } onPress = {Keyboard.dismiss}>
            <View style={styling.go_back_area}>
                <Pressable style={styling.go_back_button} onPress= {() => router.back()}>
                    <Fontisto name="arrow-left-l" size={29.6} color="black" />
                </Pressable>
            </View>
            <View style = { styling.search_area }>

            </View>
            <View style = { styling.store_page_area }>
                <FlatList
                    data={ nearby_stores }
                    renderItem = { ({item}) => (
                        <Pressable style = { styling.store } onPress = {() => {
                            // Returns back to previous screen, with information added as parameters.
                            if (prev === "index") {
                                 prev = "";
                            }
                            if (photo_file !== undefined) {
                                router.navigate({
                                    // ts-ignore used to ignore type error from pathname (external library has error)
                                    // @ts-ignore
                                    pathname: `/add_item_and_location/${prev}`,
                                    params: {
                                        store_id: item.id as string,
                                        store_name: item.displayName.text,
                                        store_address: item.formattedAddress,
                                        photo_file: photo_file
                                    }
                                });
                            } else {
                                router.navigate({
                                    // ts-ignore used to ignore type error from pathname (external library has error)
                                    // @ts-ignore
                                    pathname: `/add_item_and_location/${prev}`,
                                    params: {
                                        store_id: item.id as string,
                                        store_name: item.displayName.text,
                                        store_address: item.formattedAddress,
                                    }
                                });
                            }
                        }}>
                            <Text style = { styling.store_name }>
                                {item.displayName.text}
                            </Text>
                            <Text style = { styling.store_location }>
                                {item.formattedAddress}
                            </Text>
                        </Pressable>
                    )}
                    keyExtractor = { item => item.id }
                />
            </View>
        </Pressable>
    );

}

const styling = StyleSheet.create({
    outside_store_page_area: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: "100%",
        width: "100%",
    },
    store_page_area: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: "72.79%",
        width: "88.6%",
        borderWidth: 9.83,
        borderColor: "white",
        borderRadius: 13.8
    },
    search_area: {
        height: "8.78%",
        width: "88.6%",
        borderWidth: 9.83,
        borderColor: "white",
        borderRadius: 13.8,
        marginBottom: "5%"
    },
    go_back_button: {
        marginLeft: "5.65%"
    },
    go_back_area: {
        alignItems: 'flex-start',
        marginBottom: "3.9%",
        width: "100%",
        height: "4.5%",
    },
    store: {
        borderBottomWidth: 3.176,
        borderBottomColor: "#72B1F5",
        paddingTop: "3%"
    },
    store_name: {
        paddingLeft: "3%",
        fontSize: 24
    },
    store_location: {
        paddingLeft: "3%",
        paddingBottom: "2.7%",
        fontSize: 12,
        color: "#1427b5"
    }
});