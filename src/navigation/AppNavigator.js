// src/navigation/AppNavigator.js
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
// import AddPaperScreen from '../screens/AddPaperScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      {/* <Stack.Screen name="AddPaper" component={AddPaperScreen} /> */}
    </Stack.Navigator>
  );
}