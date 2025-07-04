import {Pressable, StyleSheet, useColorScheme} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ListScreen from '../screens/ListScreen';
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const Tab = createBottomTabNavigator();

// Helper function to select icon based on route
const getIconName = (routeName, focused) => {
    const icons = {
        Home: focused ? 'home' : 'home-outline',
        List: focused ? 'list' : 'list-outline',
        Map: focused ? 'map' : 'map-outline',
    };

    return icons[routeName];
};

export default function NavBar({navigation}) {
    const { darkMode } = useContext(ThemeContext);

    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => (
                    <Ionicons name={getIconName(route.name, focused)} size={size} color={color}/>
                ),
                tabBarStyle: [styles.tabBar, darkMode ? styles.darkTabBar : null],
                tabBarActiveTintColor: darkMode ? '#81b0ff' : '#007AFF',
                tabBarInactiveTintColor: darkMode ? '#888' : '#888',
                headerStyle: [styles.header, darkMode ? styles.darkHeader : null],
                headerTitleStyle: darkMode ? styles.darkHeaderTitle : null,
                headerRight: () => (
                    <Pressable
                        onPress={() => {
                            navigation.navigate('Settings');
                        }}
                        style={({pressed}) => [
                            {
                                marginRight: 15,
                                opacity: pressed ? 0.7 : 1
                            }
                        ]}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={24}
                            color={darkMode ? "#fff" : "black"}
                        />
                    </Pressable>
                )
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen}/>
            <Tab.Screen name="List" component={ListScreen} options={{
                tabBarLabel: 'Boulderhalls',
                headerTitle: 'Boulderhalls'
            }}
            />
            <Tab.Screen name="Map" component={MapScreen}/>
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderTopColor: '#ddd',
        height: 80,
        paddingTop: 5,
        paddingBottom: 5,
    },
    darkTabBar: {
        backgroundColor: '#1f1f1f',
        borderTopColor: '#333',
    },
    header: {
        backgroundColor: '#fff',
    },
    darkHeader: {
        backgroundColor: '#1f1f1f',
    },
    darkHeaderTitle: {
        color: '#fff',
    }
});