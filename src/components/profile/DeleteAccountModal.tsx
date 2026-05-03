"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: Props) {
  const { deleteAccount, logOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteAccount();
      // Success
      router.push("/");
      window.location.reload(); // Force clear everything
    } catch (err: any) {
      console.error("Delete account error:", err);
      if (err.code === "auth/requires-recent-login") {
        setError("For security, you must log in again before deleting your account.");
        // We could force a logout here so they have to sign in again
        setTimeout(async () => {
          await logOut();
          router.push("/");
        }, 3000);
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-red-100"
            >
              <div className="relative p-8 sm:p-10 text-center">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>

                {/* Content */}
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "var(--font-poppins)" }}>
                  Delete Account?
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  This action is <span className="font-bold text-red-600">permanent</span> and cannot be undone. 
                  All your Jagruk Score, earned badges, and journey progress will be wiped from our servers forever.
                </p>

                {/* Warnings */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 text-left space-y-3">
                  <div className="flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-800 font-medium leading-tight">
                      Your Firestore data (progress, badges) will be deleted.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Trash2 className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-800 font-medium leading-tight">
                      Your Authentication account will be removed.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    disabled={loading}
                    onClick={handleDelete}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Delete Everything Permanently
                      </>
                    )}
                  </button>
                  <button
                    disabled={loading}
                    onClick={onClose}
                    className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all active:scale-[0.98]"
                  >
                    Wait, Keep My Account
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
