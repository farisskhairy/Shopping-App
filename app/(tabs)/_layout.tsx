import { Tabs } from 'expo-router';


// Creates the tabs at the bottom of the screen throughout the whole app.
export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="live_feed_page" options={{ title: 'Live Feed' }} />
            <Tabs.Screen name="add_item_and_location_page" options={{ title: 'Add' }} />
            <Tabs.Screen name="index" options={{ title: 'Search' }} />
            <Tabs.Screen name="shopping_list_page" options={{ title: 'Bag' }} />
            <Tabs.Screen name="user_account_page" options={{ title: 'Profile' }} />
        </Tabs>
    );
}