describe('getLast7Days', () => {
  // Inline version of getLast7Days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  it('returns 7 consecutive dates ending today', () => {
    const result = getLast7Days();
    expect(result).toHaveLength(7);

    const today = new Date().toISOString().split('T')[0];
    expect(result[6]).toBe(today);

    for (let i = 0; i < result.length - 1; i++) {
      const d1 = new Date(result[i]);
      const d2 = new Date(result[i + 1]);
      expect(d2 - d1).toBe(86400000); // 1 day in ms
    }
  });
});

describe('normalizeStats', () => {
  // Inline version of getLast7Days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  // Inline version of normalizeStats
  const normalizeStats = (stats) => {
    const last7Days = getLast7Days();
    return last7Days.map((date) => ({
      date,
      value: stats[date] ?? 0,
    }));
  };

  it('fills missing days with 0 and uses stats values where present', () => {
    const now = Date.now();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(new Date(now - i * 86400000).toISOString().split('T')[0]);
    }

    const stats = {
      [days[1]]: 7,
      [days[5]]: 3,
    };

    const result = normalizeStats(stats);

    expect(result).toHaveLength(7);
    result.forEach((entry, index) => {
      expect(entry.date).toBe(days[index]);
      const expectedValue = stats[entry.date] ?? 0;
      expect(entry.value).toBe(expectedValue);
    });
  });
});
