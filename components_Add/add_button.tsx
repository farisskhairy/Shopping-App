import { View, Text, Pressable, StyleSheet } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';



export default function Add_Button() {
    const [intro_buttons, set_intro_buttons] = useState(true);

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
            <Pressable style={styling.outside_add_area} onPress= {(change_to_add_component)}>
                <Pressable style={styling.add_area}>
                    
                </Pressable>
            </Pressable>
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
        height: 545.85
    },
    outside_add_area: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    }
});

