
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
    try {
      // Converter strings para números se necessário e remover símbolos monetários
      const quantity = Number(String(item.quantity).replace(/[^\d.-]/g, ''));
      const total = Number(String(item.total).replace(/[^\d.-]/g, ''));
      let unitPrice = item.unitPrice ? Number(String(item.unitPrice).replace(/[^\d.-]/g, '')) : null;

      // Verificar se os números básicos são válidos
      if (isNaN(quantity) || isNaN(total) || !item.productName) {
        console.error('Invalid basic values:', item);
        return {
          productName: item.productName || '',
          quantity: quantity,
          unitPrice: unitPrice || 0,
          total: total,
          validFormat: false
        };
      }

      // Caso de 3 colunas: calcular preço unitário
      if (unitPrice === null) {
        unitPrice = total / quantity;
        console.log('Calculated unit price for 3-column format:', {
          product: item.productName,
          unitPrice,
          quantity,
          total
        });
      }

      // Validar o formato com base no número de colunas e cálculos
      const calculatedTotal = quantity * unitPrice;
      const isValidFormat = Math.abs(calculatedTotal - total) <= 0.01;

      console.log('Validation result:', {
        product: item.productName,
        quantity,
        unitPrice,
        total,
        calculatedTotal,
        isValid: isValidFormat
      });

      return {
        productName: item.productName,
        quantity: quantity,
        unitPrice: unitPrice,
        total: total,
        validFormat: isValidFormat
      };
    } catch (error) {
      console.error('Error processing item:', error, item);
      return {
        productName: item.productName || '',
        quantity: 0,
        unitPrice: 0,
        total: 0,
        validFormat: false
      };
    }
  });

  if (validItems.length === 0) {
    throw new Error('Nenhum item válido encontrado no recibo');
  }

  return {
    items: validItems,
    storeName: data.store_info.name || 'Estabelecimento não identificado'
  };
};
