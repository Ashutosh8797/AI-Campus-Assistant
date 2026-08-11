import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Send,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  createMaintenanceRequest,
  getMyMaintenanceRequests,
} from "../services/api";

const categories = [
  "ELECTRICAL",
  "PLUMBING",
  "CLEANING",
  "HOSTEL",
  "CLASSROOM",
  "FURNITURE",
  "INTERNET",
  "OTHER",
];

const statusConfig = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Wrench,
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: AlertCircle,
  },
};

function Maintenance() {
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
  });

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD MY REQUESTS
  // =====================================================

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);

      const result = await getMyMaintenanceRequests();

      if (!result.success) {
        throw new Error(
          result.message || "Unable to load maintenance requests."
        );
      }

      setRequests(result.requests || []);
    } catch (err) {
      console.error("Maintenance requests error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your maintenance requests."
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.category) {
      setError("Please select an issue category.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a short title for the issue.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please describe the problem.");
      return;
    }

    if (!form.location.trim()) {
      setError("Please enter the problem location.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await createMaintenanceRequest({
        category: form.category,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
      });

      if (!result.success) {
        throw new Error(
          result.message || "Unable to create maintenance request."
        );
      }

      setSuccess(
        result.message ||
          "Maintenance request submitted successfully."
      );

      setForm({
        category: "",
        title: "",
        description: "",
        location: "",
      });

      await loadRequests();
    } catch (err) {
      console.error("Create maintenance request error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit maintenance request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (status) => {
    return (
      statusConfig[status] || {
        label: status || "Unknown",
        className: "bg-slate-50 text-slate-600 border-slate-200",
        icon: Clock3,
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">

          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Campus maintenance
          </div>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-12">

        {/* PAGE TITLE */}

        <div className="mb-8">

          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Wrench className="h-6 w-6" />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            CAMPUS MAINTENANCE
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Report a campus issue
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Report electrical, plumbing, classroom, hostel,
            internet and other campus maintenance problems.
          </p>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">

          {/* =================================================
              REPORT FORM
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

            <div className="mb-6">

              <h2 className="text-xl font-semibold text-slate-950">
                Submit a maintenance request
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide enough information so the campus team can
                identify and resolve the issue.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Issue category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={submitting}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                >
                  <option value="">
                    Select issue category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category.replace("_", " ")}
                    </option>
                  ))}
                </select>

              </div>

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Issue title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="Example: Fan not working"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                />

              </div>

              {/* LOCATION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </label>

                <div className="relative">

                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="Example: Block A, Room 204"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                  />

                </div>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Describe the problem
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={submitting}
                  rows={6}
                  placeholder="Explain what is wrong and any useful details..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                />

              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit maintenance request
                  </>
                )}
              </button>

            </form>

          </section>

          {/* =================================================
              INFORMATION CARD
          ================================================= */}

          <aside className="space-y-5">

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600">
                <Wrench className="h-5 w-5" />
              </div>

              <h3 className="font-semibold text-slate-950">
                What can you report?
              </h3>

              <div className="mt-4 space-y-2 text-sm text-slate-600">

                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {category.replace("_", " ")}
                  </div>
                ))}

              </div>

            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <h3 className="font-semibold text-slate-950">
                Track your request
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                After submitting an issue, you can track its
                status below. The campus team can update the
                request as work progresses.
              </p>

            </div>

          </aside>

        </div>

        {/* =================================================
            MY REQUESTS
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="text-xl font-semibold text-slate-950">
              My maintenance requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track the maintenance issues you have reported.
            </p>

          </div>

          <div className="p-6">

            {loadingRequests ? (
              <div className="flex items-center justify-center py-12 text-sm text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading your requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Wrench className="h-6 w-6" />
                </div>

                <h3 className="font-semibold text-slate-900">
                  No maintenance requests yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your submitted campus issues will appear here.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {requests.map((request) => {

                  const status = getStatus(request.status);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={request._id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >

                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {request.category?.replace("_", " ")}
                            </span>

                            <span
                              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </span>

                          </div>

                          <h3 className="mt-3 font-semibold text-slate-950">
                            {request.title}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {request.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">

                            {request.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {request.location}
                              </span>
                            )}

                            {request.createdAt && (
                              <span>
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </span>
                            )}

                          </div>

                        </div>

                        <div className="shrink-0 text-xs text-slate-400">
                          ID: {request._id?.slice(-8)}
                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </section>

      </main>
    </div>
  );
}

export default Maintenance;