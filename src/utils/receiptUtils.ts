
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

  // Validar e normalizar os itens sem modificar os valores originais
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

    // Manter os valores originais e apenas verificar a validFormat
    return {
      productName: item.productName,
      quantity: quantity,
      unitPrice: unitPrice,
      total: total,
      validFormat: Math.abs((quantity * unitPrice) - total) < 0.01
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
