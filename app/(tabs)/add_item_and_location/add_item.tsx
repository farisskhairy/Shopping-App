import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput, Keyboard, Text, KeyboardAvoidingView } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from "expo-image";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from 'firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Checkbox from "expo-checkbox";
// Imports for icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';



export default function Add_Item() {

    const router = useRouter();

    let { store_id, store_name, store_address, photo_file } = useLocalSearchParams<{ store_id?: string; store_name?: string; store_address?: string; 
        photo_file?: string; }>();
    // Trim length of name of store to fit display area. ~ Will reconsider implementation soon.
    let abbreviated_store_name = store_name;
    if (abbreviated_store_name === undefined || abbreviated_store_name === "") {
        abbreviated_store_name = "Store Location";
    } else if (abbreviated_store_name.length > 14) {
        abbreviated_store_name = abbreviated_store_name.substring(0, 12) + "..";
    }
    // Variables to keep track of various user input.
    const { name: initName, brand: initBrand, quantity: initQuantity, barcode: incomingBarcode } = useLocalSearchParams<{
        name?: string; brand?: string; quantity?: string; barcode?: string;
      }>();

    const [name, name_input] = useState(initName || "");
    const [sale_price, sale_price_input] = useState("");
    const [retail_price, retail_price_input] = useState("");
    const [brand, brand_input] = useState(initBrand || "");
    const [quantity, quantity_input] = useState(initQuantity || "");
    const [user, setUser] = useState<any>(null);
    const [barcode, setBarcode] = useState(incomingBarcode || "");
    const [isChecked, setChecked] = useState(false);
    
    // Checks for user authentication, updates app of user's data if signed in.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUser({
                            id: currentUser.uid as string,
                            name: data.name || '',
                            photoUrl: data.photoUrl || '',
                        });
                    } else {
                        // console.warn('User profile not found');
                        // no user info found 
                        setUser({
                            id: currentUser.uid as string,
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

    // Component for picture rendering.
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
                    <MaterialIcons name="add-a-photo" size={25.15} color="white"/>
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
                            if (store_name) {
                                router.navigate({
                                    pathname: "/add_item_and_location",
                                    params: {
                                        store_name: store_name,
                                        store_id: store_id,
                                        store_address: store_address
                                    }
                                });
                            } else {
                                router.navigate({
                                    pathname: "/add_item_and_location",
                                });
                            }
                        }}
                    >
                        <Fontisto name="arrow-left-l" size={29.6} color="black" />
                    </Pressable>
                </View>
                {/* Place to enter item information. */}
                <Pressable style={styling.add_area}>
                    <TextInput style={styling.add_area_component} placeholder="Name" onChangeText={name_input} value={name} textAlign="center" 
                    placeholderTextColor="black"/>
                    <View style = {styling.choose_price_button}>
                        <View  style={styling.select_price_button}>
                            <TextInput placeholder=" Sale Price" onChangeText={sale_price_input} value={sale_price} textAlign="center" 
                            placeholderTextColor="black" inputMode = "decimal" />
                        </View>
                        <TextInput style={styling.select_price_button} placeholder=" Retail (USD)" onChangeText={retail_price_input} 
                        value={retail_price} textAlign="center" placeholderTextColor="black" inputMode = "decimal" />
                    </View>     
                    <View style = {styling.choose_price_button}>
                        <TextInput style={styling.select_price_button} placeholder="Brand" onChangeText={brand_input} value={brand} textAlign="center" 
                        placeholderTextColor="black"/>
                        <TextInput style={styling.select_price_button} placeholder="Quantity" onChangeText={quantity_input} value={quantity} textAlign="center" 
                        placeholderTextColor="black"/>
                    </View>
                </Pressable>
                <View style = { styling.picture_button_area}>
                    <Picture_Button />
                    <View style={ styling.checkbox }>
                        <Text style = { { fontSize: 20 } }>Sale?</Text>
                        <Checkbox value={isChecked} onValueChange={setChecked} />
                    </View>
                </View>
                <View style={styling.finish_add_area}>
                    <View style={styling.finish_add_button}>
                        {/* Choose Store button */}
                        <Pressable style={styling.choose_location_button} onPress= {() => {
                                    if (photo_file !== undefined) {
                                        router.push(`/add_item_and_location/choose_store?photo_file=${photo_file}&prev=add_item`);
                                    } else {
                                        router.push(`/add_item_and_location/choose_store?prev=add_item`);
                                    }
                                }
                            }
                        >
                            <FontAwesome6 name="location-dot" size={16.42} color="black" />
                            <Text style={styling.text_choose_location_button}>{ abbreviated_store_name }</Text>
                        </Pressable>
                        {/* Add Item button to complete item adding, upload data to database, and navigate to edit_item_page. */}
                        <Pressable onPress = { () => {
                                    let upload_sale_price;
                                    if (!isChecked) {
                                        upload_sale_price = retail_price;
                                    } else {
                                        upload_sale_price = sale_price;
                                    }
                                    if (user === null) {
                                        alert("Please sign in before adding.");
                                    } else if (name === "" || retail_price === "" || brand === "" || quantity === "") {
                                        alert("Please fill all information for item!");
                                    } else if (store_name === undefined) {
                                        alert("Please choose a store to select.")
                                    // Sorry for the long lines, back tick literals do not escape new lines!
                                    } else if (photo_file === undefined) {
                                        if (barcode !== ""){
                                            router.push(`/edit_item_page?name=${name}&sale_price=${upload_sale_price}&retail_price=${retail_price}&brand=${brand}&quantity=${quantity}&store_name=${store_name}&store_id=${store_id}&store_address=${store_address}&barcode=${barcode}&upload=true`);
                                        } else {
                                            router.push(`/edit_item_page?name=${name}&sale_price=${upload_sale_price}&retail_price=${retail_price}&brand=${brand}&quantity=${quantity}&store_name=${store_name}&store_id=${store_id}&store_address=${store_address}&upload=true`);
                                        }
                                    } else {
                                        if (barcode !== "") {
                                            router.push(`/edit_item_page?name=${name}&sale_price=${upload_sale_price}&retail_price=${retail_price}&brand=${brand}&quantity=${quantity}&store_name=${store_name}&store_id=${store_id}&store_address=${store_address}
                                                &barcode=${barcode}&photo_file=${photo_file}&upload=true`);
                                        } else {
                                            router.push(`/edit_item_page?name=${name}&sale_price=${upload_sale_price}&retail_price=${retail_price}&brand=${brand}&quantity=${quantity}&store_name=${store_name}&store_id=${store_id}&store_address=${store_address}&photo_file=${photo_file}&upload=true`);
                                        }
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
        width: "74%",
        height: "50%",
        alignItems: 'center',
        justifyContent: "space-around"
    },
    outside_add_area: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    add_area_component: {
        height: "27.7%",
        width: "87.7%",
        borderColor: 'white',
        borderWidth: 5.4,
        borderRadius: 16.54,
        fontSize: 23.3,
        // margin: "5%"
    },
    add_picture_button: {
        width: 60,
        height: 60,
        borderWidth: 5,
        borderColor: "white",
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "black"
    },
    finish_add_area: {
        width: "100%",
        height: "12%",
        alignItems: "center",
        justifyContent: "center"
    },
    finish_add_button: {
        borderWidth: 6.48,
        borderRadius: 13.8,
        width: "95%",
        height: "90%",
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: "row",
        borderColor: '#72B1F5',
    },
    go_back_area: {
        height: "13.2%",
        width: "100%",
        justifyContent: 'flex-end',
        alignItems: 'flex-start'
    },
    go_back_button: {
        width: "10%",
        height: "100%",
        justifyContent: 'center',
        margin: "1.4%"
    },
    picture: {
        width: "100%",
        height: "100%",
        borderRadius: 7.49
    },
    choose_price_button: {
        height: "27.7%",
        width: "85%",
        borderColor: 'white',
        borderWidth: 4.08,
        borderRadius: 16.54,
        fontSize: 23.3,
        justifyContent: 'space-evenly',
        flexDirection: "row",
        alignItems: "center",
        // marginBottom: "5%"
    },
    select_price_button: {
        justifyContent: 'center',
        alignItems: 'center',
        height: "73%",
        width: "46%",
        borderColor: 'white',
        borderWidth: 3.4,
        borderRadius: 16.54
    },
    show_picture_button: {
        borderWidth: 5,
        borderColor: "white",
        width: 50,
        height: 50,
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
    },
    picture_button_area: {
        width: "100%",
        height: "24.8%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row"
    },
    checkbox: {
        marginLeft: "5%",
        alignItems: "center",
        justifyContent: "center",
        height: 70,
        width: 70
    }
});