
export const validateReceiptData = (data: any) => {
  console.log('Validating receipt data:', data); // Debug log

  // Remove any markdown formatting if present
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

  // Normalize numbers that might be strings
  const validItems = data.items.filter(item => {
    // Convert potential string numbers to actual numbers
    if (item.quantity) item.quantity = Number(item.quantity);
    if (item.unitPrice) item.unitPrice = Number(item.unitPrice);
    if (item.total) item.total = Number(item.total);
    
    const isValid = (
      item.productName &&
      !isNaN(item.quantity) &&
      !isNaN(item.unitPrice) &&
      !isNaN(item.total)
    );
    
    // Set validFormat based on calculation check
    item.validFormat = isValid && Math.abs((item.quantity * item.unitPrice) - item.total) < 0.1;
    
    if (!isValid) {
      console.log('Invalid item:', item); // Debug log for invalid items
    }
    
    return true; // Keep all items but mark them as valid/invalid
  });

  if (validItems.length === 0) {
    throw new Error('Nenhum item válido encontrado no recibo');
  }

  return {
    items: validItems,
    storeName: data.store_info.name || 'Estabelecimento não identificado'
  };
};
