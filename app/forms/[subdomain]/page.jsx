// This server page renders a form based on the requested subdomain.
// Wildcard subdomain flow: middleware rewrites requests like
// `form1.localhost:3000` -> `/forms/form1`, so this page receives
// the `subdomain` param and queries the DB for the matching form.
import connectDB from '@/lib/connectDB';
import Form from '@/models/Form';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const { subdomain } =await params;
  await connectDB();
  const form = await Form.findOne({ subdomain }).lean();
  if (!form) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Not found</h1>
        <p>No form found for <strong>{subdomain || '(empty)'}</strong></p>
        <p className="mt-2 text-sm text-gray-500">If you expected this to exist, try GET <code>/api/forms/{subdomain}</code> or GET <code>/api/forms/list</code> to inspect saved forms.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-slate-900 shadow-md rounded-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{form.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{form.email}</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">{form.subdomain}</span>
            <div className="text-xs text-slate-400 mt-1">{new Date(form.createdAt).toLocaleString()}</div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Description</h2>
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            {form.description ? (
              <p>{form.description}</p>
            ) : (
              <p className="text-slate-400">No description provided.</p>
            )}
          </div>

          <div className="mt-6 border-t pt-4 flex items-center justify-between">
            <a href={`http://${form.subdomain}.localhost:3000`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open public link</a>
            <div className="text-sm text-slate-500">Subdomain preview</div>
          </div>
        </div>
      </div>
    </div>
  );
}
