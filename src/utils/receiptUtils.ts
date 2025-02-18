
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

  // Normalize numbers that might be strings and validate calculations
  const validItems = data.items.map(item => {
    // Convert potential string numbers to actual numbers
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const total = Number(item.total);
    
    // Check if all numbers are valid
    const hasValidNumbers = (
      item.productName &&
      !isNaN(quantity) &&
      !isNaN(unitPrice) &&
      !isNaN(total) &&
      quantity > 0 &&
      unitPrice > 0
    );

    // Calculate expected total
    const expectedTotal = quantity * unitPrice;
    
    // Check if the total matches the calculation (allowing for small rounding differences)
    const hasValidTotal = Math.abs(expectedTotal - total) < 0.1;

    // If total doesn't match calculation, use the calculated total
    const correctedTotal = hasValidTotal ? total : expectedTotal;

    return {
      productName: item.productName,
      quantity: quantity,
      unitPrice: unitPrice,
      total: correctedTotal,
      validFormat: hasValidNumbers && hasValidTotal
    };
  });

  // Filter out any items with invalid numbers
  const filteredItems = validItems.filter(item => 
    !isNaN(item.quantity) && 
    !isNaN(item.unitPrice) && 
    !isNaN(item.total) &&
    item.quantity > 0 &&
    item.unitPrice > 0
  );

  if (filteredItems.length === 0) {
    throw new Error('Nenhum item válido encontrado no recibo');
  }

  return {
    items: filteredItems,
    storeName: data.store_info.name || 'Estabelecimento não identificado'
  };
};
