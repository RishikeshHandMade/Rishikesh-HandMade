import { NextResponse } from 'next/server';
import ShippingCharge from '../../../models/ShippingCharges';
import connectDB from '@/lib/connectDB';

export async function POST(request) {
  await connectDB();
  try {
    const { state, district, pincode, weight } = await request.json();
    if (!state || !district || !pincode) {
      return NextResponse.json({ available: false, message: 'Missing state, district, or pincode' }, { status: 400 });
    }
    // Find the state document
    const stateDoc = await ShippingCharge.findOne({ state });
    if (!stateDoc) {
      return NextResponse.json({ available: false, message: 'State not found' });
    }
    // Find the district
    const districtObj = stateDoc.districts.find(d => d.district === district);
    if (!districtObj) {
      return NextResponse.json({ available: false, message: 'District not found' });
    }
    // Find the pincode
    const pincodeObj = districtObj.pincodes.find(p => p.pincode === pincode);
    if (!pincodeObj) {
      return NextResponse.json({ available: false, message: 'Pincode not serviceable' });
    }
    // Find the shipping charge by weight (if provided)
    let shippingCharge = null;
    if (weight !== undefined && pincodeObj.shippingCharges && pincodeObj.shippingCharges.length > 0) {
      // Find the closest weight greater than or equal to the given weight
      const sorted = [...pincodeObj.shippingCharges].sort((a, b) => a.weight - b.weight);
      let found = sorted.find(sc => sc.weight >= weight);
      if (!found) found = sorted[sorted.length - 1]; // fallback to highest
      shippingCharge = found ? Number(found.shippingCharge) : null;
    } else if (pincodeObj.shippingCharges && pincodeObj.shippingCharges.length > 0) {
      // If no weight, just take the first
      shippingCharge = Number(pincodeObj.shippingCharges[0].shippingCharge);
    }
    if (shippingCharge === null) {
      return NextResponse.json({ available: false, message: 'Shipping charge not set' });
    }
    return NextResponse.json({ available: true, shippingCharge });
  } catch (error) {
    console.error('Error checking shipping:', error);
    return NextResponse.json({ available: false, message: 'Server error' }, { status: 500 });
  }
}
