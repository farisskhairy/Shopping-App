import { View, StyleSheet } from 'react-native';
import Button_Add from '@/components/Button_Add';
import Enter_Info_Add from '@/components/Enter_Info_Add';

// Place to add item or store information.
export default function Add_Item_and_Location_Page() {
    return (
        <View style={styles.container}>
            <View>
                <Enter_Info_Add/>
            </View>
            <View>
                <Button_Add/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 6.5
    }
});