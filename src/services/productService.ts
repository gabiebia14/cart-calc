
import { supabase } from "@/integrations/supabase/client";

export const normalizeProductName = async (productName: string): Promise<string> => {
  try {
    // First check if this product name already has a mapping
    const { data: existingMapping } = await supabase
      .from('product_name_mappings')
      .select('normalized_product_id, normalized_products(normalized_name)')
      .eq('original_name', productName)
      .maybeSingle();

    if (existingMapping) {
      return existingMapping.normalized_products.normalized_name;
    }

    // If no mapping exists, call the edge function to normalize the name
    const functionResponse = await supabase.functions.invoke('normalize-product-name', {
      body: { productName },
    });

    if (functionResponse.error) {
      throw new Error(`Error normalizing product name: ${functionResponse.error.message}`);
    }

    const normalizedName = functionResponse.data.normalizedName;

    // Check if this normalized name already exists
    let normalizedProductId: string;
    const { data: existingNormalized } = await supabase
      .from('normalized_products')
      .select('id')
      .eq('normalized_name', normalizedName)
      .maybeSingle();

    if (existingNormalized) {
      normalizedProductId = existingNormalized.id;
    } else {
      // Insert the new normalized product
      const { data: newNormalized, error: insertNormalizedError } = await supabase
        .from('normalized_products')
        .insert({ normalized_name: normalizedName })
        .select('id')
        .single();

      if (insertNormalizedError) {
        throw insertNormalizedError;
      }

      normalizedProductId = newNormalized.id;
    }

    // Insert the mapping
    const { error: insertMappingError } = await supabase
      .from('product_name_mappings')
      .insert({
        original_name: productName,
        normalized_product_id: normalizedProductId
      });

    if (insertMappingError) {
      throw insertMappingError;
    }

    return normalizedName;
  } catch (error) {
    console.error('Error in normalizeProductName:', error);
    // If normalization fails, return the original name
    return productName;
  }
};

export const getNormalizedProducts = async (searchTerm: string): Promise<{ id: string; normalized_name: string }[]> => {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    // First search in the normalized products table
    const { data: normalizedProducts } = await supabase
      .from('normalized_products')
      .select('id, normalized_name')
      .ilike('normalized_name', `%${searchTerm}%`)
      .order('normalized_name');

    // Then search in the mappings for any original names that match
    const { data: mappings } = await supabase
      .from('product_name_mappings')
      .select('normalized_product_id, normalized_products(id, normalized_name)')
      .ilike('original_name', `%${searchTerm}%`);

    // Combine the results, filtering out duplicates
    const normalizedProductsMap = new Map();

    // Add products from direct normalized search
    if (normalizedProducts) {
      normalizedProducts.forEach(product => {
        normalizedProductsMap.set(product.id, product);
      });
    }

    // Add products from mappings
    if (mappings) {
      mappings.forEach(mapping => {
        const product = mapping.normalized_products;
        if (product) {
          normalizedProductsMap.set(product.id, { id: product.id, normalized_name: product.normalized_name });
        }
      });
    }

    return Array.from(normalizedProductsMap.values());
  } catch (error) {
    console.error('Error in getNormalizedProducts:', error);
    return [];
  }
};

export const getProductHistory = async (normalizedProductId: string) => {
  try {
    // Get all original product names that map to this normalized product
    const { data: mappings, error: mappingsError } = await supabase
      .from('product_name_mappings')
      .select('original_name')
      .eq('normalized_product_id', normalizedProductId);

    if (mappingsError) throw mappingsError;

    const originalNames = mappings ? mappings.map(m => m.original_name) : [];

    // Get all receipt items that match any of the original names
    if (originalNames.length === 0) {
      return {
        priceHistory: [],
        purchaseHistory: [],
        productStats: {
          lowestPrice: null,
          highestPrice: null,
          totalSpent: 0,
          totalQuantity: 0
        }
      };
    }

    // We need to fetch all receipts and filter manually because we can't do an IN query on JSONB arrays
    const { data: receipts, error: receiptsError } = await supabase
      .from('receipts')
      .select('*')
      .order('data_compra', { ascending: false });

    if (receiptsError) throw receiptsError;

    if (!receipts || receipts.length === 0) {
      return {
        priceHistory: [],
        purchaseHistory: [],
        productStats: {
          lowestPrice: null,
          highestPrice: null,
          totalSpent: 0,
          totalQuantity: 0
        }
      };
    }

    // Process receipts and find matching items
    const history: any[] = [];
    const purchases: any[] = [];
    let lowestPrice = { price: Infinity, date: '', market: '' };
    let highestPrice = { price: -Infinity, date: '', market: '' };
    let totalSpent = 0;
    let totalQuantity = 0;

    receipts.forEach(receipt => {
      const items = receipt.items as any[];
      
      items.forEach(item => {
        const itemName = item.productName.toLowerCase();
        
        // Check if this item matches any of our original names
        if (originalNames.some(name => itemName === name.toLowerCase())) {
          const quantity = Number(item.quantity);
          const total = Number(item.total);
          const date = new Date(receipt.data_compra).toISOString().split('T')[0];
          
          // Only process valid items
          if (quantity > 0 && total > 0) {
            const unitPrice = total / quantity;
            
            history.push({
              date,
              price: unitPrice
            });

            purchases.push({
              date,
              price: unitPrice,
              market: receipt.mercado,
              quantity,
              total,
              productName: item.productName // Include original product name
            });

            if (unitPrice < lowestPrice.price) {
              lowestPrice = {
                price: unitPrice,
                date,
                market: receipt.mercado
              };
            }

            if (unitPrice > highestPrice.price) {
              highestPrice = {
                price: unitPrice,
                date,
                market: receipt.mercado
              };
            }

            totalSpent += total;
            totalQuantity += quantity;
          }
        }
      });
    });

    const sortedHistory = history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedPurchases = purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      priceHistory: sortedHistory,
      purchaseHistory: sortedPurchases,
      productStats: {
        lowestPrice: lowestPrice.price !== Infinity ? lowestPrice : null,
        highestPrice: highestPrice.price !== -Infinity ? highestPrice : null,
        totalSpent,
        totalQuantity
      }
    };
  } catch (error) {
    console.error('Error in getProductHistory:', error);
    throw error;
  }
};
