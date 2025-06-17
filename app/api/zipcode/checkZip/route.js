import { NextResponse } from 'next/server';
import ZipCode from '@/models/ZipCode';
import connectDB from '@/lib/connectDB';

// POST: Check if state, district, and pincode are active
export async function POST(req) {
  await connectDB();
  try {
    const { state, district, pincode } = await req.json();
    if (!state || !district || !pincode) {
      return NextResponse.json({ success: false, message: 'Missing state, district, or pincode' }, { status: 400 });
    }
    // Case-insensitive state match
    const stateDoc = await ZipCode.findOne({ state: { $regex: `^${state.trim()}$`, $options: 'i' } });
    if (!stateDoc) {
      return NextResponse.json({ success: false, message: 'State not found' }, { status: 404 });
    }
    if (!stateDoc.active) {
      return NextResponse.json({ success: false, message: 'Cannot Deliverd to this State' }, { status: 400 });
    }
    // Case-insensitive district match
    const districtObj = stateDoc.districts.find(d => d.district && d.district.trim().toLowerCase() === district.trim().toLowerCase());
    if (!districtObj) {
      return NextResponse.json({ success: false, message: 'District not found' }, { status: 404 });
    }
    if (!districtObj.active) {
      return NextResponse.json({ success: false, message: 'Cannot Deliverd to this District' }, { status: 400 });
    }
    // Find the pincode in the cities array
    if (!districtObj.cities || !Array.isArray(districtObj.cities)) {
      return NextResponse.json({ success: false, message: 'No cities (pincodes) found in this district' }, { status: 404 });
    }
    const normalizedInput = String(pincode).trim();
    const cityObj = districtObj.cities.find(
      c => String(c.pincode).trim() === normalizedInput
    );
    if (!cityObj) {
      return NextResponse.json({ success: false, message: 'Shipping is not available to this pincode' }, { status: 404 });
    }
    if (!cityObj.active) {
      return NextResponse.json({ success: false, message: 'Shipping is not available to this pincode' }, { status: 400 });
    }
    // All found and active
    return NextResponse.json({ success: true, state: stateDoc.state, district: districtObj.district, pincode });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
