import { GetAllUsers } from "@/actions/GetAllUsers"
import SendPromoEmailPage from "@/components/Admin/SendPromotionalEmail"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";

const page = async () => {
    let allUsers = await GetAllUsers();
    if (allUsers) {
        allUsers = allUsers.map(user => ({
            ...user,
            _id: user._id.toString(),
            reviews: user.reviews.map(review => review.toString()),
            packages: user.packages.map(pkg => pkg.toString())
        }));
    }

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                </div>
            </header>
            <SendPromoEmailPage allUsers={allUsers} />
        </SidebarInset>
    )
}

export default page