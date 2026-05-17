import connectDB from '@/lib/connectDB';
import Form from '@/models/Form';

// Dev helper: GET /api/forms/list — returns all forms (subdomain + name)
export async function GET() {
  await connectDB();
  try {
    const forms = await Form.find({}, { name: 1, subdomain: 1, email: 1 }).lean();
    return new Response(JSON.stringify(forms), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
