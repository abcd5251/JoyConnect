"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export const SignIn = () => {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session?.user?.name?.slice(0, 10)} <br />
        <button
          className="px-4 py-2 bg-[#58FFA3] text-black rounded-xl w-full mx-5"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </>
    );
  } else {
    return (
      <div className="w-[90%] flex flex-col items-center justify-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <p>Please sign in to continue</p>
        <button
          className="px-4 py-2 bg-[#58FFA3] text-black rounded-xl w-full mx-5"
          onClick={() => signIn()}
        >
          Sign in
        </button>
      </div>
    );
  }
};
