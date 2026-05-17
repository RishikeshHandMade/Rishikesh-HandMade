// This server page renders a form based on the requested subdomain.
// feedback.rishikeshhandmade.com
// middleware -> /forms/feedback

import connectDB from '@/lib/connectDB';
import Form from '@/models/Form';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const { subdomain } = params;

  await connectDB();

  const form = await Form.findOne({ subdomain }).lean();

  if (!form) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">
          Not found
        </h1>

        <p>
          No form found for{" "}
          <strong>{subdomain}</strong>
        </p>
      </div>
    );
  }

  // .env:
  // NEXT_PUBLIC_BASE_URL=https://rishikeshhandmade.com

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://rishikeshhandmade.com";

  const domain = new URL(baseUrl).hostname;

  const publicUrl =
    `https://${form.subdomain}.${domain}`;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow border">

        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">
            {form.name}
          </h1>

          <p className="text-gray-500">
            {form.email}
          </p>
        </div>

        <div className="p-6">

          <h2 className="font-medium mb-2">
            Description
          </h2>

          <p>
            {form.description}
          </p>

          <div className="mt-6 border-t pt-4 flex justify-between">

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open public link
            </a>

            <span className="text-sm text-gray-500">
              {publicUrl}
            </span>

          </div>

        </div>

      </div>
    </div>
  );
}