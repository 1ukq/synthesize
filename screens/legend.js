import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import React from 'react';
import config from '../assets/config';
import { Audio } from 'expo-av';


const NAME = "Legend"

export default class Legend extends React.Component{

  _tick = async () => {
    if(this.navigation.state.params.mute == false){
      this.voiceOver.playAsync();
      this.navigation.state.params = {mute: true}
    }
  }

  componentDidMount = async () => {

    const { navigation } = this.props;
    this.navigation = navigation

    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    })

    const status = {
      shouldPlay: false,
      androidImplementation:'MediaPlayer'
    }

    this.voiceOver = new Audio.Sound();
    await this.voiceOver.loadAsync(require('../assets/sound/voiceOver/legend.wav'), status, false);

    setInterval(async () => {await this._tick()},50);

  }

  _goTo = async (routeName) => {

    if(routeName == NAME) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      this.voiceOver.playAsync()
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      this.navigation.navigate(routeName, {mute: false})
      this.navigation.state.params = {mute: true}
      this.voiceOver.stopAsync();
      this.voiceOver = new Audio.Sound();
      await this.voiceOver.loadAsync(require('../assets/sound/voiceOver/legend.wav'), {
        shouldPlay: false,
        androidImplementation:'MediaPlayer'
      }, false);
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
          <View style={styles.circle}>
            <Text style={styles.text}>LEGEND</Text>
          </View>
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

  circle: {
    backgroundColor: config.black,
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
  },

  text: {
    fontWeight: config.fontWeight,
    fontSize: config.fontSize,
    color: config.yellow
  }
});