"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import namasteBharatLogo from "@/assests/nameste-bharat-logo.jpeg";
import LoginForm from "@/components/auth/LoginForm";

type LoginPopupProps = {
  open: boolean;
  onClose: () => void;
};

export default function LoginPopup({ open, onClose }: LoginPopupProps) {
  function handleClose() {
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Login popup"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] md:p-6"
          >
            <div className="relative mb-5">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-0 top-0 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close login popup"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-md bg-white p-1">
                  <Image
                    src={namasteBharatLogo}
                    alt="Namaste Bharat"
                    className="h-20 w-auto bg-white md:h-24"
                    priority
                  />
                </div>
                <p className="mt-2 text-lg font-medium text-slate-700 whitespace-nowrap">
                  Login for a seamless experience
                </p>
              </div>
            </div>

            <LoginForm />

            <button
              type="button"
              onClick={handleClose}
              className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Skip
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
