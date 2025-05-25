import React from 'react'

const ShippingPolicy = () => {
  return (
    <section className="bg-[#fffaf3] py-10 px-4 md:px-12 w-full mx-auto rounded-lg shadow-sm">
      <h2 className="text-3xl font-bold mb-6 text-center">Our Shipping Policy</h2>
      <p className="mb-4">
        <span className="font-semibold">www.rishikeshhandmade.com (Website)</span> (“we”, “our”, “us”) To ensure ease of selling and the best possible customer experience, we mandate delivery to all customers via our logistics partners and deduct the shipping cost from the selling price before making a payment to you. Shipping fee is calculated on actual weight or volumetric weight, whichever is higher. This is to account for items which are lightweight but occupy a lot of shipping space.
      </p>
      <div className="space-y-5">
        <div>
          <strong>1. Delivery charge varies with each Seller :-</strong>
          <p className="text-justify mt-1">
            Sellers incur relatively higher shipping costs on low value items. In such cases, charging a nominal delivery charge helps them offset logistics costs. Please check your order summary to understand the delivery charges for individual products.<br />
            For Products listed as www.rishikeshhandmade.com (E Commerce Website Of Rishikesh Natural Fiber Handicrafts Producer Company Pvt. Ltd.), a Rs 200 charge for delivery per item may be applied if the order value is less than Rs 1,000=00 to 2,000=00. While, orders of Rs 10,000=00 or above are delivered free based on delivery partner's fee.
          </p>
        </div>
        <div>
          <strong>2. Why does the delivery date not correspond to the delivery timeline of X-Y business days? :-</strong>
          <p className="text-justify mt-1">
            It is possible that the Seller or our courier partners have a holiday between the day your placed your order and the date of delivery, which is based on the timelines shown on the product page. In this case, we add a day to the estimated date. Some courier partners and Sellers do not work on Sundays and this is factored in to the delivery dates.
          </p>
        </div>
        <div>
          <strong>3. What is the estimated delivery time? :-</strong>
          <p className="text-justify mt-1">
            Sellers generally procure and ship the items within the time specified on the product page. Business days exclude public holidays and Sundays.<br />
            Estimated delivery time depends on the following factors:
          </p>
          <ul className="list-disc pl-6 mt-1">
            <li>The Seller offering the product</li>
            <li>Product's availability with the Seller</li>
            <li>The destination to which you want the order shipped to and location of the Seller.</li>
          </ul>
        </div>
        <div>
          <strong>4. Are there any hidden costs (sales tax, octroi etc) on items sold by Sellers on www.rishikeshhandmade.com? :-</strong>
          <p className="text-justify mt-1">
            There are NO hidden charges when you make a purchase on www.rishikeshhandmade.com. List prices are final and all-inclusive. The price you see on the product page is exactly what you would pay.<br />
            Delivery charges are not hidden charges and are charged (if at all) extra depending on the Seller's shipping policy.
          </p>
        </div>
        <div>
          <strong>5. Why does the estimated delivery time vary for each seller? :-</strong>
          <p className="text-justify mt-1">
            You have probably noticed varying estimated delivery times for sellers of the product you are interested in. Delivery times are influenced by product availability, geographic location of the Seller, your shipping destination and the courier partner's time-to-deliver in your location.<br />
            Please enter your default pin code on the product page (you don't have to enter it every single time) to know more accurate delivery times on the product page itself.
          </p>
        </div>
        <div>
          <strong>6. Seller does not/cannot ship to my area. Why? :-</strong>
          <p className="text-justify mt-1">
            Please enter your pincode on the product page (you don't have to enter it every single time) to know whether the product can be delivered to your location.  If you haven't provided your pincode until the checkout stage, the pincode in your shipping address will be used to check for serviceability.<br />
            Whether your location can be serviced or not depends on:<br />
            1)- Whether the Seller ships to your location<br />
            2)- Legal restrictions, if any, in shipping particular products to your location
          </p>
        </div>
      </div>
    </section>
  );
}

export default ShippingPolicy