import connectDB from "@/lib/connectDB";
import mongoose from 'mongoose';
let Artisan;
try {
  Artisan = mongoose.model('Artisan');
} catch {
  Artisan = require('@/models/Artisan');
}
import { addSpecializationIfNotExists } from "@/lib/specialization";
import { deleteFileFromUploadthing } from "@/utils/Utapi";

// Helper to normalize form data
function normalizeFormData(body) {
  const normalized = {};
  for (const key in body) {
    if (Array.isArray(body[key])) {
      normalized[key] = body[key][0];
    } else {
      normalized[key] = body[key];
    }
  }
  if (normalized.yearsOfExperience) {
    normalized.yearsOfExperience = Number(normalized.yearsOfExperience);
  }
  if (typeof normalized.specializations === 'string') {
    try {
      normalized.specializations = JSON.parse(normalized.specializations);
    } catch {}
  }
  if (!Array.isArray(normalized.specializations)) {
    normalized.specializations = normalized.specializations ? [normalized.specializations] : [];
  }
  return normalized;
}

export async function POST(req) {
  try {
    await connectDB();
    // Only accept JSON payloads with image URL from UploadThing
    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.firstName || !data.lastName || !data.fatherHusbandType || !data.fatherHusbandTitle || !data.fatherHusbandName || 
        !data.fatherHusbandLastName || !data.shgName || !data.artisanNumber || !data.yearsOfExperience || 
        !data.callNumber || !data.address || !data.city || !data.state) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    // Accept profileImage as a URL (and optionally key)
    const profileImage = data.profileImage ? data.profileImage : null;

    const artisan = new Artisan({
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      fatherHusbandType: data.fatherHusbandType,
      fatherHusbandTitle: data.fatherHusbandTitle,
      fatherHusbandName: data.fatherHusbandName,
      fatherHusbandLastName: data.fatherHusbandLastName,
      shgName: data.shgName,
      artisanNumber: data.artisanNumber,
      yearsOfExperience: Number(data.yearsOfExperience),
      specializations: data.specializations,
      contact: {
        callNumber: data.callNumber,
        whatsappNumber: data.whatsappNumber,
        email: data.email
      },
      address: {
        fullAddress: data.address,
        city: data.city,
        state: data.state
      },
      profileImage: (typeof profileImage === 'object' && profileImage !== null && profileImage.url) ? profileImage.url : (typeof profileImage === 'string' ? profileImage : '')
    });
    await artisan.save();
    if (Array.isArray(data.specializations)) {
      for (const spec of data.specializations) {
        await addSpecializationIfNotExists(spec);
      }
    }
    return new Response(JSON.stringify({ message: 'Artisan profile created successfully', artisan }), { status: 201 });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.artisanNumber) {
      return new Response(JSON.stringify({ message: 'Artisan number already exists', code: 11000 }), { status: 400 });
    }
    console.error('Error creating artisan profile:', err);
    return new Response(JSON.stringify({ message: 'Error creating artisan profile', error: err.message }), { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const artisans = await Artisan.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(artisans), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error fetching artisans', error: error.message }), { status: 500 });
  }
}

// PUT handler for editing an artisan
export async function PATCH(req) {
  try {
    await connectDB();
    const data = await req.json();
    const { id, ...updateFields } = data;
    if (!id) {
      return new Response(JSON.stringify({ message: 'Missing artisan ID' }), { status: 400 });
    }
    // Remove undefined fields from updateFields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
    // If specializations is a string, parse it
    if (typeof updateFields.specializations === 'string') {
      try {
        updateFields.specializations = JSON.parse(updateFields.specializations);
      } catch {}
    }
    if (!Array.isArray(updateFields.specializations)) {
      updateFields.specializations = updateFields.specializations ? [updateFields.specializations] : [];
    }
    // Allow toggling active status
    if (typeof updateFields.active !== 'undefined') {
      updateFields.active = !!updateFields.active;
    }
    console.log('PATCH updateFields:', updateFields); // Debug log
    // Directly replace all fields with the new data (admin full update)
    const updatedArtisan = await Artisan.findByIdAndUpdate(id, updateFields, { new: true, overwrite: false });
    if (!updatedArtisan) {
      return new Response(JSON.stringify({ message: 'Artisan not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Artisan profile updated successfully', artisan: updatedArtisan }), { status: 200 });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.artisanNumber) {
      return new Response(JSON.stringify({ message: 'Artisan number already exists', code: 11000 }), { status: 400 });
    }
    return new Response(JSON.stringify({ message: 'Error updating artisan', error: error.message }), { status: 500 });
  }
}


export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    const artisan = await Artisan.findById(id);
    if (!artisan) {
      return new Response(JSON.stringify({ message: 'Artisan not found' }), { status: 404 });
    }
    // Delete the image from Uploadthing if key exists
    if (artisan.profileImage?.key) {
      try {
        await deleteFileFromUploadthing(artisan.profileImage.key);
      } catch (err) {
        console.error('Uploadthing deletion failed:', err.message);
      }
    }
    await Artisan.findByIdAndDelete(id);
    return new Response(JSON.stringify({ message: 'Artisan profile deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}
