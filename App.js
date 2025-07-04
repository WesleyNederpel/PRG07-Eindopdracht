import {NavigationContainer} from "@react-navigation/native";
import { ThemeProvider } from './components/ThemeContext'
import { LanguageProvider } from './components/LanguageContext'
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NavBar from './components/NavBar';
import SettingsScreen from "./screens/SettingsScreen";

export default function App() {
    const Stack = createNativeStackNavigator();

    return (
        <LanguageProvider>
            <ThemeProvider>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{headerShown: false}}>
                        <Stack.Screen name="Main" component={NavBar}/>
                        <Stack.Screen name="Settings" component={SettingsScreen}/>
                    </Stack.Navigator>
                </NavigationContainer>
            </ThemeProvider>
        </LanguageProvider>
    );
}