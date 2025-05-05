import React, { useState, useRef } from "react";
import { CameraMode, CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { Button, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from 'expo-router';

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

    const take_picture = async () => {
        const photo = await camera.current?.takePictureAsync();
        set_photo_file(photo?.uri);
    };

    const toggle_camera = () => {
        set_front_or_back_camera((current) => (current === "back" ? "front" : "back"));
    }

    if (!use_camera_permission) {
        return (
            <>
            </>
        );
    }

    if (!use_camera_permission.granted) {
        return (
            <>
                <Button onPress={request_camera_permission} title="Allow Camera Access"/>
            </>
        );
    }
    const show_camera = () => {
        return (
            <>
                <CameraView ref={camera} mode={mode} facing={front_or_back_camera} mute={false} style={styling.camera}>

                </CameraView>
                <View style={styling.take_picture_area}>
                    <Pressable style={styling.take_picture_button} onPress= {() => take_picture()}>
                        <MaterialIcons name="add-a-photo" size={40.15} color="white" />
                    </Pressable>
                </View>
                <View style={{position: "absolute", top: "12.9%", left: "79%"}}>
                    <Pressable onPress = {() => router.back()}>
                        <AntDesign name="closecircle" size={40.2} color="black"/>
                    </Pressable>
                </View>
            </>
        );
    };

    const show_picture = () => {
        return (
            <View style={styling.picture_area}>
                <Image source= { photo_file } style={styling.picture}/>
                <View style={{position: "absolute"}}>
                    <Button onPress={() => set_photo_file(undefined)} title="Take another picture"/>
                </View>
            </View>
        );
    }

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