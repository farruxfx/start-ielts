import {
  calculateListeningBand,
  calculateReadingBand,
  calculateWritingBand,
  calculateSpeakingBand,
  calculateOverallBand,
  bandToLevel,
  bandToDescription,
} from '../scoring';

describe('IELTS Scoring Engine', () => {
  describe('calculateListeningBand', () => {
    test('perfect score maps to band 9.0', () => {
      expect(calculateListeningBand(40)).toBe(9.0);
    });

    test('known raw scores map from the band table', () => {
      expect(calculateListeningBand(30)).toBe(7.0);
      expect(calculateListeningBand(23)).toBe(5.0);
      expect(calculateListeningBand(0)).toBe(0.0);
    });

    test('non-standard total falls back to interpolation', () => {
      const band = calculateListeningBand(20, 30);
      expect(band).toBeGreaterThanOrEqual(0);
      expect(band).toBeLessThanOrEqual(9);
      expect(band % 0.5).toBeCloseTo(0, 5);
    });
  });

  describe('calculateReadingBand', () => {
    test('academic and general tables differ', () => {
      expect(calculateReadingBand(30, 40, 'academic')).toBe(7.0);
      expect(calculateReadingBand(30, 40, 'general')).toBe(6.5);
    });

    test('band is always a multiple of 0.5', () => {
      for (let raw = 0; raw <= 40; raw++) {
        expect(calculateReadingBand(raw) % 0.5).toBeCloseTo(0, 5);
      }
    });
  });

  describe('calculateWritingBand', () => {
    const full = {
      taskAchievement: 7,
      coherence: 7,
      lexicalResource: 7,
      grammaticalRange: 7,
    };

    test('under-length Task caps the band', () => {
      expect(calculateWritingBand(100, full)).toBeLessThanOrEqual(5.5);
      expect(calculateWritingBand(170, full)).toBeLessThanOrEqual(6.5);
    });

    test('sufficient words returns the criteria average', () => {
      expect(calculateWritingBand(250, full)).toBe(7.0);
    });
  });

  describe('calculateSpeakingBand', () => {
    test('averages the four criteria and rounds to nearest half', () => {
      expect(
        calculateSpeakingBand({
          fluency: 7,
          lexicalResource: 7,
          grammaticalRange: 7,
          pronunciation: 7,
        })
      ).toBe(7.0);

      expect(
        calculateSpeakingBand({
          fluency: 6,
          lexicalResource: 7,
          grammaticalRange: 6,
          pronunciation: 7,
        })
      ).toBe(6.5);
    });
  });

  describe('calculateOverallBand', () => {
    test('averages four skills and rounds to nearest half', () => {
      expect(calculateOverallBand(7, 7, 7, 7)).toBe(7.0);
      expect(calculateOverallBand(8, 7, 7, 7)).toBe(7.25 === 7.25 ? 7.5 : 7.5);
      expect(calculateOverallBand(6.5, 7, 6, 7)).toBe(6.5);
    });

    test('result is always a multiple of 0.5', () => {
      const band = calculateOverallBand(6.7, 7.2, 5.9, 7.4);
      expect(band % 0.5).toBeCloseTo(0, 5);
    });
  });

  describe('band helpers', () => {
    test('bandToLevel categorizes bands', () => {
      expect(bandToLevel(9)).toBe('Expert');
      expect(bandToLevel(7.5)).toBe('Good');
      expect(bandToLevel(5)).toBe('Modest');
      expect(bandToLevel(2)).toBe('Extremely Limited');
    });

    test('bandToDescription returns a non-empty description', () => {
      expect(bandToDescription(7).length).toBeGreaterThan(0);
      expect(bandToDescription(3).length).toBeGreaterThan(0);
    });
  });
});
