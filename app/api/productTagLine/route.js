import ProductTagLine from '../../../models/ProductTagLine';
import connectDB from "@/lib/connectDB";
import Product from '@/models/Product';

// GET: Return product highlights or all unique highlights if allTags=1
export async function GET(req) {
  await connectDB();
  const url = new URL(req.url, 'http://localhost');
  
  // Return all unique highlights
  if (url.searchParams.get('allTags') === '1') {
    const allHighlightsDocs = await ProductTagLine.find({}, 'highlights');
    const highlightsSet = new Set();
    allHighlightsDocs.forEach(doc => {
      if (Array.isArray(doc.highlights)) {
        doc.highlights.forEach(highlight => highlight && highlightsSet.add(highlight));
      }
    });
    return Response.json({ highlights: Array.from(highlightsSet) });
  }

  // Get highlights for a specific product
  const product = url.searchParams.get('product');
  if (product) {
    try {
      const entry = await ProductTagLine.findOne({ product });
      // If no entry exists, return empty highlights array
      if (!entry) {
        return Response.json({ 
          success: true, 
          data: { 
            product, 
            highlights: []
          } 
        });
      }
      return Response.json({ success: true, data: entry });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  
  return Response.json({ 
    error: 'Missing required query parameter: allTags=1 or product=ID' 
  }, { status: 400 });
}
// POST: Create or update highlights for a product
export async function POST(req) {
  await connectDB();
  try {
    const { product, highlights } = await req.json();
    
    // Validate input
    if (!product) {
      return Response.json({ error: 'Product ID is required.' }, { status: 400 });
    }
    
    // Validate highlights
    if (!Array.isArray(highlights) || highlights.length === 0) {
      return Response.json({ 
        error: 'At least one highlight is required.' 
      }, { status: 400 });
    }

    // Clean and validate highlights
    const cleanHighlights = highlights
      .map(h => typeof h === 'string' ? h.trim() : '')
      .filter(h => h.length > 0);

    if (cleanHighlights.length === 0) {
      return Response.json({ 
        error: 'At least one valid highlight is required.' 
      }, { status: 400 });
    }

    // Update or create the document
    const options = { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    };

    const result = await ProductTagLine.findOneAndUpdate(
      { product },
      { $set: { highlights: cleanHighlights } },
      options
    );

    // Update the product reference
    if (result?._id) {
      await Product.findByIdAndUpdate(
        product, 
        { $set: { productTagLine: result._id } }
      );
    }

    return Response.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error saving highlights:', error);
    return Response.json({ 
      error: error.message || 'Failed to save highlights' 
    }, { status: 500 });
  }
}

// PATCH: Update highlights for a product (only if exists)
export async function PATCH(req) {
  await connectDB();
  try {
    const { product, highlights } = await req.json();
    
    if (!product) {
      return Response.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    // Check if the document exists first
    const existing = await ProductTagLine.findOne({ product });
    if (!existing) {
      return Response.json({ 
        error: 'No highlights found for this product. Use POST to create.' 
      }, { status: 404 });
    }

    // Validate highlights
    if (!Array.isArray(highlights) || highlights.length === 0) {
      return Response.json({ 
        error: 'At least one highlight is required.' 
      }, { status: 400 });
    }

    // Clean and validate highlights
    const cleanHighlights = highlights
      .map(h => typeof h === 'string' ? h.trim() : '')
      .filter(h => h.length > 0);

    if (cleanHighlights.length === 0) {
      return Response.json({ 
        error: 'At least one valid highlight is required.' 
      }, { status: 400 });
    }

    const updated = await ProductTagLine.findOneAndUpdate(
      { product },
      { $set: { highlights: cleanHighlights } },
      { new: true }
    );

    return Response.json({ 
      success: true, 
      data: updated 
    });
  } catch (error) {
    console.error('Error updating highlights:', error);
    return Response.json({ 
      error: error.message || 'Failed to update highlights' 
    }, { status: 500 });
  }
}

// DELETE: Delete highlights for a product
export async function DELETE(req) {
  await connectDB();
  try {
    const url = new URL(req.url, 'http://localhost');
    const product = url.searchParams.get('product');
    const id = url.searchParams.get('id');
    
    let result;
    let deletedProductId;
    
    if (product) {
      const doc = await ProductTagLine.findOne({ product });
      if (doc) {
        deletedProductId = doc.product;
        result = await ProductTagLine.deleteOne({ product });
      }
    } else if (id) {
      const doc = await ProductTagLine.findById(id);
      if (doc) {
        deletedProductId = doc.product;
        result = await ProductTagLine.deleteOne({ _id: id });
      }
    } else {
      return Response.json({ error: "Product or id required." }, { status: 400 });
    }
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}