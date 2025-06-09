import SalesSectionPage from "@/components/Admin/SalesSection";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { GetAllEnquiry } from "@/actions/GetAllEnquiry";
import { GetAllOrder } from "@/actions/GetAllOrder";
import { GetAllCustomOrder } from "@/actions/GetAllCustomOrder";

export const dynamic = 'force-dynamic'

function convertObjectIdsToStrings(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertObjectIdsToStrings);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (key === "_id" && obj[key] && typeof obj[key].toString === "function") {
        newObj[key] = obj[key].toString();
      } else {
        newObj[key] = convertObjectIdsToStrings(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

export default async function SalesSection() {
    const { enquirys } = await GetAllEnquiry();
    const { orders } = await GetAllOrder();
    const { customOrders } = await GetAllCustomOrder();

    if (enquirys) {
        enquirys.forEach(customOrder => {
            customOrder._id = customOrder._id?.toString();
            customOrder.userId = customOrder.userId?.toString();

            if (customOrder.packageId) {
                customOrder.packageId.info = customOrder.packageId.info.map(info => {
                    info._id = info._id.toString();
                    return info;
                });
                customOrder.packageId.gallery = customOrder.packageId.gallery.map(gallery => {
                    gallery._id = gallery._id.toString();
                    return gallery;
                });
                customOrder.packageId.createPlanType = customOrder.packageId.createPlanType.map(createPlanType => {
                    createPlanType._id = createPlanType._id.toString();
                    return createPlanType;
                });

                customOrder.packageId.reviews = customOrder.packageId.reviews.map(review => {
                    review = review.toString();
                    return review;
                });
            }

            // Optional: Convert nested ObjectId fields inside heliFormData (if needed)
            if (customOrder.heliFormData?.adults) {
                customOrder.heliFormData.adults = customOrder.heliFormData.adults.map(adult => ({
                    ...adult,
                    _id: adult._id?.toString?.() ?? adult._id,
                }));
            }

            if (customOrder.heliFormData?.children) {
                customOrder.heliFormData.children = customOrder.heliFormData.children.map(child => ({
                    ...child,
                    _id: child._id?.toString?.() ?? child._id,
                }));
            }

            if (customOrder.heliFormData?.infants) {
                customOrder.heliFormData.infants = customOrder.heliFormData.infants.map(infant => ({
                    ...infant,
                    _id: infant._id?.toString?.() ?? infant._id,
                }));
            }
        });
    }
    if (orders) {
        orders.forEach(order => {
            order._id = order._id?.toString();
            order.userId = order.userId?.toString();

            if (order.productId) {
                order.productId.info = order.productId.info.map(info => {
                    info._id = info._id.toString();
                    return info;
                });
                order.productId.gallery = order.productId.gallery.map(gallery => {
                    gallery._id = gallery._id.toString();
                    return gallery;
                });
                order.productId.createPlanType = order.productId.createPlanType.map(createPlanType => {
                    createPlanType._id = createPlanType._id.toString();
                    return createPlanType;
                });

                order.productId.reviews = order.productId.reviews.map(review => {
                    review = review.toString();
                    return review;
                });
            }

            // Optional: Convert nested ObjectId fields inside heliFormData (if needed)
            if (order.heliFormData?.adults) {
                order.heliFormData.adults = order.heliFormData.adults.map(adult => ({
                    ...adult,
                    _id: adult._id?.toString?.() ?? adult._id,
                }));
            }
            if (order.heliFormData?.children) {
                order.heliFormData.children = order.heliFormData.children.map(child => ({
                    ...child,
                    _id: child._id?.toString?.() ?? child._id,
                }));
            }

            if (order.heliFormData?.infants) {
                order.heliFormData.infants = order.heliFormData.infants.map(infant => ({
                    ...infant,
                    _id: infant._id?.toString?.() ?? infant._id,
                }));
            }
        });
    }
    if (customOrders) {
        customOrders.forEach(customOrder => {
            customOrder._id = customOrder._id?.toString();
            customOrder.userId = customOrder.userId?.toString();

            if (customOrder.packageId) {
                customOrder.packageId.info = customOrder.packageId.info.map(info => {
                    info._id = info._id.toString();
                    return info;
                });
                customOrder.packageId.gallery = customOrder.packageId.gallery.map(gallery => {
                    gallery._id = gallery._id.toString();
                    return gallery;
                });
                customOrder.packageId.createPlanType = customOrder.packageId.createPlanType.map(createPlanType => {
                    createPlanType._id = createPlanType._id.toString();
                    return createPlanType;
                });

                customOrder.packageId.reviews = customOrder.packageId.reviews.map(review => {
                    review = review.toString();
                    return review;
                });
            }

            // Optional: Convert nested ObjectId fields inside heliFormData (if needed)
            if (customOrder.heliFormData?.adults) {
                customOrder.heliFormData.adults = customOrder.heliFormData.adults.map(adult => ({
                    ...adult,
                    _id: adult._id?.toString?.() ?? adult._id,
                }));
            }

            if (customOrder.heliFormData?.children) {
                customOrder.heliFormData.children = customOrder.heliFormData.children.map(child => ({
                    ...child,
                    _id: child._id?.toString?.() ?? child._id,
                }));
            }
            if (customOrder.heliFormData?.infants) {
                customOrder.heliFormData.infants = customOrder.heliFormData.infants.map(infant => ({
                    ...infant,
                    _id: infant._id?.toString?.() ?? infant._id,
                }));
            }
        });
    }

    // Convert all ObjectIds to strings recursively before passing to client
    const safeEnquirys = convertObjectIdsToStrings(enquirys || []);
    const safeOrders = convertObjectIdsToStrings(orders || []);
    const safeCustomOrders = convertObjectIdsToStrings(customOrders || []);

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                </div>
            </header>
            <SalesSectionPage enquirys={safeEnquirys} orders={safeOrders} customOrders={safeCustomOrders} />
        </SidebarInset>
    );
}
