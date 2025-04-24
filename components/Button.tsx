import { StyleSheet, View, Pressable, Text } from 'react-native';

type Props = {
    label: string;

};

export default function Button({ label }: Props) {
    return (
        <View>
            <Pressable onPress={() => alert("Hi.")}>
                <Text>{label}</Text>
            </Pressable>
        </View>
    )
}