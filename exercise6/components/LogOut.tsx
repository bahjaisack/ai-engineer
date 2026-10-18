'use client'
import { signOut } from "@/lib/auth-client"

const LogOut = () => {
    return (
        <div>
            <button
             className="bg-rose-500 text-white rounded-md p-2 cursor-pointer"
            onClick={()=>signOut()}
             type="submit">Signout</button>
        </div>
    )
}

export default LogOut