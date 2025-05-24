import React, { useState } from 'react';

const faqData = [
  {
    key: 'general',
    label: 'General',
    icon: <span className="text-lg">💬</span>,
    faqs: [
      {
        q: 'How can I contact customer support?',
        a: 'If your order has not yet shipped, you can contact us to change your shipping address. If your order has already shipped, we may not be able to change the address.'
      },
      {
        q: 'Can I cancel my order?',
        a: 'Yes, you can cancel your order before it has shipped by contacting support.'
      },
      {
        q: 'Do you offer international shipping?',
        a: 'Yes, we ship internationally. Shipping fees and times vary by location.'
      },
      {
        q: 'Can I track my order in real-time?',
        a: 'Yes, tracking information will be provided once your order ships.'
      },
      {
        q: 'How do I know if a product is in stock?',
        a: 'Stock information is shown on each product page.'
      },
      {
        q: 'Can I place an order over the phone?',
        a: 'Currently, we only accept online orders.'
      },
    ],
  },
  {
    key: 'returns',
    label: 'Returns',
    icon: <span className="text-lg">↩️</span>,
    faqs: [
      { q: 'What is your return policy?', a: 'Returns are accepted within 30 days of delivery. Items must be unused and in original packaging.' },
      { q: 'How do I start a return?', a: 'Contact our support team to initiate a return.' },
      { q: 'Are returns free?', a: 'Return shipping costs may apply unless the item is defective.' },
    ],
  },
  {
    key: 'gift',
    label: 'Gift',
    icon: <span className="text-lg">🎁</span>,
    faqs: [
      { q: 'Can I send my order as a gift?', a: 'Yes, just select the gift option at checkout.' },
      { q: 'Do you offer gift wrapping?', a: 'Gift wrapping is available for an additional fee.' },
    ],
  },
  {
    key: 'refunds',
    label: 'Refunds',
    icon: <span className="text-lg">💸</span>,
    faqs: [
      { q: 'How long do refunds take?', a: 'Refunds are processed within 5-7 business days after receiving your return.' },
      { q: 'Will I be refunded the shipping cost?', a: 'Shipping costs are non-refundable unless the item is defective.' },
    ],
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: <span className="text-lg">💳</span>,
    faqs: [
      { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards, UPI, and netbanking.' },
      { q: 'Is my payment information secure?', a: 'Yes, we use industry-standard encryption.' },
    ],
  },
  {
    key: 'shipping',
    label: 'Shipping',
    icon: <span className="text-lg">🚚</span>,
    faqs: [
      { q: 'How much does shipping cost?', a: 'Shipping costs depend on your location and order value.' },
      { q: 'How long does delivery take?', a: 'Delivery usually takes 3-7 business days within India.' },
    ],
  },
];

const leftImage = 'https://images.unsplash.com/photo-1515165562835-cd4d3a0fdc61?auto=format&fit=crop&w=600&q=80';

const Faq = () => {
  const [selectedSection, setSelectedSection] = useState(faqData[0].key);
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  const section = faqData.find((s) => s.key === selectedSection);

  const filteredFaqs = section.faqs.filter(faq =>
    faq.q.toLowerCase().includes(search.toLowerCase()) ||
    faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex w-full min-h-screen bg-[#fcf7f2]">
      {/* Left Side */}
      <div className="w-[35%] min-w-[320px] max-w-md flex flex-col px-8 pt-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Have any questions?</h2>
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <span>Home</span>
          <span className="mx-1">›</span>
          <span className="font-semibold">Faqs</span>
        </nav>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {faqData.map((s) => (
            <button
              key={s.key}
              onClick={() => { setSelectedSection(s.key); setOpenIdx(null); }}
              className={`flex items-center gap-2 border rounded-lg px-4 py-3 font-medium text-left transition-all duration-150 ${selectedSection === s.key ? 'border-[#e6b17a] bg-[#fdf4e7]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
        <img src={leftImage} alt="Delivery person" className="rounded-xl w-full h-56 object-cover mb-4" />
      </div>
      {/* Right Side */}
      <div className="flex-1 px-10 py-8">
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          {/* Search */}
          <div className="relative mb-2">
            <input
              type="text"
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e6b17a]"
              placeholder="Search FAQ"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-2-2"/></svg>
          </div>
          {/* FAQ List */}
          <div className="flex flex-col gap-3">
            {filteredFaqs.length === 0 && (
              <div className="text-gray-400 text-center py-8">No FAQs found.</div>
            )}
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg bg-white">
                <button
                  className="flex w-full justify-between items-center px-5 py-4 text-left font-medium text-base focus:outline-none"
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <span className="text-xl">{openIdx === idx ? '-' : '+'}</span>
                </button>
                {openIdx === idx && (
                  <div className="px-5 pb-4 pt-0 text-gray-700 text-sm border-t border-gray-100 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;