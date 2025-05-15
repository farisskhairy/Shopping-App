import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams} from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';



export default function show_picture() {

    const router = useRouter();

    const { photo_file } = useLocalSearchParams<{ photo_file?: string }>();
    console.log("picture page");
    // Returns a screen showing recently taken picture from camera.
    return (
        <View style={styling.picture_area}>
            <Image source= { photo_file } style={styling.picture}/>
            <View style={{position: "absolute", top: "12.9%", left: "79%"}}>
                {/* Button to go back to Add Page */}
                <Pressable onPress= {() => router.navigate(`/add_item_and_location_page?photo_file=${photo_file}`)}>
                    <AntDesign name="checkcircleo" size={40.2} color="black"/>
                </Pressable>
            </View>
            <View style={{position: "absolute", top: "12.9%", left: "9.96%"}}>
                <Pressable onPress = {() => router.push("/camera")}>
                    <AntDesign name="closecircle" size={40.2} color="black"/>
                </Pressable>
            </View> 
        </View>
    );
}

const styling = StyleSheet.create({
    picture_area: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    picture: {
        width: "100%",
        height: "100%"
    }
});