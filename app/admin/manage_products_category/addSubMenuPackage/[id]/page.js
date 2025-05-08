import AddPackage from "@/components/Admin/AddPackage"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

const page = async ({ params }) => {
    const { id } = await params

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <h1 className="text-4xl px-12 font-semibold">Add Package</h1>
                <AddPackage id={id} />
            </div>
        </SidebarInset>
    )
}

export default page
