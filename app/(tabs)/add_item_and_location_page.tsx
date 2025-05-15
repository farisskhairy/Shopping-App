import { View, StyleSheet } from "react-native";
// Imports khairyf's component for add buttons.
import Add_Buttons from "@/components_khairyf/add_buttons";
import { useLocalSearchParams } from 'expo-router';


// Place to add item or store information.
export default function Add_Item_and_Location_Page() {

    const { photo_file } = useLocalSearchParams<{ photo_file?: string }>();

    return (
        <View style={styling.add_area}>
            {/* khairyf's component to dynamically render add buttons. */}
            <Add_Buttons photo_file= { photo_file }/>
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