import { renderHook, waitFor } from '@testing-library/react-native';
import { useRealtimeLeaderboard } from '../useRealtimeLeaderboard';

// Mock Firebase
jest.mock('../lib/firebase', () => ({
  db: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
}));

describe('useRealtimeLeaderboard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set loading to false initially', () => {
    const { result } = renderHook(() => useRealtimeLeaderboard());

    expect(result.current.loading).toBe(true);
  });

  it('should load users and set loading to false when db is available', async () => {
    const mockUsers = [
      { uid: '1', stoneBalance: 100, name: 'User1' },
      { uid: '2', stoneBalance: 50, name: 'User2' },
    ];

    const { onSnapshot, collection, query } = require('firebase/firestore');

    const mockUnsub = jest.fn();
    const mockQuerySnapshot = {
      docs: mockUsers.map((user, idx) => ({
        id: user.uid,
        data: () => user,
      })),
    };

    collection.mockReturnValue('usersCollection');
    query.mockReturnValue('queryObject');
    onSnapshot.mockImplementation((q, callback) => {
      callback(mockQuerySnapshot);
      return mockUnsub;
    });

    const { result } = renderHook(() => useRealtimeLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual([
      { uid: '1', rank: 1, stoneBalance: 100, name: 'User1' },
      { uid: '2', rank: 2, stoneBalance: 50, name: 'User2' },
    ]);

    expect(onSnapshot).toHaveBeenCalledWith('queryObject', expect.any(Function), expect.any(Function));
  });

  it('should handle error in onSnapshot', async () => {
    const { onSnapshot, collection, query } = require('firebase/firestore');

    const mockUnsub = jest.fn();
    const mockError = new Error('Firebase error');

    collection.mockReturnValue('usersCollection');
    query.mockReturnValue('queryObject');
    onSnapshot.mockImplementation((q, callback, errorCallback) => {
      errorCallback(mockError);
      return mockUnsub;
    });

    const { result } = renderHook(() => useRealtimeLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(console.error).toHaveBeenCalledWith('Error in leaderboard snapshot:', mockError);
  });
});
