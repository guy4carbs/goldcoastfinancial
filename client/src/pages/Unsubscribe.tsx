import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface UnsubscribeData {
  email: string;
  firstName: string | null;
  status: string;
  alreadyUnsubscribed: boolean;
}

export default function Unsubscribe() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<UnsubscribeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/newsletter/unsubscribe/${token}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Invalid unsubscribe link");
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/newsletter/unsubscribe/${token}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to unsubscribe");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Email Preferences</h1>
            <p className="text-white/70 mt-1">Heritage Life Solutions</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link href="/">
                  <a className="inline-flex items-center gap-2 text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Homepage
                  </a>
                </Link>
              </div>
            ) : success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Unsubscribed Successfully</h2>
                <p className="text-gray-600 mb-6">
                  You've been removed from our newsletter. We're sorry to see you go!
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Changed your mind? You can always resubscribe on our website.
                </p>
                <Link href="/">
                  <a className="inline-flex items-center gap-2 text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Homepage
                  </a>
                </Link>
              </div>
            ) : data?.alreadyUnsubscribed ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Unsubscribed</h2>
                <p className="text-gray-600 mb-6">
                  The email <strong>{data.email}</strong> is already unsubscribed from our newsletter.
                </p>
                <Link href="/">
                  <a className="inline-flex items-center gap-2 text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Homepage
                  </a>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {data?.firstName ? `Hi ${data.firstName},` : "Unsubscribe from Newsletter"}
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to unsubscribe <strong>{data?.email}</strong> from our newsletter?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  You'll no longer receive our weekly tips on life insurance and retirement planning.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleUnsubscribe}
                    disabled={processing}
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? "Processing..." : "Yes, Unsubscribe Me"}
                  </button>

                  <Link href="/">
                    <a className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center">
                      No, Keep Me Subscribed
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              Heritage Life Solutions | Protecting Families Nationwide
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
