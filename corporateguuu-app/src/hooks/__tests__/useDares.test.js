import { act, renderHook } from '@testing-library/react-native';
import { useDares } from '../useDares.js';

describe('useDares', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should set loading to true initially', () => {
    const { result } = renderHook(() => useDares());

    expect(result.current.loading).toBe(true);
    expect(result.current.dares).toEqual([]);
  });

  it('should load dares after timeout when USE_MOCK is true', async () => {
    const { result } = renderHook(() => useDares());

    expect(result.current.loading).toBe(true);

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.dares).toEqual([
      { id: '1', title: 'Do 20 push-ups', reward: 20, desc: 'Film 20 clean reps' },
      { id: '2', title: 'Sing in public', reward: 30, desc: '30s clip in a cafe' },
      { id: '3', title: 'Ice bucket challenge', reward: 25, desc: 'Pour and smile!' },
    ]);
  });
});
