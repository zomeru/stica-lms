export const keyGen = (diff?: string | number) => {
  return Math.trunc(
    Number(`${diff || ''}${Date.now() + Math.random() * 100000}`)
  ).toString();
};

export const hasDuplicateString = (arrString: string[]): boolean =>
  arrString.length !== new Set(arrString).size;
