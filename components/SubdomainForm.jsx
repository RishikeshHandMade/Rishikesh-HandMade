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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          subdomain,
          description
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || 'Error');
        return;
      }

      // .env
      // NEXT_PUBLIC_BASE_URL=https://rishikeshhandmade.com

      const domain = new URL(
        process.env.NEXT_PUBLIC_BASE_URL
      ).hostname;

      const url =
        `https://${data.form.subdomain}.${domain}`;

      setGeneratedUrl(url);

      setStatus('Saved!');

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

      <h2 className="text-xl font-semibold mb-2">
        Create Form
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="mb-2">
          <label>Name</label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2"
            required
          />
        </div>

        <div className="mb-2">
          <label>Email</label>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2"
            required
          />
        </div>

        <div className="mb-2">
          <label>Subdomain</label>

          <input
            value={subdomain}
            onChange={(e) => {
              const value = e.target.value
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")      // spaces → -
                .replace(/[^a-z0-9-]/g, "") // remove special chars
                .replace(/-+/g, "-");       // remove repeated -

              setSubdomain(value);
            }}
            className="w-full border p-2"
            placeholder="akhil-maratha"
          />
        </div>

        <div className="mb-2">
          <label>Description</label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2"
          />
        </div>

        <div className="flex gap-2 items-center">

          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Save
          </button>

          {status && (
            <span>{status}</span>
          )}

        </div>

        {generatedUrl && (

          <div className="mt-4">

            <a
              href={generatedUrl}
              target="_blank"
              className="text-blue-600 underline"
            >
              {generatedUrl}
            </a>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  generatedUrl
                );

                setStatus(
                  'Link copied'
                );
              }}
              className="ml-2 px-2 py-1 bg-gray-200 rounded"
            >
              Copy
            </button>

          </div>

        )}

      </form>
    </div>
  );
}