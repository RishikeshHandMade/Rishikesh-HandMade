"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const sectionTitles = [
  'Profile',
  'Promotions Reviews',
  'Catalog',
  'Blog',
  'Artisan Story',
  'Social Plugins',
  'Certificates'
];

const boxStyle = {
  border: '1px solid #ced4da',
  borderRadius: '8px',
  padding: '10px',
  background: '#f8f9fa',
  minHeight: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  marginBottom: '16px'
};

const sectionConfig = [
  {
    key: 'profile',
    label: 'Profile',
    component: ({ artisanId, artisanDetails }) => (
      <div style={boxStyle}>
        <img
          src={artisanDetails?.profileImage?.url || '/artisan-placeholder.png'}
          alt="Artisan"
          className="w-32 h-32 object-cover rounded-full border mb-4"
        />
        <div className="ml-4">
          <div className="font-bold text-lg">{artisanDetails?.title} {artisanDetails?.firstName} {artisanDetails?.lastName}</div>
          <div className="text-gray-600 text-sm">Artisan Number: {artisanDetails?.artisanNumber}</div>
        </div>
      </div>
    )
  },
  {
    key: 'promotionalReviews',
    label: 'Promotions Reviews',
    component: ({ artisanId, artisanDetails }) => (
      <div style={boxStyle}>
        <div className="font-bold text-lg">Promotions Reviews</div>
        <div className="text-gray-600 text-sm">Reviews for artisan {artisanId}</div>
        <Button>View</Button>
        <Button>Delete</Button>
      </div>
    )
  },
  {
    key: 'catalog',
    label: 'Catalog',
    component: ({ artisanId }) => (
      <div style={boxStyle}>
        <div className="font-bold text-lg">Catalog</div>
        <div className="text-gray-600 text-sm">Catalog for artisan {artisanId}</div>
        <Button>View</Button>
        <Button>Delete</Button>
      </div>
    )
  },
  {
    key: 'blog',
    label: 'Blog',
    component: ({ artisanId }) => (
      <div style={boxStyle}>
        <div className="font-bold text-lg">Blog</div>
        <div className="text-gray-600 text-sm">Blog for artisan {artisanId}</div>
        <Button>View</Button>
        <Button>Delete</Button>
      </div>
    )
  },
  {
    key: 'artisanStory',
    label: 'Artisan Story',
    component: ({ artisanId }) => (
      <div style={boxStyle}>
        <div className="font-bold text-lg">Artisan Story</div>
        <div className="text-gray-600 text-sm">Story for artisan {artisanId}</div>
        <Button>View</Button>
        <Button>Delete</Button>
      </div>
    )
  },
  {
    key: 'social',
    label: 'Social Plugins',
    component: ({ artisanId }) => <div>Social plugins for artisan {artisanId} (form or cards)</div>,
  },
  {
    key: 'certifications',
    label: 'Certifications',
    component: ({ artisanId }) => <div>Certificates for artisan {artisanId} (form or cards)</div>,
  },
];

const ArtisanDashboard = () => {
  const params = useParams();
  const router = useRouter();
  const artisanId = params?.id;
  // State for artisan and all section data
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [stories, setStories] = useState([]);
  const [socialPlugin, setSocialPlugin] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [activeKey, setActiveKey] = useState('Profile');
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, type: '', id: null });

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // Fetch artisan details
        const res = await fetch(`/api/createArtisan`);
        const data = await res.json();
        const found = data.find(a => a._id === artisanId);
        setArtisan(found);
        // Fetch promotions
        const promoRes = await fetch(`/api/promotion?artisanId=${artisanId}`);
        setPromotions(await promoRes.json());
        // TODO: Fetch blogs, stories, plugins, certificates using similar APIs
        // setBlogs(...); setStories(...); setSocialPlugin(...); setCertificates(...);
      } catch (e) {
        setArtisan(null);
      } finally {
        setLoading(false);
      }
    }
    if (artisanId) fetchAll();
  }, [artisanId]);

  const handleDelete = (type, id) => setDeleteModal({ show: true, type, id });
  const handleConfirmDelete = async () => {
    try {
      if (deleteModal.type === 'promotion') {
        await fetch(`/api/promotion`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteModal.id }) });
        setPromotions(promotions.filter(p => p._id !== deleteModal.id));
      }
      // TODO: Add deletion for blogs, stories, certificates, plugins
    } catch (err) {
      // toast.error('Failed to delete.');
    } finally {
      setDeleteModal({ show: false, type: '', id: null });
    }
  };
  const handleCancelDelete = () => setDeleteModal({ show: false, type: '', id: null });

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (!artisan) return <div className="text-center my-5">Artisan not found.</div>;

  return (
    <div className="flex" style={{ minHeight: '85vh', background: '#f8f9fa', padding: '20px' }}>
      {/* Sidebar */}
      <div style={{ minWidth: 240, border: '1px solid #ced4da', borderRadius: '8px', background: '#fff', height: '100%', overflowY: 'auto', padding: '15px' }} className="me-4 shadow-sm">
        <div className="flex flex-col gap-2">
          {sectionTitles.map(section => (
            <div
              key={section}
              onClick={() => setActiveKey(section)}
              className={`text-center cursor-pointer px-4 py-3 rounded mb-2 transition-all font-medium ${activeKey === section ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} hover:bg-blue-400`}
            >
              {section}
            </div>
          ))}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1" style={{ border: '1px solid #ced4da', borderRadius: '8px', background: '#fff', padding: '20px', height: '100%', overflowY: 'auto' }}>
        <h2 className="mb-4 text-center" style={{ fontWeight: 600 }}>{activeKey}</h2>
        {/* Profile Section */}
        {activeKey === 'Profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={boxStyle}><b>Name: &nbsp;</b>{artisan.title} {artisan.firstName} {artisan.lastName}</div>
            <div style={boxStyle}><b>{artisan.fatherHusbandType || 'Father/Husband'}'s Name: &nbsp;</b> {artisan.fatherHusbandTitle} {artisan.fatherHusbandName} {artisan.fatherHusbandLastName}</div>
            <div style={boxStyle}><b>Artisan Number: &nbsp;</b> {artisan.artisanNumber || 'N/A'}</div>
            <div style={boxStyle}><b>SHG Name: &nbsp;</b> {artisan.shgName || 'N/A'}</div>
            <div style={boxStyle}><b>Mobile: &nbsp;</b> {artisan.contact?.callNumber || artisan.contact?.whatsappNumber || 'N/A'}</div>
            <div style={boxStyle}><b>Email: &nbsp;</b> {artisan.contact?.email || artisan.email || 'N/A'}</div>
            <div style={boxStyle}><b>Years of Experience: &nbsp;</b> {artisan.yearsOfExperience || 'N/A'}</div>
            <div style={boxStyle}><b>Specializations: &nbsp;</b> {artisan.specializations && artisan.specializations.length > 0 ? artisan.specializations.join(', ') : 'N/A'}</div>
            <div style={boxStyle} className='max-h-24 overflow-y-auto py-1'><b>Address: &nbsp;</b>{artisan.address ? artisan.address.fullAddress : 'N/A'}</div>
            <div style={boxStyle}><b>City: &nbsp;</b> {artisan.address?.city || 'N/A'}</div>
            <div style={boxStyle}><b>State: &nbsp;</b> {artisan.address?.state || 'N/A'}</div>
            <div className="col-span-2 text-center"><div style={{ ...boxStyle, background: '#fff', display: 'flex', justifyContent: 'center' }}>
              {artisan.profileImage?.url ? (
                <img src={artisan.profileImage.url} alt="Artisan" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '10px' }} />
              ) : (
                <div>No Image Available</div>
              )}
            </div></div>
          </div>
        )}
        {/* Promotions Section */}
        {activeKey === 'Promotions Reviews' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promotions.length === 0 ? (
              <div className="col-span-3 text-center">No promotions found for this artisan.</div>
            ) : (
              promotions.map((promotion, idx) => (
                <div key={promotion._id || idx} className="relative bg-white rounded-xl shadow-lg p-6 flex flex-col items-start min-h-[220px]">
                  {/* Rating at top-right */}
                  <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs font-bold shadow">
                    ⭐ {promotion.rating || 'N/A'}
                  </div>
                  {/* Created By */}
                  <div className="font-semibold mb-1">{promotion.createdBy}</div>
                  {/* Description Box */}
                  <div className="text-gray-700 mb-2" style={{ flexGrow: 1, minHeight: '60px', maxHeight: '120px', overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: promotion.shortDescription || 'No description available.' }} />
                  {/* View, Delete Buttons */}
                  <div className="flex gap-2 mt-2 self-end">
                    <Button size="sm" variant="default" onClick={() => { setSelectedPromotion(promotion); setShowPromotionModal(true); }}>View</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete('promotion', promotion._id)}>Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* TODO: Add Blog, Story, Plugins, Certificates sections here */}
        {/* Promotion Modal */}
        {showPromotionModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full shadow-lg relative">
              <button className="absolute top-2 right-2 text-xl" onClick={() => setShowPromotionModal(false)}>×</button>
              <h3 className="mb-4 text-lg font-semibold">Promotion Details</h3>
              {selectedPromotion && (
                <div>
                  <div className="mb-2 font-bold">Title: {selectedPromotion.title || 'Untitled Promotion'}</div>
                  <div className="mb-2">Created By: {selectedPromotion.artisan?.title} {selectedPromotion.artisan?.firstName} {selectedPromotion.artisan?.lastName}</div>
                  <div className="mb-2">Artisan Number: {selectedPromotion.artisan?.artisanNumber || 'N/A'}</div>
                  <div className="mb-2">Short Text: {selectedPromotion.shortText || 'N/A'}</div>
                  <div className="mb-2">Description: <span dangerouslySetInnerHTML={{ __html: selectedPromotion.shortDescription || '' }} /></div>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <Button variant="secondary" onClick={() => setShowPromotionModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg relative">
              <button className="absolute top-2 right-2 text-xl" onClick={handleCancelDelete}>×</button>
              <h3 className="mb-4 text-lg font-semibold">Confirm Delete</h3>
              <div className="mb-4">Are you sure you want to delete this item?</div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={handleCancelDelete}>Cancel</Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );



  // useEffect(() => {
  //   // Try to get artisan from sessionStorage (set in EditArtisan)
  //   let artisan = null;
  //   try {
  //     const stored = sessionStorage.getItem(`artisan_${artisanId}`);
  //     if (stored) {
  //       artisan = JSON.parse(stored);
  //     }
  //   } catch { }
  //   if (artisan) {
  //     setArtisanDetails(artisan);
  //   } else if (artisanId) {
  //     // fallback: fetch from API
  //     fetch(`/api/createArtisan`).then(res => res.json()).then(data => {
  //       const found = data.find(a => a._id === artisanId);
  //       if (found) setArtisanDetails(found);
  //     });
  //   }
  // }, [artisanId]);

  // if (!artisanId) {
  //   return <div>No artisan selected.</div>;
  // }

  // return (
  //   <div style={{ minHeight: '85vh', background: '#fff', padding: '20px' }}>
  //     {artisanDetails && (
  //       <div className="mb-4 p-4 bg-blue-50 rounded shadow flex gap-8 items-center">
  //         <div>
  //           <div className="font-bold text-lg">{artisanDetails.title} {artisanDetails.firstName} {artisanDetails.lastName}</div>
  //           <div className="text-gray-600 text-sm">Artisan Number: {artisanDetails.artisanNumber}</div>
  //         </div>
  //       </div>
  //     )}
  //     {/* Sidebar and Section Card Layout */}
  //     <div className="flex h-full">
  //       {/* Sidebar Tabs */}
  //       <div className="flex flex-col gap-2 min-w-[220px] w-[220px] bg-gray-300 border-r border-gray-200 py-4 px-2 rounded-l-lg shadow-sm h-fit">
  //         {sectionConfig.map(section => (
  //           <div
  //             key={section.key}
  //             onClick={() => setActiveSection(section.key)}
  //             className={`text-base px-6 py-3 text-left rounded-lg transition-all font-medium cursor-pointer
  //               ${activeSection === section.key ? 'bg-blue-600 text-white' : 'bg-blue-100 text-gray-900'}
  //               hover:bg-blue-400 focus:outline-none w-full`}
  //             style={{ justifyContent: 'flex-start', marginBottom: 6 }}
  //           >
  //             {section.label}
  //           </div>
  //         ))}
  //       </div>
  //       {/* Section Card Data */}
  //       <div className="flex-1 flex justify-center items-start p-8">
  //         <div className="relative bg-white rounded-xl shadow-lg p-6 flex flex-col items-center w-full max-w-md min-h-[320px]">
  //           {/* Review at top right */}
  //           <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs font-bold shadow">
  //             {/* Replace with actual review/rating logic if available */}
  //             Review: {artisanDetails?.rating ?? 'N/A'}
  //           </div>
  //           {/* Artisan Image */}
  //           <img
  //             src={artisanDetails?.profileImage?.url || '/artisan-placeholder.png'}
  //             alt="Artisan"
  //             className="w-32 h-32 object-cover rounded-full border mb-4"
  //           />
  //           {/* Section Title */}
  //           <div className="font-bold text-lg mb-2">{sectionConfig.find(s => s.key === activeSection)?.label}</div>
  //           {/* Section Description or Data Preview */}
  //           <div className="text-gray-700 mb-4 text-center">
  //             {/* Show minimal data preview - can be customized per section */}
  //             {artisanDetails?.firstName} {artisanDetails?.lastName}
  //           </div>
  //           {/* Action Buttons */}
  //           <div className="flex gap-4 mt-auto">
  //             <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">View</button>
  //             <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Delete</button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default ArtisanDashboard;