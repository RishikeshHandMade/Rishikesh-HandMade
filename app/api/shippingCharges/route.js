import { NextResponse } from 'next/server';
import ShippingCharge from '../../../models/ShippingCharges';
import connectDB from '@/lib/connectDB';

export async function GET(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const pincode = searchParams.get('pincode');

    let query = {};

    if (pincode) {
      query = {
        'districts.pincodes.pincode': pincode
      };
    } else if (district) {
      query = {
        'districts.district': district
      };
    } else if (state) {
      query = { state };
    }

    const shippingCharges = await ShippingCharge.find(query).sort({ createdAt: -1 });

    const formattedData = shippingCharges.map(charge => ({
      ...charge.toObject(),
      districts: charge.districts.map(district => ({
        ...district,
        pincodes: district.pincodes.map(pincode => ({
          ...pincode,
          shippingCharges: pincode.shippingCharges.map(charge => ({
            ...charge,
            weight: Number(charge.weight),
            shippingCharge: Number(charge.shippingCharge)
          }))
        }))
      }))
    }));

    return NextResponse.json(formattedData, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching shipping charges:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping charges' }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const data = await request.json();
    const { state, districts } = data;

    if (!state || !districts || !Array.isArray(districts)) {
      return NextResponse.json({ error: 'Invalid data format' }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateData = { $push: { districts: { $each: districts } } };

    const updated = await ShippingCharge.findOneAndUpdate(
      { state },
      updateData,
      { upsert: true, new: true }
    );

    return NextResponse.json(updated, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving shipping charges:', error);
    return NextResponse.json({ error: 'Failed to save shipping charges' }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request) {
  await connectDB();
  try {
    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json({ error: 'ID is required for update' }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updatedCharge = await ShippingCharge.findByIdAndUpdate(_id, data, { new: true });

    if (!updatedCharge) {
      return NextResponse.json({ error: 'Shipping charge not found' }, {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return NextResponse.json(updatedCharge, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating shipping charges:', error);
    return NextResponse.json({ error: 'Failed to update shipping charges' }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const deletedCharge = await ShippingCharge.findByIdAndDelete(id);

    if (!deletedCharge) {
      return NextResponse.json({ error: 'Shipping charge not found' }, {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return NextResponse.json({ message: 'Shipping charge deleted successfully' }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting shipping charges:', error);
    return NextResponse.json({ error: 'Failed to delete shipping charges' }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}