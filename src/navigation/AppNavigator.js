// src/navigation/AppNavigator.js
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import AddPaperScreen from '../screens/AddPaperScreen';
import PDFViewerScreen from '../screens/PDFViewerScreen';
import AuthorDetails from '../screens/AuthorDetails';
import JournalDetails from '../screens/JournalDetails';
import FolderDetail from '../screens/FolderDetail';
import LibraryScreen from '../screens/LibraryScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="AddPaper" component={AddPaperScreen} />
      <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
      <Stack.Screen name="AuthorDetails" component={AuthorDetails} />
      <Stack.Screen name="JournalDetails" component={JournalDetails} />
      <Stack.Screen 
        name="FolderDetail" 
        component={FolderDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}