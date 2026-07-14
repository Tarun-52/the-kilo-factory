"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"choice" | "phone" | "otp">("choice");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      toast.error("Google sign-in failed");
      setLoading(false);
    }
  };

  const handleSendOtp = () => {
    if (phone.length !== 10) {
      toast.error("Enter valid 10-digit number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
      toast.success("OTP sent! (Enter any 4 digits for demo)");
    }, 800);
  };

  const handleVerify = async () => {
    if (otp.length < 4) {
      toast.error("Enter OTP");
      return;
    }
    setLoading(true);
    // Demo phone login — in production this would call a real OTP API
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Phone login is demo only. Use Google for full access.");
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setStep("choice");
    setPhone("");
    setOtp("");
    onClose();
  };

  // If already logged in, show profile info
  if (session?.user && open) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-royal text-xl text-center text-bark">Signed In</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name}
                className="size-16 rounded-full"
              />
            )}
            <div className="text-center">
              <p className="font-semibold text-bark">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
              {session.user.isAdmin && (
                <span className="inline-block mt-1 text-xs font-medium text-maroon bg-maroon/10 px-2 py-0.5 rounded-full">
                  Admin Access
                </span>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                signOut({ callbackUrl: "/" });
                handleClose();
              }}
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-royal text-2xl text-center text-bark">
            Login to The Kilo Factory
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {step === "choice" && (
            <>
              {/* Google Sign-In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-xl px-4 py-3 hover:bg-muted/50 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span className="font-medium text-bark">Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center w-full gap-3 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Phone login (demo) */}
              <button
                onClick={() => setStep("phone")}
                className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-xl px-4 py-3 hover:bg-muted/50 transition cursor-pointer"
              >
                <Phone className="size-5 text-maroon" />
                <span className="font-medium text-bark">Continue with Phone</span>
                <span className="text-[10px] text-muted-foreground">(Demo)</span>
              </button>
            </>
          )}

          {step === "phone" && (
            <>
              <div className="w-full">
                <label className="text-sm text-muted-foreground mb-1 block">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-ivory rounded-lg border border-input text-sm text-muted-foreground">
                    +91
                  </div>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter mobile number"
                    type="tel"
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={loading || phone.length !== 10}
                className="w-full bg-maroon-gradient text-ivory font-semibold py-2.5 rounded-xl"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Phone size={16} className="mr-2" /> Send OTP
                  </>
                )}
              </Button>
              <button
                onClick={() => setStep("choice")}
                className="text-xs text-muted-foreground hover:text-bark cursor-pointer"
              >
                Back to options
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="w-full">
                <p className="text-sm text-muted-foreground mb-1">
                  Enter OTP sent to +91{phone}
                </p>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="4-digit OTP"
                  type="tel"
                  maxLength={4}
                  className="text-center text-2xl tracking-[0.5em] h-14"
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
              </div>
              <Button
                onClick={handleVerify}
                disabled={loading || otp.length < 4}
                className="w-full bg-gold-gradient text-bark font-semibold py-2.5 rounded-xl"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify & Login <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
              <button
                onClick={() => setStep("phone")}
                className="text-xs text-muted-foreground hover:text-bark cursor-pointer"
              >
                Change number
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}