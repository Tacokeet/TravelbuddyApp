import React from 'react';
import { StyleSheet, Text, View, Image, Button, } from 'react-native';
import Map from "../map/Map";


export default class Modal extends React.Component {

    constructor(props) {
        super(props);


    }

    render() {

        let open = "Closed"
        if (this.props.open) {
            open = "Open now"
        }

        return(
            <View>
                <Text>Here should text from the modal click on in the carousel</Text>


                <Text>{this.props.image}</Text>
                <Text>{this.props.name}</Text>
                <Text>{this.props.address}</Text>
                <Text>{open}</Text>
                <Map/>
            </View>

    )
    }

}








