import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { getRhumbLineBearing, getDistance } from 'geolib';
import { Audio } from 'expo-av';
import React from 'react';
import * as Location from "expo-location";
import config from '../assets/config';
import data from '../data/data'

const NAME = "Play"
const SOUNDS = {
  "oak": require('../assets/sound/entity/oak.wav'),
  "pine": require('../assets/sound/entity/pine.wav'),
  "chestnut": require('../assets/sound/entity/chestnut.wav'),
  "gravel": require('../assets/sound/field/gravel.wav'),
  "grass": require('../assets/sound/field/grass.wav'),
  "water": require('../assets/sound/field/water.wav')
}

export default class Play extends React.Component{

  state = {
    errorMessage: "",
    location: {latitude:0, longitude:0},
    orientation: 0,
  }

  mute = false

  _getLocation = async () => {

    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted"){
      this.setState({
          errorMessage: "PERMISSION NOT GRANTED"
      });
    }

    await Location.watchPositionAsync(
      {accuracy: Location.Accuracy.BestForNavigation, timeInterval: 100, distanceInterval: 1},
      result => {
        this.setState({
          location: {
            latitude: parseFloat(result.coords.latitude),
            longitude: parseFloat(result.coords.longitude)
          }
        });
      }
    );
  }



  _getOrientation = async () => {

    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted"){
      this.setState({
        errorMessage: "PERMISSION NOT GRANTED"
      });
    }

    await Location.watchHeadingAsync(
      result => {
          this.setState({
          orientation: parseFloat(result.trueHeading)
        });
      }
    );
  }



  _tick = async () => {
  
    if(this.navigation.state.params.mute == false){
      var user = this.state

      for(let i = 0; i < this.env.length ; i++){
        var obj = this.env[i]

        var distance = getDistance(user["location"], obj["location"], accuracy=1)
        var bearing = getRhumbLineBearing(user["location"], obj["location"])
        var angle = user["orientation"] - bearing

        if(angle > 180){
          angle = 360-angle
        }
        if(angle < -180){
          angle = 360+angle
        }

        this.env[i].distance = distance
        this.env[i].angle = angle
      }

      var now = Date.now()
      // console.log("TICK")

      for(let i=0; i < this.env.length; i++){
        obj = this.env[i]

        if(obj.bip){
          this.env[i].bip = false
        }
        else{
          var diff = now - obj.tick
          if(diff > obj.distance*100){
            this.env[i].tick = now
            this.env[i].bip = true

            var pan = - Math.sin((obj.angle * Math.PI) / 180)
            var volume = 0.1 + 0.9 * Math.exp(-(obj.angle**2)/(2*60**2))

            await this.env[i].sound.stopAsync()
            await this.env[i].sound.setVolumeAsync(volume, pan)
            await this.env[i].sound.playAsync()

            console.log(obj.distance)
            console.log(pan)
            console.log(volume)
            console.log("")
          }
        }
      }
    }

  }

  componentDidMount = async () => {

    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    })

    const status = {
      shouldPlay: false,
      androidImplementation:'MediaPlayer'
    }

    this.voiceOver = new Audio.Sound();
    await this.voiceOver.loadAsync(require('../assets/sound/voiceOver/play.mp3'), status, false)
    this.voiceOver.playAsync()

    this.env = []

    // ENTITIES
    for (let i = 0; i < data.entities.length; i++){
      sound = new Audio.Sound();
      await sound.loadAsync(SOUNDS[data.entities[i].category], status, false);

      obj = {
        location:data.entities[i].location, 
        distance:0, 
        angle:0, 
        tick:Date.now(), 
        bip:false, 
        sound:sound
      }

      this.env.push(obj)
    }

    // FIELDS
    for (let i = 0; i < data.fields.length; i++){
      sound = new Audio.Sound();
      await sound.loadAsync(SOUNDS[data.fields[i].category], status, false);

      obj = {
        location:data.fields[i].location, 
        distance:0, 
        angle:0, 
        tick:Date.now(), 
        bip:false, 
        sound:sound
      }

      this.env.push(obj)
    }



    this._getLocation();
    this._getOrientation();

    setInterval(async () => {await this._tick()},50);
  }


  _goTo = (routeName) => {

    if(routeName == NAME) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      this.voiceOver.playAsync()
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      this.navigation.navigate(routeName, {mute: false})
      this.navigation.state.params = {mute: true}
    }
  }



  render() {

    const { navigation } = this.props;
    this.navigation = navigation

    const swipeRight = Gesture.Fling()
      .direction(Directions.RIGHT)
      .onStart(() => this._goTo("Usage"));

    const swipeLeft = Gesture.Fling()
      .direction(Directions.LEFT)
      .onStart(() => this._goTo("Legend"));

    const swipeUp = Gesture.Fling()
      .direction(Directions.UP)
      .onStart(() => this._goTo("Play"));

    const swipeDown = Gesture.Fling()
      .direction(Directions.DOWN)
      .onStart(() => this._goTo("Pause"));
    
    const swipe = Gesture.Race(swipeRight, swipeLeft, swipeUp, swipeDown)

    return (
      <GestureDetector gesture={swipe}>
        <View style={styles.container}>
          <Text style={styles.text}>PLAY</Text>
        </View>
      </GestureDetector>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontWeight: config.fontWeight,
    fontSize: config.fontSize,
    fontColor: config.black
  }
});