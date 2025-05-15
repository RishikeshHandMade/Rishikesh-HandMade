import { NextResponse } from 'next/server';
import connectDB from '../../../lib/connectDB';
import ArtisanStory from '../../../models/ArtisanStory';
import mongoose from 'mongoose';
import ArtisanSchema from '../../../models/Artisan';
const Artisan = mongoose.models.Artisan || mongoose.model('Artisan', ArtisanSchema.schema);

export async function GET(req) {
  await connectDB();
  const url = new URL(req.url);
  const artisanId = url.searchParams.get('artisan');
  try {
    let stories;
    if (artisanId) {
      stories = await ArtisanStory.find({ artisan: artisanId }).populate('artisan');
      return NextResponse.json({ success: true, stories });
    } else {
      stories = await ArtisanStory.find().populate('artisan');
      return NextResponse.json({ success: true, stories });
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch stories', error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    // Check if a story already exists for this artisan
    const existing = await ArtisanStory.findOne({ artisan: body.artisan });
    if (existing) {
      return NextResponse.json({ success: false, message: 'An artisan story already exists for this artisan.' }, { status: 400 });
    }
    const story = await ArtisanStory.create(body);
    // Push story _id to artisan's artisanStories array
    if (story.artisan) {
      await Artisan.findByIdAndUpdate(
        story.artisan,
        { $set: { artisanStories: story._id } },
        { new: true }
      );
    }
    return NextResponse.json({ success: true, story });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to create story', error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;
    const updated = await ArtisanStory.findByIdAndUpdate(_id, updateData, { new: true });
    if (updateData.artisan) {
      const existing = await ArtisanStory.findOne({ artisan: updateData.artisan, _id: { $ne: _id } });
      if (existing) {
        return NextResponse.json({ success: false, message: 'An artisan story already exists for this artisan.' }, { status: 400 });
      }
    }
    if (!updated) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });
    return NextResponse.json({ success: true, story: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to update story', error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connectDB();
  try {
    const { id } = await req.json();
    const deleted = await ArtisanStory.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });
    // Remove story _id from artisan's artisanStories field
    if (deleted.artisan) {
      await Artisan.findByIdAndUpdate(
        deleted.artisan,
        { $set: { artisanStories: null } },
        { new: true }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to delete story', error: err.message }, { status: 500 });
  }
}
