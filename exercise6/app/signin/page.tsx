'use client'

import { signIn } from "@/lib/auth-client";
import { signin } from "@/server/user";
import { redirect } from "next/navigation";
import { useState } from "react"
import { useForm } from "react-hook-form";

const Signin = () => {

    const [error, setError] = useState('');
    const [success, setSucess] = useState('');
    const { register, handleSubmit } = useForm()

    const onSubmit = async (data: any) => {
        signin(data.email, data.password).then((user) => {
            setSucess("User signedin successfully"),
                redirect('/dashboard')
            setError('')
        }).catch((error) => {
            setError(error.message)
        })

    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4">
                <input
                    className="border border-gray-300 rounded-md p-2"
                    type="email"
                    {...register('email', { required: true })}
                />
                <input className="border border-gray-300 rounded-md p-2" type="password"
                    {...register('password', { minLength: 6, required: true })}
                />
                <button className="bg-rose-500 text-white rounded-md p-2 cursor-pointer" type="submit"
                    onClick={() => signIn.social({ provider: 'google' })}
                >Signin With Google</button>
                <button
                    className="bg-rose-500 text-white rounded-md p-2" type="submit">Signin</button>
                

            </form>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

        </div>
    )
}

export default Signin