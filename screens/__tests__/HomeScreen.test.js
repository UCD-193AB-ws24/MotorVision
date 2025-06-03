import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useCrashDetection } from '../hooks/useCrashDetection';
import { useSensorBuffer } from '../hooks/useSensorBuffer';

// Mock navigation prop for testing navigation-dependent components
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  // add other methods as needed
};

// Mock useCrashDetection hook
jest.mock('../hooks/useCrashDetection', () => ({
  useCrashDetection: jest.fn(),
}));

// Mock useSensorBuffer hook (no-op for testing)
jest.mock('../hooks/useSensorBuffer', () => ({
  useSensorBuffer: jest.fn(),
}));

// Mock firebase auth and firestore
jest.mock('../config/firebase', () => ({
  auth: {
    currentUser: { uid: 'testUserId' },
  },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

// Mock Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    BestForNavigation: 1,
  },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading and user info correctly and handles location & crash detection', async () => {
    // Setup mocks
    useCrashDetection.mockReturnValue(false);
    useSensorBuffer.mockImplementation(() => null);

    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.watchPositionAsync.mockImplementation((options, callback) => {
      // Simulate speed update
      callback({
        coords: {
          speed: 10, // m/s (about 22.36 mph)
        },
      });
      return Promise.resolve();
    });

    // Mock Firestore getDoc to return user data
    const mockUserData = {
      exists: () => true,
      data: () => ({
        name: 'Test User',
        createdAt: { seconds: 1650000000 },
        stats: {
          totalDistanceMiles: 100.5,
          totalMinutes: 120,
          totalRides: 5,
        },
      }),
    };

    doc.mockReturnValue('mockDocRef');
    getDoc.mockResolvedValue(mockUserData);

    // Mock AsyncStorage getItem to return cached AI insight
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'aiInsightCache') return Promise.resolve('Cached Insight');
      if (key === 'userInfo') return Promise.resolve(null);
      return Promise.resolve(null);
    });

    const { getByText, queryByText } = render(<HomeScreen navigation={mockNavigation} />);

    // Wait for user name and join date to appear after async fetch
    await waitFor(() => {
      expect(getByText('Welcome back, Test User!')).toBeTruthy();
      expect(getByText(/Member since/)).toBeTruthy();
    });

    // Speed should be updated to about 22.4 mph (10 m/s * 2.23694)
    await waitFor(() => {
      expect(getByText('22.4')).toBeTruthy();
      expect(getByText('mph')).toBeTruthy();
    });

    // AIInsightCard should display cached insight from AsyncStorage initially
    expect(getByText('Cached Insight')).toBeTruthy();

    // Crash warning should NOT be visible because useCrashDetection returns false
    expect(queryByText(/Crash Detected/)).toBeNull();
  });

  it('shows crash detected warning when isCrashed is true', () => {
    useCrashDetection.mockReturnValue(true);
    useSensorBuffer.mockImplementation(() => null);

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText(/Crash Detected/)).toBeTruthy();
  });

  it('fetches and displays AI insight when total rides > 0', async () => {
    useCrashDetection.mockReturnValue(false);
    useSensorBuffer.mockImplementation(() => null);

    // Mock Firestore user data with rides > 0
    const mockUserData = {
      exists: () => true,
      data: () => ({
        name: 'Test User',
        createdAt: { seconds: 1650000000 },
        stats: {
          totalDistanceMiles: 100,
          totalMinutes: 120,
          totalRides: 10,
        },
      }),
    };

    doc.mockReturnValue('mockDocRef');
    getDoc.mockResolvedValue(mockUserData);

    // Mock fetch for AI insight
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: 'Ride safe and always wear your helmet!',
                },
              },
            ],
          }),
      })
    );

    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText(/Ride safe and always wear your helmet!/)).toBeTruthy();
    });

    // Cleanup fetch mock
    global.fetch.mockRestore();
  });
});
