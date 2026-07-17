export function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

export function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRandom(seed: string): () => number {
  return mulberry32(hashString(seed));
}

export function makeSeed(): string {
  const words = ["tidal", "basalt", "pelagic", "ember", "lichen", "aurora", "mantle", "stromatolite"];
  const random = mulberry32(Date.now() >>> 0);
  return `${words[Math.floor(random() * words.length)]}-${Math.floor(random() * 999_999)}`;
}

export function pickWeighted<T>(random: () => number, options: Array<[T, number]>): T {
  const total = options.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
  let roll = random() * total;
  for (const [value, weight] of options) {
    roll -= Math.max(0, weight);
    if (roll <= 0) return value;
  }
  return options[options.length - 1][0];
}

export function vary(random: () => number, value: number, range: number): number {
  return value + (random() * 2 - 1) * range;
}

