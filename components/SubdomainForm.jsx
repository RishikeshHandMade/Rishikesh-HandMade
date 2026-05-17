'use client';
import { useState } from 'react';

export default function SubdomainForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subdomain, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || 'Error');
        return;
      }
      const url = `http://${data.form.subdomain}.localhost:3000`;
      setGeneratedUrl(url);
      setStatus('Saved!');
      // clear form
      setName('');
      setEmail('');
      setSubdomain('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setStatus('Server error');
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 border rounded">
      <h2 className="text-xl font-semibold mb-2">Create Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block text-sm">Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border p-2" required />
        </div>
         <div className="mb-2">
          <label className="block text-sm">Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border p-2" required />
        </div>
        <div className="mb-2">
          <label className="block text-sm">Subdomain Name (optional)</label>
          <input value={subdomain} onChange={(e)=>setSubdomain(e.target.value)} className="w-full border p-2" placeholder="form1" />
        </div>
        <div className="mb-2">
          <label className="block text-sm">Description</label>
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full border p-2" />
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
          {status && <span className="text-sm">{status}</span>}
        </div>
        {generatedUrl && (
          <div className="mt-3 flex items-center gap-2">
            <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{generatedUrl}</a>
            <button
              type="button"
              onClick={async ()=>{
                try {
                  await navigator.clipboard.writeText(generatedUrl);
                  setStatus('Link copied to clipboard');
                } catch (err) {
                  setStatus('Copy failed');
                }
              }}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              Copy
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
