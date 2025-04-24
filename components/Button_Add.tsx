import { StyleSheet, View, Pressable, Text } from 'react-native';

export default function Button_Add() {
    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => alert("Testing.")}>
                <Text style={styles.buttonLabel}>Add</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 423,
        height: 65
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#76c27d',
        borderRadius: 15,
        height: '100%',
        width: '100%',
        justifyContent:'center'
    },
    buttonLabel: {
        fontSize: 33,
    }
});