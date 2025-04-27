import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';


export default function Add_Button() {
    const [intro_buttons, set_intro_buttons] = useState(true);
    
    const [name, name_input] = useState("");
    const [price, price_input] = useState("");
    const [brand, brand_input] = useState("");
    const [quantity, quantity_input] = useState("");

    function change_to_add_component() {
        set_intro_buttons(!intro_buttons);
    }

    if (intro_buttons) {
        return (
            <View>
                <Pressable style={styling.intro_add_button} onPress= {change_to_add_component}>
                    <Text style={styling.text_intro_add_button}>New Item</Text>
                    <Ionicons name="sparkles-sharp" size={24} color='black'/>
                </Pressable>
                <Pressable style={styling.intro_camera_button} onPress= {() => { alert("Currently implementing..."); }}>
                    <Text style={styling.text_intro_camera_button}>Add through Barcode</Text>
                    <Entypo name="camera" size={32.4} color='black'/>
                </Pressable>
            </View>
            
        );
    } else {
        return (
            <View>
                <Pressable style={styling.outside_add_area}>
                    <View style={styling.go_back_area}>
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
                    <Pressable style={styling.add_picture_button} onPress= {() => { alert("Currently implementing..."); }}>
                        <MaterialIcons name="add-a-photo" size={40.15} color="white" />
                    </Pressable>
                    <View style={styling.finish_add_area}>
                        <Pressable style={styling.finish_add_button} onPress= {() => { alert("Currently implementing..."); }}>
                            <Fontisto name="arrow-right-l" size={54.3} color="black" />
                        </Pressable>
                    </View>
                </Pressable>
            </View>
        );
    }
}


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
    }
});

