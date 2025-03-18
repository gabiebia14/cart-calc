
/**
 * Utilitários para detectar e agrupar produtos similares
 */

/**
 * Remove caracteres especiais, espaços extras e converte para minúsculas
 */
export const normalizeProductName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, ' ')    // Remove espaços extras
    .trim();
};

/**
 * Calcula a similaridade entre duas strings usando o algoritmo de Levenshtein
 * Retorna um valor entre 0 (totalmente diferente) e 1 (idêntico)
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  // Normaliza os nomes dos produtos
  const s1 = normalizeProductName(str1);
  const s2 = normalizeProductName(str2);
  
  // Se os nomes normalizados são iguais, retorna similaridade máxima
  if (s1 === s2) return 1;
  
  // Implementação do algoritmo de Levenshtein para calcular a distância de edição
  const len1 = s1.length;
  const len2 = s2.length;
  
  // Matriz para calcular a distância
  const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  // Inicializa a primeira coluna e linha
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Calcula a distância
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deleção
        matrix[i][j - 1] + 1,      // inserção
        matrix[i - 1][j - 1] + cost // substituição
      );
    }
  }
  
  // A distância é o valor na posição final da matriz
  const distance = matrix[len1][len2];
  
  // Converte a distância em similaridade (0-1)
  // Usando o comprimento máximo das strings para normalizar
  const maxLength = Math.max(len1, len2);
  if (maxLength === 0) return 1; // Ambas strings vazias
  
  return 1 - distance / maxLength;
};

/**
 * Verifica se duas strings representam o mesmo produto
 * baseado em um limite de similaridade
 */
export const isSameProduct = (name1: string, name2: string, threshold = 0.7): boolean => {
  // Se as strings são exatamente iguais
  if (name1 === name2) return true;
  
  // Verifica se uma string contém a outra
  const n1 = normalizeProductName(name1);
  const n2 = normalizeProductName(name2);
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Caso contrário, usa a similaridade
  return calculateSimilarity(name1, name2) >= threshold;
};

/**
 * Agrupa produtos similares baseado no threshold de similaridade
 */
export const groupSimilarProducts = (products: string[], threshold = 0.7): { [key: string]: string[] } => {
  const groups: { [key: string]: string[] } = {};
  
  for (const product of products) {
    let foundGroup = false;
    
    // Verifica se o produto pertence a algum grupo existente
    for (const representative in groups) {
      if (isSameProduct(product, representative, threshold)) {
        groups[representative].push(product);
        foundGroup = true;
        break;
      }
    }
    
    // Se não encontrou um grupo, cria um novo
    if (!foundGroup) {
      groups[product] = [product];
    }
  }
  
  return groups;
};
