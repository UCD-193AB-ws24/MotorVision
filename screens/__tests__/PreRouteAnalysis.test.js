// Inline versions of the functions

const calculateCurvature = (coordinates) => {
  let totalCurvature = 0;

  for (let i = 1; i < coordinates.length - 1; i += 100) {
    const p1 = coordinates[i - 1];
    const p2 = coordinates[i];
    const p3 = coordinates[i + 1];

    const vector1 = { x: p2[0] - p1[0], y: p2[1] - p1[1] };
    const vector2 = { x: p3[0] - p2[0], y: p3[1] - p2[1] };

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    const angle = Math.acos(dotProduct / (magnitude1 * magnitude2));

    totalCurvature += angle;
  }

  return totalCurvature;
};

const getElevation = async (coordinates, mapboxAccessToken) => {
  let elevations = [];
  const baseUrl = "https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/";

  for (let i = 0; i < coordinates.length; i += 100) {
    const [longitude, latitude] = coordinates[i];
    const url = `${baseUrl}${longitude},${latitude}.json?layers=contour&limit=50&access_token=${mapboxAccessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const elevation = data.features[0].properties.ele;
      elevations.push(elevation);
    } catch (error) {
      console.error("Error fetching elevation data:", error);
    }
  }

  return elevations;
};

const calculateRideability = (curvature, elevationDiff) => {
  const curvatureWeight = 0.6;
  const elevationWeight = 0.4;

  const normalizedCurvature = Math.min(curvature / 10, 1) * 10;
  const normalizedElevation = Math.min(elevationDiff / 500, 1) * 10;

  return (curvatureWeight * normalizedCurvature) + (elevationWeight * normalizedElevation);
};

// TEST CASES

describe('calculateCurvature', () => {
  it('should return 0 curvature for straight line points', () => {
    const coords = [[0, 0], [1, 1], [2, 2]];
    const result = calculateCurvature(coords);
    expect(result).toBeCloseTo(0, 5);
  });
});

describe('getElevation', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        features: [{ properties: { ele: 123 } }]
      })
    });
  });

  it('should fetch elevations correctly', async () => {
    const coords = [[-122.45, 37.78], [-122.46, 37.79]];
    const result = await getElevation(coords, 'fake-token');
    expect(result).toEqual([123]);
    expect(fetch).toHaveBeenCalled();
  });
});

describe('calculateRideability', () => {
  it('should compute a weighted score from curvature and elevationDiff', () => {
    const score = calculateRideability(5, 250);
    // curvature: 5/10 * 10 = 5 * 0.6 = 3
    // elevation: 250/500 * 10 = 5 * 0.4 = 2
    // total = 5
    expect(score).toBeCloseTo(5.0, 1);
  });

  it('should cap normalized values at 10', () => {
    const score = calculateRideability(1000, 10000);
    expect(score).toBe(10);
  });
});
