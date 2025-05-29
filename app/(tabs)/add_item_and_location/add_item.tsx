import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput, Keyboard, Text } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from "expo-image";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from 'firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
// Imports for icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';



export default function Add_Item() {

    const router = useRouter();

    let { store_id, store_name, store_address, photo_file } = useLocalSearchParams<{ store_id?: string; store_name?: string; store_address?: string; photo_file?: string }>();

    // Trim length of name of store to fit display area. ~ Will reconsider implementation soon.
    let abbreviated_store_name = store_name;
    if (abbreviated_store_name === undefined) {
        abbreviated_store_name = "Store Location";
    } else if (abbreviated_store_name.length > 14) {
        abbreviated_store_name = abbreviated_store_name.substring(0, 12) + "..";
    }

    // Variables to keep track of various user input.
    const [name, name_input] = useState("");
    const [sale_price, sale_price_input] = useState("");
    const [retail_price, retail_price_input] = useState("");
    const [brand, brand_input] = useState("");
    const [quantity, quantity_input] = useState("");
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUser({
                            name: data.name || '',
                            photoUrl: data.photoUrl || '',
                        });
                    } else {
                        // console.warn('User profile not found');
                        // no user info found 
                        setUser({
                            name: currentUser.displayName || '',
                            photoUrl: currentUser.photoURL || '',
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile', error);
                }
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    function Picture_Button() {
        if (photo_file !== undefined) {
            return (
                // Renders mini preview of picture, opens full sized picture when clicked.
                <Pressable style={styling.show_picture_button} onPress= {() => { 
                        if (store_name) {
                            router.push(`/picture?store_id=${store_id}&store_name=${store_name}&store_address=${store_address}&photo_file=${photo_file}`)
                        } else {
                            router.push(`/picture?photo_file=${photo_file}`)
                        }
                        }
                    }
                >
                    <Image source = { photo_file } style={styling.picture}/>
                </Pressable>
            );
        } else {
            return (
                // Opens camera to take pictures.
                <Pressable style={styling.add_picture_button} onPress= {() => {
                            if (store_name) {
                                router.push(`/camera?store_id=${store_id}&store_name=${store_name}&store_address=${store_address}`);
                            } else {
                                router.push("/camera");
                            }
                        }
                    }
                >
                    <MaterialIcons name="add-a-photo" size={40.15} color="white"/>
                </Pressable>
            );
        }
    }


    return (
        <View>
            <Pressable style={styling.outside_add_area} onPress={Keyboard.dismiss}>
                <View style={styling.go_back_area}>
                    {/* Button to go back to intro add buttons. onPress prop renders intro add buttons and
                    resets user input information when going back to intro add button screen. */}
                    <Pressable style={styling.go_back_button}
                        onPress= {() => {
                            name_input("");
                            sale_price_input("");
                            retail_price_input("");
                            brand_input("");
                            quantity_input("");
                            // Goes back to previous screen, sets parameters with information to be carried over.
                            router.back();
                            if (store_name) {
                                router.setParams({
                                store_name: store_name,
                                store_id: store_id,
                                store_address: store_address
                            });
                            }
                        }}
                    >
                        <Fontisto name="arrow-left-l" size={29.6} color="black" />
                    </Pressable>
                </View>
                <Pressable style={styling.add_area}>
                    <TextInput style={styling.add_area_component} placeholder="Name" onChangeText={name_input} value={name} textAlign="center" placeholderTextColor="black"/>
                    <View style = {styling.choose_price_button}>
                        <TextInput style={styling.select_price_button} placeholder=" Sale Price" onChangeText={sale_price_input} value={sale_price} textAlign="center" placeholderTextColor="black" inputMode = "decimal" />
                        <TextInput style={styling.select_price_button} placeholder=" Retail (USD)" onChangeText={retail_price_input} value={retail_price} textAlign="center" placeholderTextColor="black" inputMode = "decimal" />
                    </View>                    
                    <TextInput style={styling.add_area_component} placeholder="Brand" onChangeText={brand_input} value={brand} textAlign="center" placeholderTextColor="black"/>
                    <TextInput style={styling.add_area_component} placeholder="Quantity" onChangeText={quantity_input} value={quantity} textAlign="center" placeholderTextColor="black"/>
                </Pressable>

                <Picture_Button />

                <View style={styling.finish_add_area}>
                    <View style={styling.finish_add_button}>
                        {/* Choose Store button */}
                        <Pressable style={styling.choose_location_button} onPress= {() => {
                                    if (photo_file !== undefined) {
                                        router.push(`/add_item_and_location/choose_store?photo_file=${photo_file}`);
                                    } else {
                                        router.push(`/add_item_and_location/choose_store`);
                                    }
                                }
                            }
                        >
                            <FontAwesome6 name="location-dot" size={16.42} color="black" />
                            <Text style={styling.text_choose_location_button}>{ abbreviated_store_name }</Text>
                        </Pressable>
                        {/* Add Item button to complete item adding, upload data to database, and navigate to edit_item_page. */}
                        <Pressable onPress = { () => {
                                    if (user === null) {
                                        alert("Please sign in before adding.");
                                    } else if (name === "" || sale_price === "" || retail_price === "" || brand === "" || quantity === "") {
                                        alert("Please fill all information for item!");
                                    } else if (store_name === undefined) {
                                        alert("Please choose a store to select.")
                                    } else if (photo_file === undefined) {
                                        router.push(`/edit_item_page?name=${name}&sale_price=${sale_price}&retail_price=${retail_price}&brand=${brand}&quantity=${quantity}&store_name=${store_name}&store_id=${store_id}&store_address=${store_address}&upload=true`);
                                    } else {
                                        router.push(`/edit_item_page?name=${name}&sale_price=${sale_price}&retail_price=${retail_price}&brand=${brand}&quantity=${quantity}&store_name=${store_name}&store_id=${store_id}&store_address=${store_address}&photo_file=${photo_file}&upload=true`);
                                    }
                                }
                            }
                        >
                            <Fontisto name="arrow-right-l" size={54.3} color="black" />
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        </View>
    );
}



const styling = StyleSheet.create({
    add_area: {
        borderColor: 'white',
        borderWidth: 6.48,
        borderRadius: 13.8,
        width: 383,
        height: 426,
        alignItems: 'center',
        marginBottom: 22.75
    },
    outside_add_area: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    add_area_component: {
        height: 87,
        width: 334,
        borderColor: 'white',
        borderWidth: 5.4,
        borderRadius: 16.54,
        margin: 13,
        marginBottom: 0,
        fontSize: 23.3,
    },
    add_picture_button: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "black"
    },
    finish_add_area: {
        height: 47.4
    },
    finish_add_button: {
        borderWidth: 6.48,
        borderRadius: 13.8,
        width: 383,
        height: 87,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: "row",
        marginTop: 31.9,
        borderColor: '#72B1F5',
    },
    go_back_area: {
        height: 0,
        width: 383,
        justifyContent: 'flex-end',
        alignItems: 'flex-start'
    },
    go_back_button: {
        width: 79,
        height: 87,
        justifyContent: 'center'
    },
    picture: {
        width: "100%",
        height: "100%",
        borderRadius: 7.49
    },
    price_button: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: 87,
        width: 334,
        borderColor: 'white',
        borderWidth: 5.4,
        borderRadius: 16.54,
        margin: 13,
        marginBottom: 0,
        fontSize: 23.3
    },
    choose_price_button: {
        height: 87,
        width: 334,
        borderColor: 'white',
        borderWidth: 4.08,
        borderRadius: 16.54,
        margin: 13,
        marginBottom: 0,
        fontSize: 23.3,
        justifyContent: 'space-evenly',
        flexDirection: "row",
        alignItems: "center"
    },
    select_price_button: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 71.3,
        width: 148.6,
        borderColor: 'white',
        borderWidth: 3.4,
        borderRadius: 16.54
    },
    show_picture_button: {
        width: 78,
        height: 78,
        justifyContent: 'center',
        alignItems: 'center',
    },
    choose_location_button: {
        borderWidth: 2.93,
        borderRadius: 9,
        borderColor: "#d6c527",
        alignItems: "center",
        justifyContent: "center",
        height: "89.9%",
        width: "38.99%",
        flexDirection: "row",
        marginLeft: "1.59%",
        marginRight: "31.8%"
    },
    text_choose_location_button: {
        fontSize: 17.7,
        marginLeft: "2.76%"
    }
});