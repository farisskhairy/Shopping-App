import { StyleSheet, View, Pressable, Text } from 'react-native';

export default function Enter_Info_Add() {
    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => alert("Currently implementing...")}>
                <Text style={styles.buttonLabel}>Implementing</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 423,
        height: 365,
        marginBottom: 12.5
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#ed1f29',
        borderRadius: 15,
        height: '100%',
        width: '100%',
        justifyContent:'center'
    },
    buttonLabel: {
        fontSize: 16,
    }    
})