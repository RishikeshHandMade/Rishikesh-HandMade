// import { NextResponse } from 'next/server';
// import ZipCode from '@/models/ZipCode';
// import connectDB from '@/lib/connectDB';

// // GET: List all states/districts and their status
// export async function GET() {
//   await connectDB();
//   try {
//     const all = await ZipCode.find();
//     return NextResponse.json({ success: true, data: all });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // POST: Upsert a state's district status
// export async function POST(req) {
//   await connectDB();
//   try {
//     const { state, districts } = await req.json();
//     if (!state || !Array.isArray(districts)) {
//       return NextResponse.json({ success: false, error: 'State and districts required' }, { status: 400 });
//     }
//     const doc = await ZipCode.findOneAndUpdate(
//       { state },
//       { $set: { districts } },
//       { upsert: true, new: true }
//     );
//     return NextResponse.json({ success: true, data: doc });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // PATCH: Toggle active status for state or district
// export async function PATCH(req) {
//   await connectDB();
//   try {
//     const { state, district, active } = await req.json();
//     console.log('PATCH handler received:', { state, district, active, typeofDistrict: typeof district, districtLength: district && district.length });
//     if (!state || typeof active !== 'boolean') {
//       return NextResponse.json({ success: false, error: 'State and active required' }, { status: 400 });
//     }
//     let updatedDoc;
//     if (typeof district !== 'string' || district.trim() === '') {
//       // Toggle state active
//       updatedDoc = await ZipCode.findOneAndUpdate(
//         { state },
//         { $set: { active } },
//         { new: true }
//       );
//     } else {
//       // Fallback: update district active in JS and save (works on any MongoDB version)
//       console.log('Entering district toggle branch:', district);
//       let doc = await ZipCode.findOne({ state });
//       if (doc && Array.isArray(doc.districts)) {
//         let found = false;
//         doc.districts.forEach(d => {
//           console.log('Comparing:', JSON.stringify(d.district), 'vs', JSON.stringify(district));
//           if (d.district && d.district.trim().toLowerCase() === district.trim().toLowerCase()) {
//             d.active = active;
//             found = true;
//             console.log('MATCHED:', JSON.stringify(d.district));
//           }
//         });
//         if (found) {
//           await doc.save();
//           console.log('After save districts:', JSON.stringify(doc.districts));
//           updatedDoc = doc;
//         } else {
//           console.log('No district matched for update.');
//           updatedDoc = null;
//         }
//       } else {
//         updatedDoc = null;
//       }
//     }

//     if (!updatedDoc) {
//       return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
//     }
//     return NextResponse.json({ success: true, data: updatedDoc });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import ZipCode from '@/models/ZipCode';
import connectDB from '@/lib/connectDB';

// GET: List all states/districts and their status
export async function GET() {
  await connectDB();
  try {
    const all = await ZipCode.find();
    return NextResponse.json({ success: true, data: all });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Upsert a state's district list (REPLACES all districts for that state)
export async function POST(req) {
  await connectDB();
  try {
    const { state, districts } = await req.json();
    if (!state?.trim() || !Array.isArray(districts)) {
      return NextResponse.json({ success: false, error: 'State and districts are required' }, { status: 400 });
    }

    const doc = await ZipCode.findOneAndUpdate(
      { state: state.trim() },
      { $set: { districts } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Toggle active status for a state or district
export async function PATCH(req) {
  await connectDB();
  try {
    const { state, district, active } = await req.json();

    if (!state || typeof active !== 'boolean') {
      return NextResponse.json({ success: false, error: 'State and active required' }, { status: 400 });
    }

    const doc = await ZipCode.findOne({ state: state.trim() });

    if (!doc) {
      return NextResponse.json({ success: false, error: 'State not found' }, { status: 404 });
    }

    if (!district || district.trim() === '') {
      // Toggle state active
      doc.active = active;
    } else {
      // Toggle district active
      const districtIndex = doc.districts.findIndex(
        d => d.district?.trim().toLowerCase() === district.trim().toLowerCase()
      );

      if (districtIndex === -1) {
        return NextResponse.json({ success: false, error: 'District not found' }, { status: 404 });
      }

      // ✅ Set new active value
      doc.districts[districtIndex].active = active;

      // ✅ FORCE mongoose to track nested array update
      doc.markModified('districts');
    }

    await doc.save();

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

