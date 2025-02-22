
export const validateReceiptData = (data: any) => {
  console.log('Validating receipt data:', data);

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data.replace(/```json\n|\n```/g, ''));
    } catch (e) {
      console.error('Error parsing string data:', e);
      throw new Error('Formato de dados inválido');
    }
  }

  if (!data.store_info || !data.items || !Array.isArray(data.items)) {
    console.error('Invalid data structure:', {
      hasStoreInfo: !!data.store_info,
      hasItems: !!data.items,
      isItemsArray: Array.isArray(data.items)
    });
    throw new Error('Formato de dados inválido');
  }

  // Validar e normalizar os itens mantendo os valores originais
  const validItems = data.items.map(item => {
    // Converter strings para números se necessário
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const total = Number(item.total);

    // Verificar se os números são válidos
    if (isNaN(quantity) || isNaN(unitPrice) || isNaN(total) || !item.productName) {
      console.error('Invalid item values:', item);
      return null;
    }

    // Calcular o total esperado (quantidade * preço unitário)
    const expectedTotal = quantity * unitPrice;
    
    // Comparar o total calculado com o total do recibo
    // Usamos uma margem de erro pequena para lidar com arredondamentos
    const isValidTotal = Math.abs(expectedTotal - total) <= 0.01;

    console.log('Validating item:', {
      product: item.productName,
      quantity,
      unitPrice,
      total,
      expectedTotal,
      isValid: isValidTotal
    });

    // Retornar o item com os valores originais e o status de validação
    return {
      productName: item.productName,
      quantity: quantity,
      unitPrice: unitPrice,
      total: total,
      validFormat: isValidTotal
    };
  }).filter(item => item !== null);

  if (validItems.length === 0) {
    throw new Error('Nenhum item válido encontrado no recibo');
  }

  return {
    items: validItems,
    storeName: data.store_info.name || 'Estabelecimento não identificado'
  };
};
