import connectDB from '@/lib/connectDB';
import Form from '@/models/Form';

// POST /api/forms
export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    let { name,email, subdomain, description } = body;
    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 });
    }
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    const reserved = ['www', 'admin', 'api'];
    if (subdomain) subdomain = String(subdomain).trim().toLowerCase();

    // Generate a unique subdomain if user didn't provide one
    if (!subdomain) {
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 20);
      subdomain = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    if (reserved.includes(subdomain)) {
      return new Response(JSON.stringify({ error: 'Reserved subdomain' }), { status: 400 });
    }

    // Prevent duplicate subdomains
    const exists = await Form.findOne({ subdomain });
    if (exists) {
      return new Response(JSON.stringify({ error: 'Subdomain already exists' }), { status: 409 });
    }

    const form = await Form.create({ name, email, subdomain, description });
    return new Response(JSON.stringify({ success: true, form }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
