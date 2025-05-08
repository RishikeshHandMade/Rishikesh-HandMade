import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TourPackageCalculator from "@/components/Package/Calculator/calculator";
import { SidebarInset } from "@/components/ui/sidebar";
import connectDB from "@/lib/connectDB";
import Plan from "@/models/Plan";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const PackageCalculator = async ({ params }) => {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session || session.user.isAdmin === true) {
        const callbackUrl = encodeURIComponent(`/package/calculator/${id}`);
        redirect(`/sign-in?callbackUrl=${callbackUrl}`);
    }

    await connectDB();

    const packages = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getPackageById/${id}`)
        .then((res) => res.json());

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
            <div className="bg-white min-h-screen">
                <header className="my-12 mx-6">
                    <h1 className="text-xl font-bold tracking-tight md:text-4xl mb-4">Package Calculator</h1>
                </header>
                <TourPackageCalculator packages={packages} plans={plans} />
                {/* <h1 className="text-5xl font-bold tracking-tight md:text-5xl mb-4">Under Development</h1> */}
            </div>
        </SidebarInset>
    );
};

export default PackageCalculator;
