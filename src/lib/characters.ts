export function extractChineseCharacters(text: string): string[] {
  return [...text].filter(char => /[\u4e00-\u9fff]/.test(char));
}

export function extractUniqueChineseCharacters(text: string): string[] {
  return [...new Set(extractChineseCharacters(text))];
}
