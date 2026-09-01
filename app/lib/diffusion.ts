export type Pixel = [number, number, number];
export const FIELD_SIZE = 10;

export function randomFactory(seed: number) {
  let value = seed || 1;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function gaussianNoise(seed: number, count = FIELD_SIZE * FIELD_SIZE) {
  const random = randomFactory(seed);
  return Array.from({ length: count }, () => {
    const u = Math.max(random(), 0.000001);
    const v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  });
}

export function cleanSignal() {
  return Array.from({ length: FIELD_SIZE * FIELD_SIZE }, (_, index) => {
    const x = index % FIELD_SIZE;
    const y = Math.floor(index / FIELD_SIZE);
    const d = Math.hypot(x - 4.5, y - 4.5);
    const face = d < 4.15;
    const eye = (x === 3 || x === 6) && (y === 3 || y === 4);
    const smile = (y === 6 && (x === 2 || x === 7)) || (y === 7 && x >= 3 && x <= 6);
    if (eye || smile) return -0.82;
    if (face) return 0.78;
    return -0.58;
  });
}

export function cosineWeights(progress: number) {
  const angle = Math.max(0, Math.min(1, progress)) * Math.PI / 2;
  return { signal: Math.cos(angle), noise: Math.sin(angle) };
}

export function mixSignal(clean: number[], noise: number[], progress: number) {
  const weights = cosineWeights(progress);
  return clean.map((value, index) => weights.signal * value + weights.noise * noise[index]);
}

export function scalarToByte(value: number) {
  return Math.max(0, Math.min(255, Math.round((value + 1) * 127.5)));
}

export function makePromptScene(prompt: string, size = FIELD_SIZE): Pixel[] {
  return Array.from({ length: size * size }, (_, index) => {
    const x = index % size;
    const y = Math.floor(index / size);
    if (prompt === 'a red sun over blue water') {
      const sun = Math.hypot(x - 6.5, y - 3) < 2.15;
      if (sun) return [252, 79, 55];
      if (y >= 6) return [(x + y) % 2 ? 27 : 42, 91, 164];
      return [244 - y * 12, 177 - y * 8, 116 + y * 10];
    }
    if (prompt === 'a green tree under a violet sky') {
      const crown = Math.hypot(x - 5, y - 4) < 3;
      if (crown) return [34, 151 + ((x + y) % 2) * 35, 94];
      if ((x === 4 || x === 5) && y > 4) return [107, 70, 49];
      if (y > 7) return [61, 104, 65];
      return [111, 82, 165];
    }
    const moon = Math.hypot(x - 3, y - 3) < 2;
    if (moon) return [250, 211, 99];
    if ((index * 17) % 31 === 0) return [230, 236, 255];
    return [17 + y * 2, 24 + y * 2, 55 + y * 5];
  });
}

export function blendPixel(a: Pixel, b: Pixel, amount: number): Pixel {
  return a.map((value, index) => Math.max(0, Math.min(255, Math.round(value * (1 - amount) + b[index] * amount)))) as Pixel;
}

