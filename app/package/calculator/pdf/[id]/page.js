import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CalculatorPDF from "@/components/Package/Calculator/CalculatorPDF";
import { SidebarInset } from "@/components/ui/sidebar";
import connectDB from "@/lib/connectDB";
import CustomOrderVisitors from "@/models/CustomOrderVisitors";
import Plan from "@/models/Plan";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const PackageCalculatorPDF = async ({ params }) => {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session) {
        const callbackUrl = encodeURIComponent(`/package/calculator/pdf/${id}`);
        redirect(`/sign-in?callbackUrl=${callbackUrl}`);
    }

    await connectDB();

    const customOrder = await CustomOrderVisitors.findOne({
        packageId: id,
        userId: session.user.id
    }).lean();

    if (!customOrder) {
        redirect(`/package/calculator/${id}`);
    }

    // Convert main _ids
    customOrder._id = customOrder._id?.toString();
    customOrder.packageId = customOrder.packageId?.toString();
    customOrder.userId = customOrder.userId?.toString();

    // Optional: Convert nested ObjectId fields inside heliFormData (if needed)
    if (customOrder.heliFormData?.adults) {
        customOrder.heliFormData.adults = customOrder.heliFormData.adults.map(adult => ({
            ...adult,
            _id: adult._id?.toString?.() ?? adult._id,
        }));
    }

    if (customOrder.heliFormData?.infants) {
        customOrder.heliFormData.infants = customOrder.heliFormData.infants.map(infant => ({
            ...infant,
            _id: infant._id?.toString?.() ?? infant._id,
        }));
    }


    // Fetch the associated package
    const packages = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getPackageById/${customOrder.packageId}`)
        .then((res) => res.json());


    if (packages) {
        packages._id = packages._id.toString();

        if (packages.info) {
            packages.info = packages.info.map((item) => ({
                ...item,
                _id: item._id?.toString(),
            }));
        }

        if (packages.gallery) {
            packages.gallery = packages.gallery.map((item) => ({
                ...item,
                _id: item._id?.toString(),
            }));
        }

        if (packages.createPlanType) {
            packages.createPlanType = packages.createPlanType.map((item) => ({
                ...item,
                _id: item._id?.toString(),
            }));
        }
    }

    const plans = await Plan.find({}).lean();

    if (plans) {
        plans.forEach((plan) => {
            plan._id = plan._id.toString();
            plan.cities = plan.cities.map((city) => ({
                ...city,
                _id: city._id.toString(),
            }));
        });
    }

    return (
        <SidebarInset>
            <div className="bg-white min-h-screen mt-6 print:mt-0">
                <CalculatorPDF
                    packages={packages}
                    plans={plans}
                    customOrderVisitors={customOrder}
                />
            </div>
        </SidebarInset>
    );
};

export default PackageCalculatorPDF;