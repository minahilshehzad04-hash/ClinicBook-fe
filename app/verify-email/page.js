"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import CenterCard, { CheckIcon, CrossIcon } from "@/components/CenterCard";
import { PageLoader, Spinner } from "@/components/Loader";
import ResendVerification from "@/components/ResendVerification";
import { verifyEmail } from "../lib/api";

function VerifyEmail() {
  const router = useRouter();
  const params = useSearchParams();
  const uid = params.get("uid");
  const token = params.get("token");

  const [status, setStatus] = useState(uid && token ? "verifying" : "error");
  const [message, setMessage] = useState(
    uid && token ? "" : "This verification link is incomplete."
  );
  const started = useRef(false); // the link must only be used once (React StrictMode runs effects twice)

  useEffect(() => {
    if (!uid || !token || started.current) return;
    started.current = true;
    verifyEmail(uid, token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setMessage(err.message);
        setStatus("error");
      });
  }, [uid, token]);

  // On success, move to the login page after a short pause.
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => router.replace("/login?verified=1"), 2500);
    return () => clearTimeout(timer);
  }, [status, router]);

  if (status === "verifying") return <PageLoader label="Verifying your email..." />;

  if (status === "success") {
    return (
      <CenterCard icon={CheckIcon} title="Email verified!">
        <p>Your account is ready. Taking you to the login page...</p>
        <div className="mt-5 flex items-center justify-center gap-2 text-teal-800">
          <Spinner />
        </div>
        <Link
          href="/login?verified=1"
          className="mt-5 inline-block text-sm text-teal-800 hover:underline"
        >
          Go to log in now
        </Link>
      </CenterCard>
    );
  }

  return (
    <CenterCard icon={CrossIcon} title="Link not valid">
      <p>{message || "This verification link is invalid or has expired."}</p>
      <p className="mt-2 text-sm">Enter your email and we&apos;ll send you a new one.</p>
      <ResendVerification />
      <Link href="/login" className="mt-6 inline-block text-sm text-teal-800 hover:underline">
        Back to log in
      </Link>
    </CenterCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VerifyEmail />
    </Suspense>
  );
}
