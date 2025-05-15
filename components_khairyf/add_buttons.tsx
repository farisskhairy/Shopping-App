import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Keyboard} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Image } from "expo-image";
// Imports for icons
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';


const router = useRouter();

type Props = {
    photo_file: string | undefined;
}

export default function Add_Buttons(props: Props) {


    // Variables to determine which add buttons to be rendered.
    const [intro_buttons, set_intro_buttons] = useState(true);
    // Variables to keep track of various user input.
    const [name, name_input] = useState("");
    const [price, price_input] = useState("");
    const [brand, brand_input] = useState("");
    const [quantity, quantity_input] = useState("");

    // Function to switch rendering of the different add buttons.
    function change_to_add_component() {
        set_intro_buttons(!intro_buttons);
    }

    // Component that renders either a button to open camera, or a button that is a mini preview of recently taken picture.
    function Picture_Button() {
        if (props.photo_file !== undefined) {
            return (
                // Renders mini preview of picture, opens full sized picture when clicked.
                <Pressable style={styling.add_picture_button} onPress= {() => router.push(`/picture?photo_file=${props.photo_file}`)}>
                    <Image source = { props.photo_file } style={styling.picture}/>
                </Pressable>
            );
        } else {
            return (
                // Opens camera to take pictures.
                <Pressable style={styling.add_picture_button} onPress= {() => router.push("/camera")}>
                    <MaterialIcons name="add-a-photo" size={40.15} color="white"/>
                </Pressable>
            );
        }
    }

    // Renders the introduction add buttons - selecting between manual adding or scanning barcode.
    if (intro_buttons) {
        return (
            <View>
                {/* Button to select manual adding of item information. onPress prop renders manual adding buttons. */}
                <Pressable style={styling.intro_add_button} onPress= {change_to_add_component}>
                    <Text style={styling.text_intro_add_button}>New Item</Text>
                    <Ionicons name="sparkles-sharp" size={24} color='black'/>
                </Pressable>
                <Pressable style={styling.intro_camera_button} onPress= {() => router.push("/camera")}>
                    <Text style={styling.text_intro_camera_button}>Add through Barcode</Text>
                    <Entypo name="camera" size={32.4} color='black'/>
                </Pressable>
            </View>
        );
    // Renders the add buttons when choosing manual adding of items.
    } else {
        return (
            <View>
                <Pressable style={styling.outside_add_area} onPress={Keyboard.dismiss}>
                    <View style={styling.go_back_area}>
                        {/* Button to go back to intro add buttons. onPress prop renders intro add buttons and
                        resets user input information when going back to intro add button screen. */}
                        <Pressable style={styling.go_back_button}
                            onPress= {() => {
                                change_to_add_component();
                                name_input("");
                                price_input("");
                                brand_input("");
                                quantity_input("");
                            }}
                        >
                            <Fontisto name="arrow-left-l" size={29.6} color="black" />
                        </Pressable>
                    </View>
                    <Pressable style={styling.add_area}>
                        <TextInput style={styling.add_area_component} placeholder="Name" onChangeText={name_input} value={name} textAlign="center" placeholderTextColor="black"/>
                        <TextInput style={styling.add_area_component} placeholder="Price" onChangeText={price_input} value={price} textAlign="center" placeholderTextColor="black"/>
                        <TextInput style={styling.add_area_component} placeholder="Brand" onChangeText={brand_input} value={brand} textAlign="center" placeholderTextColor="black"/>
                        <TextInput style={styling.add_area_component} placeholder="Quantity" onChangeText={quantity_input} value={quantity} textAlign="center" placeholderTextColor="black"/>
                    </Pressable>

                    {/* <Picture_Button/> */}
                    <Picture_Button />

                    {/* Working .. */}
                    <View style={styling.finish_add_area}>
                        <Link href="/live_feed_page" asChild>
                            <Pressable style={styling.finish_add_button}>
                                <Fontisto name="arrow-right-l" size={54.3} color="black" />
                            </Pressable>
                        </Link>
                    </View>
                </Pressable>
            </View>
        );
    }
}

// Style data for various shapes displayed on screen.
const styling = StyleSheet.create({
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
        height: 47.4,
    },
    finish_add_button: {
        borderWidth: 6.48,
        borderRadius: 13.8,
        width: 383,
        height: 87,
        justifyContent: 'center',
        alignItems: 'center',
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
        height: "100%"
    }
});

