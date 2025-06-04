describe('CrashDetailScreen helper functions', () => {
  const formatTime = (time) => {
    if (!time) return 'Unknown';
    const date = new Date(time);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatSpeed = (speed) =>
    typeof speed === 'number' ? `${(speed * 2.237).toFixed(1)} mph` : 'N/A';

  const formatAccel = (accel) =>
    typeof accel === 'number' ? `${accel.toFixed(2)} m/s²` : 'N/A';

  const formatLocation = (loc) =>
    loc?.latitude && loc?.longitude ? `${loc.latitude}, ${loc.longitude}` : 'Not available';

  test('formatTime returns formatted string for valid date', () => {
    const time = '2023-06-01T15:45:00Z';
    const formatted = formatTime(time);
    expect(formatted).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2}/);
  });

  test('formatTime returns "Unknown" for undefined input', () => {
    expect(formatTime(undefined)).toBe('Unknown');
    expect(formatTime(null)).toBe('Unknown');
  });

  test('formatSpeed converts m/s to mph', () => {
    expect(formatSpeed(10)).toBe('22.4 mph'); // 10 m/s ≈ 22.37 mph
  });

  test('formatSpeed returns N/A for non-number input', () => {
    expect(formatSpeed(null)).toBe('N/A');
    expect(formatSpeed(undefined)).toBe('N/A');
    expect(formatSpeed('fast')).toBe('N/A');
  });

  test('formatAccel formats number to 2 decimal places', () => {
    expect(formatAccel(9.812345)).toBe('9.81 m/s²');
  });

  test('formatAccel returns N/A for invalid input', () => {
    expect(formatAccel(undefined)).toBe('N/A');
    expect(formatAccel(null)).toBe('N/A');
    expect(formatAccel('9.8')).toBe('N/A');
  });

  test('formatLocation formats valid lat/lon', () => {
    const loc = { latitude: 37.7749, longitude: -122.4194 };
    expect(formatLocation(loc)).toBe('37.7749, -122.4194');
  });

  test('formatLocation returns Not available for missing coords', () => {
    expect(formatLocation({})).toBe('Not available');
    expect(formatLocation({ latitude: 12 })).toBe('Not available');
    expect(formatLocation(null)).toBe('Not available');
  });
});
