import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';

const Tab = createBottomTabNavigator();

// Helper function to select icon based on route
const getIconName = (routeName, focused) => {
    const icons = {
        Home: focused ? 'home' : 'home-outline',
        Map: focused ? 'map' : 'map-outline',
    };

    return icons[routeName];
};

export default function NavBar() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionicons name={getIconName(route.name, focused)} size={size} color={color} />
                ),
                tabBarStyle: styles.tabBar,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
        </Tab.Navigator>
    );
}

const styles = {
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderTopColor: '#ddd',
        height: 80,
        paddingTop: 5,
        paddingBottom: 5,
    },
};