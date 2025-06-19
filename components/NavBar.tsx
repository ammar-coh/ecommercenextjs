import React from 'react'
import Link from "next/link";
import Image from "next/image";
import { auth, signOut, signIn } from "../auth";
const NavBar = async () => {
    const session = await auth()
    return (
        <header className="px-5 py-3 bg-white shadow-sm font-work-sans">
            <nav
                className="flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <Image src="/logo.png" alt="logo" width={144} height={30} />
                </Link>

                <div className="flex flex-row items-center gap-x-5">
                    {session && session?.user ? (
                        <>
                            <Link href="/startup/create" className="flex items-center">
                                <span>Create</span>
                            </Link>
                            <form action={async () => {
                                'use server'
                                await signOut({
                                    redirectTo: '/'
                                })
                            }} className="flex items-center">
                                <button type="submit" className="flex items-center px-4 py-2 bg-transparent border-none cursor-pointer hover:underline">
                                    Logout
                                </button>
                            </form>
                            <Link href={`/user/${session?.user?.id}`} className="flex items-center">
                                <span>{session?.user?.name}</span>
                            </Link>
                        </>
                    ) : (
                        <form action={async () => { 'use server'; await signIn('github') }} className="flex items-center">
                            <button type="submit" className="flex items-center px-4 py-2 bg-transparent border-none cursor-pointer hover:underline">
                                Login
                            </button>
                        </form>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default NavBar