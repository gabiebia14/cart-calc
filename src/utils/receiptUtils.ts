
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

  // Validar e normalizar os itens seguindo a lógica do Gemini
  const validItems = data.items.map(item => {
    try {
      // Converter strings para números e remover símbolos monetários
      const productName = item.productName?.trim() || '';
      const quantity = Number(String(item.quantity || '').replace(/[^\d.-]/g, ''));
      const total = Number(String(item.total || '').replace(/[^\d.-]/g, ''));
      let unitPrice = item.unitPrice ? Number(String(item.unitPrice).replace(/[^\d.-]/g, '')) : null;

      console.log('Processing item:', {
        productName,
        quantity,
        unitPrice,
        total,
        hasUnitPrice: unitPrice !== null
      });

      // Validar dados mínimos necessários
      if (!productName || isNaN(quantity) || isNaN(total) || quantity <= 0) {
        console.error('Invalid essential data:', {
          productName,
          quantity,
          total,
          isQuantityValid: !isNaN(quantity) && quantity > 0,
          isTotalValid: !isNaN(total)
        });
        return {
          productName,
          quantity: 0,
          unitPrice: 0,
          total: 0,
          validFormat: false
        };
      }

      // Caso 1: 4 colunas (nome, quantidade, preço unitário, total)
      if (unitPrice !== null) {
        // Se o preço unitário não foi detectado ou é igual ao total,
        // calculamos dividindo o total pela quantidade
        if (unitPrice <= 0 || Math.abs(unitPrice - total) < 0.01) {
          unitPrice = total / quantity;
          console.log('Recalculated unit price:', {
            product: productName,
            quantity,
            newUnitPrice: unitPrice,
            total
          });
        }

        const calculatedTotal = quantity * unitPrice;
        const isValid = Math.abs(calculatedTotal - total) < 0.01;

        console.log('Validation result for 4 columns:', {
          product: productName,
          quantity,
          unitPrice,
          calculatedTotal,
          actualTotal: total,
          isValid
        });

        return {
          productName,
          quantity,
          unitPrice,
          total,
          validFormat: isValid
        };
      }

      // Caso 2: 3 colunas (nome, quantidade, total)
      const calculatedUnitPrice = total / quantity;
      
      if (isNaN(calculatedUnitPrice) || calculatedUnitPrice <= 0) {
        console.log('Invalid unit price calculation:', {
          product: productName,
          quantity,
          total,
          calculatedUnitPrice
        });
        return {
          productName,
          quantity,
          unitPrice: 0,
          total,
          validFormat: false
        };
      }

      console.log('Validation result for 3 columns:', {
        product: productName,
        quantity,
        unitPrice: calculatedUnitPrice,
        total
      });

      return {
        productName,
        quantity,
        unitPrice: calculatedUnitPrice,
        total,
        validFormat: true
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

  const purchaseDate = data.purchase_date || new Date().toISOString().split('T')[0];

  return {
    items: validItems,
    storeName: data.store_info.name || 'Estabelecimento não identificado',
    purchaseDate
  };
};
