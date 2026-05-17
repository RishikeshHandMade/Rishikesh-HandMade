// This server page renders a form based on the requested subdomain.
// Wildcard subdomain flow:
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
          <strong>{subdomain || "(empty)"}</strong>
        </p>
      </div>
    );
  }

  // example:
  // NEXT_PUBLIC_BASE_URL=https://rishikeshhandmade.com

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const parsed = new URL(baseUrl);

  // localhost:3000 in dev
  // rishikeshhandmade.com in prod

  const host =
    process.env.NODE_ENV === "development"
      ? parsed.host
      : parsed.hostname;

  const protocol =
    process.env.NODE_ENV === "development"
      ? "http"
      : "https";

  const publicUrl =
    `${protocol}://${form.subdomain}.${host}`;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-slate-900 shadow-md rounded-lg border overflow-hidden">

        <div className="px-6 py-5 border-b flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-semibold">
              {form.name}
            </h1>

            <p className="text-sm text-slate-500">
              {form.email}
            </p>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
              {form.subdomain}
            </span>

            <div className="text-xs text-slate-400 mt-1">
              {new Date(
                form.createdAt
              ).toLocaleString()}
            </div>
          </div>

        </div>

        <div className="p-6">

          <h2 className="text-lg font-medium mb-3">
            Description
          </h2>

          {form.description ? (
            <p>{form.description}</p>
          ) : (
            <p className="text-slate-400">
              No description provided
            </p>
          )}

          <div className="mt-6 border-t pt-4 flex justify-between">

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open public link
            </a>

            <div className="text-sm text-slate-500">
              {publicUrl}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}