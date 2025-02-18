
export const validateReceiptData = (data: any) => {
  console.log('Validating receipt data:', data); // Debug log

  if (!data.store_info || !data.items || !Array.isArray(data.items)) {
    console.error('Invalid data structure:', {
      hasStoreInfo: !!data.store_info,
      hasItems: !!data.items,
      isItemsArray: Array.isArray(data.items)
    });
    throw new Error('Formato de dados inválido');
  }

  const validItems = data.items.filter(item => {
    const isValid = (
      item.productName &&
      typeof item.quantity === 'number' &&
      typeof item.unitPrice === 'number' &&
      typeof item.total === 'number' &&
      typeof item.validFormat === 'boolean'
    );
    
    if (!isValid) {
      console.log('Invalid item:', item); // Debug log for invalid items
    }
    
    return isValid;
  });

  if (validItems.length === 0) {
    throw new Error('Nenhum item válido encontrado no recibo');
  }

  return {
    items: validItems,
    storeName: data.store_info.name || 'Estabelecimento não identificado'
  };
};
