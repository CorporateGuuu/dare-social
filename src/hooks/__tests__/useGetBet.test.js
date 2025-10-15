import { act, renderHook } from '@testing-library/react-native';
import { getBet } from '../../lib/firebase.js';

jest.mock('../../lib/firebase.js', () => ({
  getBet: jest.fn(),
}));

describe('getBet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return mock bet data when USE_MOCK is true', async () => {
    const mockBetData = {
      data: {
        dareId: "mock-dare-123",
        participants: [
          { uid: "user1", jadeStaked: 50, result: "win" },
          { uid: "user2", jadeStaked: 50, result: "lose" }
        ],
        potTotal: 100,
        status: "resolved",
        createdAt: new Date().toISOString()
      }
    };

    getBet.mockResolvedValue(mockBetData);

    const result = await getBet('test-bet-id');

    expect(getBet).toHaveBeenCalledWith('test-bet-id');
    expect(result).toEqual(mockBetData);
    expect(result.data.dareId).toBe("mock-dare-123");
    expect(result.data.participants).toHaveLength(2);
    expect(result.data.potTotal).toBe(100);
    expect(result.data.status).toBe("resolved");
    expect(result.data.createdAt).toBeDefined();
  });

  it('should handle errors when bet is not found', async () => {
    const errorMessage = 'Bet not found';
    getBet.mockRejectedValue(new Error(errorMessage));

    await expect(getBet('non-existent-bet')).rejects.toThrow(errorMessage);
  });
});
