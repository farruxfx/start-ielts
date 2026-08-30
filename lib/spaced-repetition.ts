/**
 * Spaced Repetition System (SRS) for vocabulary learning
 * Based on SM-2 algorithm
 */

export interface SRSCard {
  id: string;
  word: string;
  definition: string;
  example: string;
  // SM-2 fields
  interval: number; // days until next review
  repetitions: number; // successful repetitions
  easeFactor: number; // ease factor (default 2.5)
  nextReview: string; // ISO date string
  lastReview: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

const STORAGE_KEY = 'ieltspro_srs_cards';

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getSRSCards(): SRSCard[] {
  return safeGet<SRSCard[]>(STORAGE_KEY, []);
}

export function saveSRSCards(cards: SRSCard[]): void {
  safeSet(STORAGE_KEY, cards);
}

export function addSRSCard(word: string, definition: string, example: string): SRSCard {
  const cards = getSRSCards();
  const newCard: SRSCard = {
    id: crypto.randomUUID(),
    word,
    definition,
    example,
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: new Date().toISOString(),
    lastReview: new Date().toISOString(),
    status: 'new',
  };
  cards.push(newCard);
  saveSRSCards(cards);
  return newCard;
}

/**
 * Review a card using SM-2 algorithm
 * @param quality - 0-5 (0=blackout, 5=perfect)
 */
export function reviewCard(cardId: string, quality: number): void {
  const cards = getSRSCards();
  const card = cards.find(c => c.id === cardId);
  if (!card) return;

  // SM-2 Algorithm
  if (quality >= 3) {
    // Correct response
    if (card.repetitions === 0) {
      card.interval = 1;
    } else if (card.repetitions === 1) {
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
    card.repetitions += 1;
  } else {
    // Incorrect response — reset
    card.repetitions = 0;
    card.interval = 1;
  }

  // Update ease factor
  card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // Update status
  if (card.repetitions >= 5) {
    card.status = 'mastered';
  } else if (card.repetitions >= 2) {
    card.status = 'review';
  } else if (card.repetitions >= 1) {
    card.status = 'learning';
  }

  // Set next review date
  const next = new Date();
  next.setDate(next.getDate() + card.interval);
  card.nextReview = next.toISOString();
  card.lastReview = new Date().toISOString();

  saveSRSCards(cards);
}

export function getDueCards(): SRSCard[] {
  const cards = getSRSCards();
  const now = new Date();
  return cards.filter(c => new Date(c.nextReview) <= now);
}

export function getNewCards(limit: number = 10): SRSCard[] {
  const cards = getSRSCards();
  return cards.filter(c => c.status === 'new').slice(0, limit);
}

export function getSRSStats() {
  const cards = getSRSCards();
  return {
    total: cards.length,
    new: cards.filter(c => c.status === 'new').length,
    learning: cards.filter(c => c.status === 'learning').length,
    review: cards.filter(c => c.status === 'review').length,
    mastered: cards.filter(c => c.status === 'mastered').length,
    dueToday: getDueCards().length,
  };
}
