'use client'

import { signUp } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { useState } from "react"
import { useForm } from "react-hook-form";

const Signup = () => {

    const [error, setError] = useState('');
    const {register, handleSubmit} = useForm()

    const onSubmit = async (data: any) => {
        // signup(data.email, data.password, data.name).then((user)=>{
        //     alert("User created successfully"),
        //     setError('')
        // }).catch((error)=>{
        //     setError(error.message)
        // })
         await signUp.email({email: data.email, password: data.password, name: data.name},
            {
                onSuccess: () => {
                    setError(''),
                    redirect('/dashboard')
                },
                onError: (error: any) => {
                    setError(error.message)
                }

            })
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form onSubmit={handleSubmit(onSubmit)}
             className="flex flex-col gap-4">
                 <input 
                className="border border-gray-300 rounded-md p-2" 
                type="text"
                {...register('name', {required: true})}
                />
                <input 
                className="border border-gray-300 rounded-md p-2" 
                type="email"
                {...register('email', {required: true})}
                />
                <input className="border border-gray-300 rounded-md p-2" type="password"
                   {...register('password', {minLength: 6, required: true})}
                />
                <button className="bg-rose-500 text-white rounded-md p-2" type="submit">Signup</button>
            </form>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    )
}

export default Signup