"use client"
import React, { useState, useEffect } from 'react';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import CategoryTag from './CategoryTag';
import ProductReview from './ProductReview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ColorManagement from './ColorManagement';
import VideoManagement from './VideoManagement';
import ProductDescription from './ProductDescription';
import SizeManagement from './SizeManagement';
import QuantityManagement from './QuantityManagement';
import ApplyCoupon from './ApplyCoupon';
import ApplyTax from './ApplyTax';

const AddDirectProduct = ({ productId }) => {

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  // console.log(productData)
  useEffect(() => {
    if (productId) {
      setLoading(true);
      fetch(`/api/product/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(data => {
          setProductData(data);
          // console.log(data)
          // Add title to the page based on product type
          document.title = `${data.isDirect ? 'Direct' : 'Category'} Product - ${data.title}`;
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    // console.log(productId)
    // useEffect(() => {
    //   if (productId) {
    //     setLoading(true);
    //     fetch('/api/product', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify({
    //         isDirect: true,
    //         productId: productId
    //       })
    //     })
    //     .then(res => res.json())
    //     .then(data => {
    //       setProductData(data);
    //       setLoading(false);
    //     })
    //     .catch(() => setLoading(false));
    //   }
  }, [productId]);

  const sectionConfig = [
    { key: 'size', label: 'Size Management', component: (props) => <SizeManagement {...props} productData={productData} productId={productId} /> },
    { key: 'color', label: 'Color Management', component: (props) => <ColorManagement {...props} productData={productData} productId={productId} /> },
    { key: 'quantity', label: 'Price / Quantity', component: (props) => <QuantityManagement {...props} productData={productData} productId={productId} /> },
    { key: 'apply', label: 'Apply Coupon', component: (props) => <ApplyCoupon {...props} productData={productData} productId={productId} /> },
    { key: 'tax', label: 'Apply Tax', component: (props) => <ApplyTax {...props} productData={productData} productId={productId} /> },
    { key: 'gallery', label: 'Product Gallery', component: (props) => <ProductGallery {...props} productData={productData} productId={productId} /> },
    { key: 'video', label: 'Video Management', component: (props) => <VideoManagement {...props} productData={productData} productId={productId} /> },
    { key: 'description', label: 'Product Description', component: (props) => <ProductDescription {...props} productData={productData} productId={productId} /> },
    { key: 'info', label: 'Product Information', component: (props) => <ProductInfo {...props} productData={productData} productId={productId} /> },
    { key: 'review', label: 'Create Review', component: (props) => <ProductReview {...props} productData={productData} productId={productId} /> },
    { key: 'tag', label: 'Category Tag', component: (props) => <CategoryTag {...props} productData={productData} productId={productId} /> },
  ];
  const [activeSection, setActiveSection] = useState(sectionConfig[0].key);


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