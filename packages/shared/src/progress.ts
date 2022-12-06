export const progress = (min: number, max: number, value: number) =>
  max - min === 0 ? 1 : (value - min) / (max - min)
