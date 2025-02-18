
export const validateReceiptData = (data: any) => {
  if (!data.store_info || !data.items || !Array.isArray(data.items)) {
    throw new Error('Formato de dados inválido');
  }

  const validItems = data.items.filter(item => {
    return (
      item.productName &&
      typeof item.quantity === 'number' &&
      typeof item.unitPrice === 'number' &&
      typeof item.total === 'number' &&
      typeof item.validFormat === 'boolean'
    );
  });

  if (validItems.length === 0) {
    throw new Error('Nenhum item válido encontrado no recibo');
  }

  return {
    items: validItems,
    storeName: data.store_info.name || 'Estabelecimento não identificado'
  };
};
