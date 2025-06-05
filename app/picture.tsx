import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams} from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


export default function show_picture() {

    const router = useRouter();

    // Parameters to keep track of store information if user selected store before navigating to the screen.
    const { photo_file } = useLocalSearchParams<{ photo_file?: string }>();
    let { store_id, store_name, store_address } = useLocalSearchParams<{ store_id?: string; store_name?: string; store_address?: string }>();

    // Shortens store name for display.
    let abbreviated_store_name = store_name;
    if (abbreviated_store_name === undefined) {
        abbreviated_store_name = "Store Location";
    } else if (abbreviated_store_name.length > 14) {
        abbreviated_store_name = abbreviated_store_name.substring(0, 12) + "..";
    }
    
    // Returns a screen showing recently taken picture from camera.
    return (
        <View style={styling.picture_area}>
            <Image source= { photo_file } style={styling.picture}/>
            <View style={{position: "absolute", top: "12.9%", left: "79%"}}>
                {/* Button to confirm image and go back to Add Page. */}
                <Pressable onPress= {() => {
                            // Sends store data if app is tracking store data from previous pages.
                            if (store_name) {
                                router.navigate(`/add_item_and_location/add_item?store_id=${store_id}
                                    &store_name=${store_name}&store_address=${store_address}&photo_file=${photo_file}`);
                            } else {
                                router.navigate(`/add_item_and_location/add_item?photo_file=${photo_file}`);
                            }
                        }
                    }
                >
                    <AntDesign name="checkcircleo" size={40.2} color="black"/>
                </Pressable>
            </View>
            {/* Button to retake image, redirects to Camera page. */}
            <View style={{position: "absolute", top: "12.9%", left: "9.96%"}}>
                <Pressable onPress = {() => {
                            if (store_name) {
                                router.push(`/camera?store_id=${store_id}&store_name=${store_name}&store_address=${store_address}`);
                            } else {
                                router.push("/camera");
                            }
                        }
                    }
                >
                    <MaterialCommunityIcons name="camera-retake-outline" size={49} color="black"/>
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