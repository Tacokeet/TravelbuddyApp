import React from 'react';
import { StyleSheet, Text, View, Image, Button, } from 'react-native';
import Map from "../map/Map";


export default class Modal extends React.Component {

    constructor(props) {
        super(props);


    }

    render() {
        return(
            <View>
                <Text>Here should text from the modal click on in the carousel</Text>
                <Map/>

            </View>

    )
    }

}








