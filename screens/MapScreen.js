import {StyleSheet, View} from "react-native";
import MapView from "react-native-maps";

export default function MapScreen() {
    return (
        <View style={styles.container}>
            <MapView style={styles.map}>

            </MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:
            '#fff',
        alignItems:
            'center',
        justifyContent:
            'center',
    },
    map: {
        width: '80%',
        height: '80%',
        borderWidth: 1,
        borderRadius: 15,
    },
});
