'use client'
import { useSession, signOut } from "@/lib/auth-client"

const DashboardClient =  () => {
  
    const {data: session, isPending} = useSession()

    if(isPending){
        return <div>Loading...</div>
    }
    if(!session){
        return <div>Not logged in</div>
    }
    return (
        <div>page {session?.user.email} {isPending ? "Loading..." : "Loaded"}
        <button onClick={() => signOut()}>Sign Out</button>
        </div>
    )
}
export default DashboardClient