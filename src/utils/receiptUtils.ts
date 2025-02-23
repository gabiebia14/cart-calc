
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

      // Verificar se temos o mínimo necessário: nome do produto e total
      if (isNaN(total) || !item.productName) {
        console.error('Missing essential values:', item);
        return {
          productName: item.productName || '',
          quantity: quantity || 1, // Se não houver quantidade, assume 1
          unitPrice: unitPrice || total, // Se não houver preço unitário, usa o total
          total: total,
          validFormat: false
        };
      }

      // Se não tiver quantidade, assume 1
      if (isNaN(quantity)) {
        console.log('Quantity not provided, assuming 1:', item.productName);
        return {
          productName: item.productName,
          quantity: 1,
          unitPrice: total, // Preço unitário será igual ao total
          total: total,
          validFormat: true // Válido pois temos o essencial: nome e total
        };
      }

      // Se não tiver preço unitário, calculamos
      if (unitPrice === null) {
        unitPrice = total / quantity;
        console.log('Calculated unit price:', {
          product: item.productName,
          unitPrice,
          quantity,
          total
        });
      }

      // Sempre consideramos válido se tiver nome do produto e total
      return {
        productName: item.productName,
        quantity: quantity,
        unitPrice: unitPrice,
        total: total,
        validFormat: true
      };
    } catch (error) {
      console.error('Error processing item:', error, item);
      return {
        productName: item.productName || '',
        quantity: 1,
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
