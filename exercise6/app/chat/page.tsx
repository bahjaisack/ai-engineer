import { createConversation } from "@/lib/chat";
import { getUserInfo } from "@/server/user"
import { redirect } from "next/navigation";

const NewChatPage = async () => {
    // get the auth user

    const user = await getUserInfo();
    if(!user){
        redirect('/signin')
    }

    // create new conversation 
    const conversationId = await createConversation(user.user.id)
    redirect(`/chat/${conversationId}`)
}

export default NewChatPage