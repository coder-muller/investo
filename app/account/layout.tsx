import { Sidebar } from "@/components/sidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 w-full">
                {children}
            </div>
        </div>
    )
}
