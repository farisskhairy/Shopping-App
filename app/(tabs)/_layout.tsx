import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

// Creates the tabs at the bottom of the screen throughout the whole app.
export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="live_feed_page" 
                options={{ 
                    title: 'Live Feed',
                    tabBarIcon: ({ color, focused }) => (
                        <FontAwesome6 name={focused ? 'fire-flame-curved' : 'fire-flame-curved'} color={color} size={19} />
                    )
                }} 
            />
            <Tabs.Screen
                name="add_item_and_location" 
                options={{ 
                    title: 'Add',
                    tabBarIcon: ({ color, focused }) => (
                        <FontAwesome5 name={focused ? 'plus' : 'plus'} color={color} size={20} />
                    )
                }} 
            />
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Search',
                    tabBarIcon: ({ color, focused }) => (
                        <FontAwesome5 name={focused ? 'search' : 'search'} color={color} size={19} />
                    )
                }}
            />
            <Tabs.Screen
                name="shopping_list_page"
                options={{
                    title: 'Bag',
                    tabBarIcon: ({ color, focused }) => (
                        <FontAwesome5 name={focused ? 'shopping-cart' : 'shopping-cart'} color={color} size={20} />
                    )
                }}
            />
            <Tabs.Screen
                name="auth"
                options={{ 
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <FontAwesome5 name={focused ? 'user-alt' : 'user-alt'} color={color} size={18} />
                    )
                }} 
            />
        </Tabs>
    );
}