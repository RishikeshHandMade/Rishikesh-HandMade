"use client"

import * as React from "react"
import {
  BarChart,
  Boxes,
  ClipboardList,
  ClockArrowUp,
  Flame,
  Image,
  MapPin,
  MenuIcon,
  MessageCircleMore,
  Plus,
  Rss,
  Send,
  ShoppingBag,
  Star,
  StickyNote,
  User,
  Users,
} from "lucide-react"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

const data = {
  user: {
    name: "Welcome, Admin",
    email: "yatrazone@admin.com",
  },
  projects: [
    // First group: Admin management
    {
      name: "Create/Manage Admin",
      url: "/admin/create_user",
      icon: User,
    },
    
    // Space (empty item)
    { divider: true },
    
    // Second group: Basic setup
    {
      name: "Manage Banner",
      url: "/admin/change_banner_image",
      icon: Image,
    },
    {
      name: "Create City",
      url: "/admin/create_city",
      icon: MapPin,
    },
    {
      name: "Create Package Plan Type",
      url: "/admin/create_package_plan_type",
      icon: ShoppingBag,
    },
    {
      name: "Manage City Plans",
      url: "/admin/manage_city_plans",
      icon: Flame,
    },
    
    // Space (empty item)
    { divider: true },

    {
      name:"Insta or Facebook Post",
      url:"/admin/insta_fb_post",
      icon:Image
    },
    {
      name:"Manage Blogs",
      url: "/admin/manage_blogs",
      icon: Rss,
    },

   // Space (empty item)
   { divider: true },

       {
         name:"Coming Soon",
         url:"/admin/coming_soon",
         icon:Image
       },   
       {
        name:"Coming Soon Enquiries",
        url:"/admin/coming_soon_enquiries",
        icon:MessageCircleMore
       },
      // Space (empty item)
      { divider: true },

    
    // Third group: Content management
    {
      name: "Manage Featured Packages",
      url: "/admin/manage_featured_packages",
      icon: Image,
    },
    {
      name: "Manage Menu Section",
      url: "/admin",
      icon: MenuIcon,
    },
    {
      name: "Manage Sub Menu Section",
      url: "/admin/manage_sub_menu",
      icon: MenuIcon,
    },
    {
      name: "Manage Products & Category",
      url: "/admin/manage_products_category",
      icon: Boxes,
    },
    {
      name: "Add Direct Package",
      url: "/admin/add_direct_package",
      icon: Plus,
    },
    {
      name: "Approve/Reject Reviews",
      url: "/admin/manage_reviews",
      icon: Star,
    },
    
    // Space (empty item)
    { divider: true },
    
    // Fourth group: Blog & pages
    {
      name: "Manage Webpages",
      url: "/admin/manage_webpage",
      icon: StickyNote,
    },
    
    // Space (empty item)
    { divider: true },
    
    // Fifth group: Enquiries
    {
      name: "Contact Page Enquiry",
      url: "/admin/contact_page_enquiry",
      icon: MessageCircleMore,
    },
    {
      name: "Enquiry Chat Page",
      url: "/admin/chat",
      icon: MessageCircleMore,
    },
    
    // Space (empty item)
    { divider: true },
    
    // Sixth group: Reports & tools
    {
      name: "Sales Section",
      url: "/admin/sales_section",
      icon: BarChart,
    },
    {
      name: "Payment Report",
      url: "/admin/payment_report",
      icon: ClipboardList,
    },
    {
      name: "Send Promotional Emails",
      url: "/admin/send_promotional_emails",
      icon: Send,
    },
    {
      name: "Package Calculator Visitors",
      url: "/admin/contact_custom_visitors",
      icon: ClockArrowUp,
    },
    {
      name: "User Login Logs/Report",
      url: "/admin/user_login_logs",
      icon: Users,
    },
  ],
}

const dataManager = {
  user: {
    name: "Welcome, Manager",
    email: "yatrazone@manager.com",
  },
  projects: [
    {
      name: "Sales Section",
      url: "/admin/sales_section",
      icon: BarChart,
    },
    {
      name: "Enquiry Chat Page",
      url: "/admin/manager_enquiry_chat",
      icon: MessageCircleMore,
    },
    {
      name: "Send Promotional Emails",
      url: "/admin/send_promotional_emails",
      icon: Send,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { data: session } = useSession();

  const pathName = usePathname()

  return (
    (
      pathName !== "/admin/login" && (
        <Sidebar variant="inset"  {...props}>
          <NavUser user={session} />
          <SidebarContent {...props}>
            {session?.user?.isSubAdmin && <NavProjects projects={dataManager.projects} />}
            {(!session?.user?.isSubAdmin && session?.user?.isAdmin) && <NavProjects projects={data.projects} />}
          </SidebarContent>
        </Sidebar>
      ))
  );
}
