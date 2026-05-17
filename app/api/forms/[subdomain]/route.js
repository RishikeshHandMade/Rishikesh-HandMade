import connectDB from '@/lib/connectDB';
import Form from '@/models/Form';

// GET /api/forms/:subdomain
export async function GET(req, { params }) {
  await connectDB();
  try {
    const { subdomain } = params;
    const form = await Form.findOne({ subdomain }).lean();
    if (!form) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ name: form.name, email: form.email, description: form.description }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
