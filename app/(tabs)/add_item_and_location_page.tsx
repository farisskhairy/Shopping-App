import { View, StyleSheet } from 'react-native';
import Button_Add from '@/components/Button_Add';

// Place to add item or store information.
export default function Add_Item_and_Location_Page() {
    return (
        <View style={styles.container}>
            <View style={styles.footerContainer}>
                <Button_Add/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 6.5
    },
    footerContainer: {
        flex: 1 / 3,
        alignItems: 'center'
    }
});