import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/connectDB';
let ArtisanPlugin
try {
  ArtisanPlugin = mongoose.model('ArtisanPlugin');
} catch {
  ArtisanPlugin = require('@/models/ArtisanPlugin');
}

const Artisan = require('@/models/Artisan');

// GET all plugins or by artisan
export async function GET(req) {
  await connectDB();
  const url = new URL(req.url);
  const artisanId = url.searchParams.get('artisan');
  try {
    let plugins;
    if (artisanId) {
      plugins = await ArtisanPlugin.findOne({ artisan: artisanId }).populate('artisan');
      return NextResponse.json({ success: true, plugin: plugins });
    } else {
      plugins = await ArtisanPlugin.find().populate('artisan');
      return NextResponse.json({ success: true, plugins });
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch plugins', error: err.message }, { status: 500 });
  }
}

// CREATE a new plugin
export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    // Ensure only one plugin per artisan
    let existing = await ArtisanPlugin.findOne({ artisan: body.artisan });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Plugin already exists for this artisan.' }, { status: 400 });
    }
    // Log the incoming body for debugging
    // console.log('Received body for SocialPlugin POST:', body);
    try {
      const plugin = await ArtisanPlugin.create(body);
      // Push plugin _id to artisan's socialPlugin field
      if (plugin.artisan) {
        await Artisan.findByIdAndUpdate(plugin.artisan, { socialPlugin: plugin._id });
      }
      return NextResponse.json({ success: true, plugin });
    } catch (pluginErr) {
      console.error('Error creating ArtisanPlugin:', pluginErr);
      return NextResponse.json({ success: false, message: 'Failed to create plugin', error: pluginErr.stack }, { status: 500 });
    }
  } catch (err) {
    console.error('Error in POST /api/artisanPlugins:', err);
    return NextResponse.json({ success: false, message: 'Failed to process request', error: err.stack }, { status: 500 });
  }
}

// UPDATE a plugin
export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;
    const updated = await ArtisanPlugin.findByIdAndUpdate(_id, updateData, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Plugin not found' }, { status: 404 });
    return NextResponse.json({ success: true, plugin: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to update plugin', error: err.message }, { status: 500 });
  }
}

// DELETE a plugin
export async function DELETE(req) {
  await connectDB();
  try {
    const { id } = await req.json();
    const deleted = await ArtisanPlugin.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Plugin not found' }, { status: 404 });
    // Remove plugin _id from artisan's socialPlugin field
    if (deleted.artisan) {
      await Artisan.findByIdAndUpdate(
        deleted.artisan,
        { $set: { socialPlugin: null } },
        { new: true }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to delete plugin', error: err.message }, { status: 500 });
  }
}
