"use client"
import React, { useState, useEffect } from 'react';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import CategoryTag from './CategoryTag';
import CreateReview from './CreateReview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ColorManagement from './ColorManagement';
import PriceDiscount from './PriceDiscount';
import VideoManagement from './VideoManagement';
import ProductDescription from './ProductDescription';
import SizeManagement from './SizeManagement';
import QualityManagement from './QualityManagement';



const AddDirectProduct = ({ productId }) => {
  const sectionConfig = [
    { key: 'size', label: 'Size Management', component: (props) => <SizeManagement {...props} productId={productId} /> },
    { key: 'color', label: 'Color Management', component: (props) => <ColorManagement {...props} /> },
    { key: 'price', label: 'Price / Discount', component: (props) => <PriceDiscount {...props} /> },
    { key: 'gallery', label: 'Product Gallery', component: (props) => <ProductGallery {...props} /> },
    { key: 'video', label: 'Video Management', component: (props) => <VideoManagement {...props} /> },
    { key: 'description', label: 'Product Description', component: (props) => <ProductDescription {...props} /> },
    { key: 'info', label: 'Product Information', component: (props) => <ProductInfo {...props} /> },
    { key: 'tag', label: 'Category Tag', component: (props) => <CategoryTag {...props} /> },
    { key: 'review', label: 'Create Review', component: (props) => <CreateReview {...props} /> },
    { key: 'quality', label: 'Quality Management', component: (props) => <QualityManagement {...props} /> },
  ];
  const [activeSection, setActiveSection] = useState(sectionConfig[0].key);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      fetch(`/api/product/${productId}`)
        .then(res => res.json())
        .then(data => {
          setProductData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [productId]);

  return (
    <div style={{ minHeight: '85vh', background: '#fff', padding: '20px' }}>
      {loading ? (
        <div className="text-center text-lg font-semibold">Loading product...</div>
      ) : (
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full h-full">
          <div className="flex h-full">
            {/* Sidebar Tabs */}
            <TabsList className="flex flex-col gap-2 min-w-[220px] w-[220px] bg-gray-300 border-r border-gray-200 py-4 px-2 rounded-l-lg shadow-sm h-fit">
              {sectionConfig.map(section => (
                <TabsTrigger
                  key={section.key}
                  value={section.key}
                  className={
                    `text-base px-6 py-3 text-left rounded-lg transition-all font-medium
                    data-[state=active]:bg-blue-600 data-[state=active]:text-white
                    data-[state=inactive]:bg-blue-100 data-[state=inactive]:text-gray-900
                    hover:bg-blue-400 focus:outline-none w-full`
                  }
                  style={{ justifyContent: 'flex-start' }}
                >
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* Section Content */}
            <div className="flex-1 p-4 rounded-r-lg shadow-sm min-h-[400px]">
              {sectionConfig.map(section => (
                <TabsContent key={section.key} value={section.key} className="h-full">
                  {section.component({ productData })}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      )}
    </div>
  );
};

export default AddDirectProduct;