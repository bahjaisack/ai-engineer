import { getUserInfo } from "@/server/user"
import { redirect } from "next/navigation";
import LogOut from '../../components/LogOut'
const Dashboard = async () => {
    const user = await getUserInfo();
    if(!user){
        redirect('/signin');
    }
    return (
        <div>Dashboard {user.user.email}
        <LogOut />

        </div>
    )
}
export default Dashboard