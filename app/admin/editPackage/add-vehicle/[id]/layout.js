import '@/app/globals.css'
import Sidebar from '@/components/Admin/Sidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { PackageProvider } from '@/context/PackageContext';
import connectDB from "@/lib/connectDB";
import Package from "@/models/Package";

export default async function RootLayout({
    children,
    params
}) {
    const { id } = await params
    await connectDB()

    const packages = await Package.findById(id).lean()
    packages._id = packages._id.toString();
    packages.info = packages.info.map(info => {
        info._id = info._id.toString();
        return info;
    });
    packages.gallery = packages.gallery.map(gallery => {
        gallery._id = gallery._id.toString();
        return gallery;
    });
    packages.createPlanType = packages.createPlanType.map(createPlanType => {
        createPlanType._id = createPlanType._id.toString();
        return createPlanType;
    });
    packages.reviews = packages.reviews.map(review => {
        review = review.toString();
        return review;
    });
    return (
        <PackageProvider packages={packages}>
            <div className="w-full">
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                        </div>
                    </header>
                    <h1 className="text-4xl px-12 font-semibold">Edit Package: <span className="font-bold text-blue-600">{packages.packageName}</span></h1>
                    <div className='flex xl:flex-row flex-col gap-8 xl:gap-32 p-12'>
                        <div className="flex xl:flex-col flex-wrap gap-2 my-20 font-semibold items-center">
                            <Sidebar id={id} />
                        </div>
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </PackageProvider>
    )
}

