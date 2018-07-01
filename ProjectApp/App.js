import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';

import Header from './header/Header';
import City from './city/City';
import Places from './places/Places';
import Modal from './modal/Modal';
import User from './user/User'
import Login from './login/Login'
import Search from './search/Search'

import axios from 'axios';
import logo from './images/logo.png';

import Icon from 'react-native-vector-icons/FontAwesome';
import BottomNavigation, {
    FullTab
} from 'react-native-material-bottom-navigation'
import Map from "./map/Map";


class App extends React.Component {
    state = {
        results: [],
        categories: ['Bar'],
        querySet: false,
        range: "5000",
        activeTab: 'home',
        username: "",
        loggedIn: false,
        loginStatus: "Not logged in",
    }

    constructor(props) {
        super(props)

        fetch('http://10.0.2.2:5000/api/loginCheck')
            .then((response) => response.json())
            .then((responseJson)=> {
                if (responseJson['username'] != null) {
                    this.setState({
                        username: responseJson['username'],
                        loggedIn: true,
                    })
                }
                if(this.state.loggedIn) {
                    let url = "http://10.0.2.2:5000/api/user/preferences";
                    axios.get(url)
                        .then(response => {
                                if(response.data) {
                                    if(JSON.stringify(response.data) === '{}') {
                                        this.setDefaultCategories();
                                    }
                                    else {
                                        let temp = [];
                                        for (var key in response.data) {
                                            temp.push(key)
                                        }
                                        this.setState({
                                            categories: temp
                                        })
                                    }
                                }
                                else {
                                    this.setState({
                                        categories: ['restaurant', 'bar']
                                    })

                                }
                            });
                } else {
                    this.setState({
                        categories: ['restaurant', 'bar']
                    })
                }
            }).catch((error) => {
            console.log(error)
        })
    }

    setDefaultCategories() {
        this.setState({
            categories: ['restaurant', 'bar']
        })
    }


    tabs = [
        {
            key: 'home',
            icon: 'home',
            label: 'Home',
            barColor: '#ff922b',
            pressColor: 'rgba(255, 255, 255, 0.16)'
        },
        {
            key: 'search',
            icon: 'search',
            label: 'Search',
            barColor: '#ff922b',
            pressColor: 'rgba(255, 255, 255, 0.16)'
        },
        {
            key: 'login',
            icon: 'user',
            label: "Profile",
            barColor: '#ff922b',
            pressColor: 'rgba(255, 255, 255, 0.16)'
        }
    ]

    componentDidMount() {


        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    gpsLatitude: position.coords.latitude,
                    gpsLongitude: position.coords.longitude,
                    error: null,
                });
            },
            (error) => this.setState({ error: error.message }),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );

        let proxy  = 'https://cors-anywhere.herokuapp.com/';
        fetch('http://api.ipstack.com/check?access_key=201a9fbb71fcb2b3195f6626795b5907')
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    isLoading: false,
                    countryName: responseJson.country_name,
                    regionName: responseJson.region_name,
                    city: responseJson.city,
                    name: responseJson.location.languages[0].name,
                    countryFlag: responseJson.location.country_flag,
                    callingCode: responseJson.location.calling_code,
                    longitude: responseJson.longitude,
                    latitude: responseJson.latitude
                }, function(){

                });
                if (this.state.gpsLongitude){
                    this.setState({
                        latitude: this.state.gpsLatitude,
                        longitude: this.state.gpsLongitude
                    })
                }
                let places = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='
                    + this.state.latitude + ',' + this.state.longitude;
                this.setState({
                    query: places,
                    querySet: true
                });

                let locationURL  =  'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.state.latitude + ',' + this.state.longitude + '&key=AIzaSyCRNHsASJT7nxChb3zBLeH2hGJdZGMIZGQ';
                fetch(locationURL)
                    .then((location) => location.json())
                    .then((locationJson) => {
                        this.setState({gpsCity: locationJson.results[0].address_components[3].long_name})
                        if (this.state.gpsCity){
                            this.setState({
                                city: this.state.gpsCity
                            })
                        }
                    });

            }).catch((error) => {
            console.error(error);
        });

    }

    handleClick = () => {
        this.setState({
            show: !this.state.show
        });
    };



    modalHandler = (name, image, address, open, lat, lng, id) => {
        console.log('modalHandler Clicked')
        this.setState({
            showModal: true,
            modalName: name,
            modalImage: image,
            modalAddress: address,
            modalOpen: open,
            modalLat: lat,
            modalLng: lng,
            modalId: id,
        })

    };

    hideModal = () => {
        this.setState({showModal: false})
    };

    setStatus = (status) => {
        if (status === "Uitloggen") {
            this.setState({
                loginStatus: "home",
                activeTab: "home",
                categories: ["restaurant", "bar"],
                loggedIn: false,
            })
        } else {
            this.setState({
                loginStatus: "Logged in",
                activeTab: "profile",
                loggedIn: true,
            })
            this.getUserCategories()
        }
    };

    setModal = (modalStatus) => {
        if (modalStatus === "modal") {
            this.setState({
                activeTab: "modal",
            })
        } else {
            this.setState({
                activeTab: "home",
            })
        }
    };


    getUserCategories() {
        let url = "http://10.0.2.2:5000/api/user/preferences";
        axios.get(url)
            .then(response => {
                let temp = [];
                for (var key in response.data) {
                    temp.push(key)
                }
                this.setState({
                    categories: temp
                })

            });
    }

    compareCategories(preference, currentCategories) {
        let temp = [];
        let inArray = 0;
        for (var i = 0; i < currentCategories.length; i++) {
            if (currentCategories[i] == preference) {
                currentCategories.splice(i, 1)
                inArray++;
            }
        }
        if (inArray === 0) {
            currentCategories.push(preference)
        }
    }

    render() {

        let map = null;
        map = <Map
            piet={this.state.range}
            latitude={this.state.latitude}
            longitude={this.state.longitude}
        />;

        let modal = null;
        modal = <Modal
            click={this.hideModal}
            image = {this.state.modalImage}
            name = {this.state.modalName}
            address={this.state.modalAddress}
            open = {this.state.modalOpen}
            lat = {this.state.modalLat}
            lng = {this.state.modalLng}
            id = {this.state.modalId}
            latitude = {this.state.latitude}
            longitude = {this.state.longitude}
            currentLat = {this.state.latitude}
            currentLng = {this.state.longitude}
        />;

        let viewModal = null;
        if(this.state.showModal){
            viewModal = <Modal
                click={this.hideModal}
                image = {this.state.modalImage}
                name = {this.state.modalName}
                address={this.state.modalAddress}
                open = {this.state.modalOpen}
                lat = {this.state.modalLat}
                lng = {this.state.modalLng}
                id = {this.state.modalId}
                latitude = {this.state.latitude}
                longitude = {this.state.longitude}
                currentLat = {this.state.latitude}
                currentLng = {this.state.longitude}
            />
        }

        if(!this.state.querySet) {
            return (
                <View style={{flex: 1}}>
                    <ScrollView>
                        <View>
                            <Header />
                            <City
                                city={this.state.city}
                                wikitext={this.state.text}
                                country_flag={this.state.countryFlag}
                                callingCode={this.state.callingCode}
                                region={this.state.regionName}
                                country={this.state.countryName}
                            />
                        </View>
                    </ScrollView>
                </View>
            )
        }

        return (
            <View style={{flex: 1}}>
                <ScrollView>
                    <View>
                        <Header status={this.state.loginStatus} />
                        {this.renderScreen()}
                    </View>
                </ScrollView>
                <View style={styles.navigation}>
                    <BottomNavigation
                        onTabPress={newTab => this.setState({ activeTab: newTab.key })}
                        renderTab={this.renderTab}
                        tabs={this.tabs}
                    />
                </View>
            </View>
        );
    }

    renderScreen = () => {
        if (this.state.activeTab === 'home') {


            return (
                <View>
                    <View style={styles.logo}>
                        <Image source={logo}/>
                    </View>
                    <City
                        city={this.state.city}
                        wikitext={this.state.text}
                        country_flag={this.state.countryFlag}
                        callingCode={this.state.callingCode}
                        region={this.state.regionName}
                        country={this.state.countryName}
                    />
                    <View style={styles.placesContainer}>
                        {this.state.categories.map((category,index) => {
                            return <Places
                                modalHandler={this.modalHandler}
                                func={this.setModal}
                                cat={category}
                                query={this.state.query}
                                key={index}
                            />
                        })}
                    </View>
                </View>

            )
        } else if (this.state.activeTab === 'profile') {
            return <User func={this.setStatus} compare={this.compareCategories} cat={this.state.categories}/>
        } else if (this.state.activeTab === 'login') {
            if (!this.state.loggedIn) {
                return <Login func={this.setStatus} />
            } else {
                return <User func={this.setStatus} compare={this.compareCategories} cat={this.state.categories} />
            }
        } else if (this.state.activeTab === 'search') {
            return <Search />
        } else if (this.state.activeTab === 'map') {
            return <Map />
        } else if (this.state.activeTab === 'modal') {
            return <Modal />
        }

    }

    renderTab = ({ tab, isActive }) => {
        return (

            <FullTab
                key={tab.key}
                isActive={isActive}
                label={tab.label}
                renderIcon={this.renderIcon(tab.icon)}
            />

        )
    }

    renderIcon = icon => ({ isActive }) => (
        <Icon size={24} color="white" name={icon} />
    )

}

const styles = StyleSheet.create({
    placesContainer: {
        marginBottom: 75,
    },
    navigation: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default App;