import React, { useState, useRef } from "react";
import { CameraMode, CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { Button, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter, Link } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
// Imports for icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function camera_page() {

    const router = useRouter();

    const [use_camera_permission, request_camera_permission] = useCameraPermissions();
    const camera = useRef<CameraView>(null);
    const [photo_file, set_photo_file] = useState<string | undefined>(undefined);
    const [mode, set_mode] = useState<CameraMode>("picture");
    const [front_or_back_camera, set_front_or_back_camera] = useState<CameraType>("back");
    const [start_camera, open_camera] = useState(false);
    
    // Takes a picture from camera, and saves it to local storage cache. Uses AsyncStorage library for local storage.
    const take_picture = async () => {
        const photo = await camera.current?.takePictureAsync();
        set_photo_file(photo?.uri);
        try {
            await AsyncStorage.setItem("picture_file", photo!.uri);
        } catch (error) {
            return;
        }
    };

    // Deletes picture from local storage cache.
    async function delete_picture() {
        try {
            await AsyncStorage.removeItem("picture_file");
        } catch (error) {
            return;
        }
    }

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
            <>
                <Button onPress={request_camera_permission} title="Allow Camera Access"/>
            </>
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
                    <Pressable onPress= {() => router.navigate("/add_item_and_location_page") }>
                        <AntDesign name="checkcircleo" size={40.2} color="black"/>
                    </Pressable>
                </View>
                {/* Button that deletes picture and re-opens camera. */}
                <View style={{position: "absolute", top: "12.9%", left: "9.96%"}}>
                    <Pressable 
                        onPress = {() => { 
                            set_photo_file(undefined);
                            delete_picture();
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