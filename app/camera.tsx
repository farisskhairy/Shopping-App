import React, { useState, useRef } from "react";
import { CameraMode, CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { Button, Pressable, StyleSheet, View, SafeAreaView } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from 'expo-router';
// Imports for icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function camera_page() {

    const router = useRouter();

    let { store_id, store_name, store_address } = useLocalSearchParams<{ store_id?: string; store_name?: string; store_address?: string }>();

    let abbreviated_store_name = store_name;
    if (abbreviated_store_name === undefined) {
        abbreviated_store_name = "Store Location";
    } else if (abbreviated_store_name.length > 14) {
        abbreviated_store_name = abbreviated_store_name.substring(0, 12) + "..";
    }

    const [use_camera_permission, request_camera_permission] = useCameraPermissions();
    const camera = useRef<CameraView>(null);
    const [photo_file, set_photo_file] = useState<string | undefined>(undefined);
    const [mode, set_mode] = useState<CameraMode>("picture");
    const [front_or_back_camera, set_front_or_back_camera] = useState<CameraType>("back");
    const [start_camera, open_camera] = useState(false);
    
    const take_picture = async () => {
        const photo = await camera.current?.takePictureAsync();
        await camera.current?.pausePreview();
        set_photo_file(photo?.uri);
    };

    // Switch between front and back cameras.
    const toggle_camera = () => {
        set_front_or_back_camera((current) => (current === "back" ? "front" : "back"));
    };

    // Screen does not render anything when phone is currently asking for camera permission.
    if (!use_camera_permission) {
        return (
            <>
            </>
        );
    }

    // Screen renders a button to ask for camera permission.
    if (!use_camera_permission.granted) {
        return (
            <SafeAreaView>
                <Button onPress={request_camera_permission} title="Allow Camera Access"/>
            </SafeAreaView>
        );
    }

    // Screen opens camera to take pictures.
    const show_camera = () => {
        return (
            <>
                {/* Component that represents the camera. */}
                <CameraView ref={camera} mode={mode} facing={front_or_back_camera} mute={false} style={styling.camera}>

                </CameraView>
                {/* Button to take a picture. */}
                <View style={styling.take_picture_area}>
                    <Pressable style={styling.take_picture_button} onPress= {() => take_picture()}>
                        <MaterialIcons name="add-a-photo" size={40.15} color="white" />
                    </Pressable>
                </View>
                {/* Button to close camera. */}
                <View style={{position: "absolute", top: "12.9%", left: "79%"}}>
                    <Pressable onPress = {() => router.back()}>
                        <AntDesign name="closecircle" size={40.2} color="black"/>
                    </Pressable>
                </View>
            </>
        );
    };

    // Screen that shows picture taken by camera.
    const show_picture = () => {
        return (
            
            <View style={styling.picture_area}>
                {/* Component that shows the picture taken. */}
                <Image source= { photo_file } style={styling.picture}/>
                {/* Button that saves picture and returns to Add Page. */}
                <View style={{position: "absolute", top: "12.9%", left: "79%"}}>
                    <Pressable onPress= { () => {
                                if (store_name) {
                                    router.navigate(`/add_item_and_location/add_item?store_id=${store_id}&store_name=${store_name}&store_address=${store_address}&photo_file=${photo_file}`);
                                } else {
                                    router.navigate(`/add_item_and_location/add_item?photo_file=${photo_file}`);
                                }
                            }
                        }   
                    >
                        <AntDesign name="checkcircleo" size={40.2} color="black"/>
                    </Pressable>
                </View>
                {/* Button that deletes picture and re-opens camera. */}
                <View style={{position: "absolute", top: "12.9%", left: "9.96%"}}>
                    <Pressable 
                        onPress = {() => { 
                            set_photo_file(undefined);
                            camera.current?.resumePreview();
                        }}
                    >
                        <AntDesign name="closecircle" size={40.2} color="black"/>
                    </Pressable>
                </View>
            </View>
        );
    }

    // Renders either picture taken or opens camera to take pictures, depending on whether a photo is saved or not.
    return (
        photo_file ? show_picture() : show_camera()
    );
}

const styling = StyleSheet.create({
    camera: {
        width: "100%", 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    take_picture_area: {
        position: "absolute",
        top: "73.3%",
        left: "40%"
    },
    take_picture_button: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "black",
    },
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