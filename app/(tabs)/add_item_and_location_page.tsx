import { View, StyleSheet, Text } from 'react-native';
import Add_Button from '@/components_Add/add_button';
import React, { useState } from 'react';



// Place to add item or store information.
export default function Add_Item_and_Location_Page() {
    return (
        <View style={styling.add_area}>
            <Add_Button/>
        </View>
    );
}

const styling = StyleSheet.create({
    add_area: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%'
    }
});