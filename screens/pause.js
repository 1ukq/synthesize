import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import React from 'react';
import config from '../assets/config';
import { Audio } from 'expo-av';

const NAME = "Pause"

export default class Pause extends React.Component{

  _tick = async () => {
    if(this.navigation.state.params.mute == false){
      await this.voiceOver.playAsync();
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
    await this.voiceOver.loadAsync(require('../assets/sound/voiceOver/pause.mp3'), status, false);

    setInterval(async () => {await this._tick()},50);

  }

  _goTo = async (routeName) => {

    if(routeName == NAME) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      await this.voiceOver.playAsync()
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
      .onStart(async () => await this._goTo("Usage"));

    const swipeLeft = Gesture.Fling()
      .direction(Directions.LEFT)
      .onStart(async () => await this._goTo("Legend"));

    const swipeUp = Gesture.Fling()
      .direction(Directions.UP)
      .onStart(async () => await this._goTo("Play"));

    const swipeDown = Gesture.Fling()
      .direction(Directions.DOWN)
      .onStart(async () => await this._goTo("Pause"));
    
    const swipe = Gesture.Race(swipeRight, swipeLeft, swipeUp, swipeDown)

    return (
      <GestureDetector gesture={swipe}>
        <View style={styles.container}>
          <Text style={styles.text}>PAUSE</Text>
        </View>
      </GestureDetector>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontWeight: config.fontWeight,
    fontSize: config.fontSize,
    color: config.yellow
  }
});