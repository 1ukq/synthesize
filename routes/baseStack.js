import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import Play from '../screens/play';
import Pause from '../screens/pause';
import Legend from '../screens/legend';
import Usage from '../screens/usage';

const screens = {
    Usage: {
        screen: Usage,
        navigationOptions: {
            animationEnabled: false,
            headerShown: false
        }
    },
    Play: {
        screen: Play,
        navigationOptions: {
            animationEnabled: false,
            headerShown: false
        }
    },
    Pause: {
        screen: Pause,
        navigationOptions: {
            animationEnabled: false,
            headerShown: false
        }
    },
    Legend: {
        screen: Legend,
        navigationOptions: {
            animationEnabled: false,
            headerShown: false
        }
    },
}

const BaseStack = createStackNavigator(screens);

export default createAppContainer(BaseStack);

