import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

const categories = [
  "ALL",
  "ACADEMICS",
  "ADMISSIONS",
  "ADMINISTRATION",
  "CAMPUS",
  "FACILITIES",
  "HOSTEL",
  "LIBRARY",
  "EXAM",
  "FEES",
  "TRANSPORT",
  "HEALTH",
  "SPORTS",
  "EVENTS",
  "CONTACTS",
  "GENERAL",
];

const categoryLabels = {
  ALL: "All",
  ACADEMICS: "Academics",
  ADMISSIONS: "Admissions",
  ADMINISTRATION: "Administration",
  CAMPUS: "Campus",
  FACILITIES: "Facilities",
  HOSTEL: "Hostel",
  LIBRARY: "Library",
  EXAM: "Exams",
  FEES: "Fees",
  TRANSPORT: "Transport",
  HEALTH: "Health",
  SPORTS: "Sports",
  EVENTS: "Events",
  CONTACTS: "Contacts",
  GENERAL: "General",
};

const categoryIcons = {
  ACADEMICS: "🎓",
  ADMISSIONS: "📝",
  ADMINISTRATION: "🏢",
  CAMPUS: "🏫",
  FACILITIES: "🛠️",
  HOSTEL: "🏠",
  LIBRARY: "📚",
  EXAM: "📋",
  FEES: "💳",
  TRANSPORT: "🚌",
  HEALTH: "🏥",
  SPORTS: "⚽",
  EVENTS: "🎉",
  CONTACTS: "📞",
  GENERAL: "ℹ️",
};

function KnowledgeHub() {
  const [knowledge, setKnowledge] =
    useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  /*
  =====================================================
  LOAD KNOWLEDGE
  =====================================================
  */

  const loadKnowledge = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (
        selectedCategory &&
        selectedCategory !== "ALL"
      ) {
        params.category =
          selectedCategory;
      }

      if (search.trim()) {
        params.search =
          search.trim();
      }

      const response = await api.get(
        "/knowledge",
        {
          params,
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Unable to load knowledge"
        );
      }

      setKnowledge(
        response.data.knowledge || []
      );
    } catch (err) {
      console.error(
        "Knowledge Hub error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load campus knowledge."
      );

      setKnowledge([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  LOAD WHEN FILTER CHANGES
  =====================================================
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadKnowledge();
    }, 250);

    return () => clearTimeout(timer);
  }, [
    selectedCategory,
    search,
  ]);

  /*
  =====================================================
  LOCAL CATEGORY COUNTS
  =====================================================
  */

  const categoryCounts =
    useMemo(() => {
      const counts = {
        ALL: knowledge.length,
      };

      for (const item of knowledge) {
        const category =
          item.category || "GENERAL";

        counts[category] =
          (counts[category] || 0) + 1;
      }

      return counts;
    }, [knowledge]);

  /*
  =====================================================
  OPEN KNOWLEDGE DETAILS
  =====================================================
  */

  const openKnowledge = async (item) => {
    setSelectedItem(item);
    setDetailsLoading(true);

    try {
      const response =
        await api.get(
          `/knowledge/${item._id}`
        );

      if (
        response.data.success &&
        response.data.knowledge
      ) {
        setSelectedItem(
          response.data.knowledge
        );
      }
    } catch (err) {
      console.error(
        "Knowledge details error:",
        err
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  /*
  =====================================================
  CLEAR SEARCH
  =====================================================
  */

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">

          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
            Verified campus knowledge
          </div>

        </div>

      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-12">

        {/* HERO */}

        <section className="mb-8">

          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <BookOpen className="h-6 w-6" />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            CAMPUS KNOWLEDGE
          </p>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                Knowledge Hub
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Explore verified information
                about the KL Vijayawada
                campus.
              </p>
            </div>

            <Link
              to="/ai-assistant"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700"
            >
              <Sparkles className="h-4 w-4" />
              Ask AI Assistant
            </Link>

          </div>

        </section>

        {/* =====================================
            SEARCH
        ====================================== */}

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="relative">

            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search campus knowledge..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

          </div>

        </section>

        {/* =====================================
            CATEGORY FILTERS
        ====================================== */}

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">

          {categories.map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory ===
                  category
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                {categoryLabels[
                  category
                ] || category}
              </button>
            )
          )}

        </div>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================
            LOADING
        ====================================== */}

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
              >
                <div className="mb-5 h-10 w-10 rounded-xl bg-slate-200" />

                <div className="mb-3 h-5 w-3/4 rounded bg-slate-200" />

                <div className="mb-2 h-4 w-full rounded bg-slate-100" />

                <div className="h-4 w-2/3 rounded bg-slate-100" />
              </div>
            ))}

          </div>
        )}

        {/* =====================================
            EMPTY STATE
        ====================================== */}

        {!loading &&
          !error &&
          knowledge.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BookOpen className="h-7 w-7" />
              </div>

              <h2 className="text-xl font-semibold text-slate-950">
                No knowledge found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another search term or
                select a different category.
              </p>

            </div>
          )}

        {/* =====================================
            KNOWLEDGE GRID
        ====================================== */}

        {!loading &&
          knowledge.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {knowledge.length}
                  </span>{" "}
                  verified knowledge{" "}
                  {knowledge.length === 1
                    ? "item"
                    : "items"}
                </p>

                {selectedCategory !==
                  "ALL" && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        "ALL"
                      )
                    }
                    className="text-sm font-medium text-violet-600 hover:text-violet-700"
                  >
                    Clear category
                  </button>
                )}

              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {knowledge.map(
                  (item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() =>
                        openKnowledge(
                          item
                        )
                      }
                      className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
                    >

                      <div className="mb-5 flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                          {categoryIcons[
                            item.category
                          ] || "ℹ️"}
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {categoryLabels[
                            item.category
                          ] ||
                            item.category ||
                            "General"}
                        </span>

                      </div>

                      <h2 className="line-clamp-2 text-lg font-semibold text-slate-950">
                        {item.title}
                      </h2>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {item.answer}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <CalendarDays className="h-3.5 w-3.5" />

                          {item.lastVerified
                            ? new Date(
                                item.lastVerified
                              ).toLocaleDateString()
                            : "Verified"}
                        </div>

                        <span className="flex items-center gap-1 text-xs font-semibold text-violet-600 transition group-hover:gap-2">
                          Read more
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>

                      </div>

                    </button>
                  )
                )}

              </div>
            </>
          )}

      </main>

      {/* =====================================
          DETAIL MODAL
      ====================================== */}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm">

          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() =>
              setSelectedItem(null)
            }
            aria-label="Close details"
          />

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* Modal header */}

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xl">
                  {categoryIcons[
                    selectedItem.category
                  ] || "ℹ️"}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                    {categoryLabels[
                      selectedItem.category
                    ] ||
                      selectedItem.category ||
                      "General"}
                  </p>

                  <p className="text-xs text-slate-400">
                    Verified campus
                    information
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedItem(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* Modal content */}

            <div className="px-6 py-7">

              {detailsLoading ? (
                <div className="space-y-4">

                  <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200" />

                  <div className="h-20 animate-pulse rounded-xl bg-slate-100" />

                  <div className="h-28 animate-pulse rounded-xl bg-slate-100" />

                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    {selectedItem.title}
                  </h2>

                  <div className="mt-6">

                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Question
                    </p>

                    <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {selectedItem.question}
                    </p>

                  </div>

                  <div className="mt-6">

                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Answer
                    </p>

                    <p className="text-sm leading-7 text-slate-700">
                      {selectedItem.answer}
                    </p>

                  </div>

                  {selectedItem.keywords?.length >
                    0 && (
                    <div className="mt-6">

                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Keywords
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {selectedItem.keywords.map(
                          (keyword) => (
                            <span
                              key={keyword}
                              className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                            >
                              {keyword}
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

                    <div className="flex items-start gap-3">

                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                      <div>

                        <p className="text-sm font-semibold text-slate-900">
                          Verified information
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          Source:{" "}
                          {selectedItem.sourceTitle ||
                            "Official KL University Website"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Last verified:{" "}
                          {selectedItem.lastVerified
                            ? new Date(
                                selectedItem.lastVerified
                              ).toLocaleString()
                            : "Not specified"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {selectedItem.sourceUrl && (
                    <a
                      href={
                        selectedItem.sourceUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
                    >
                      Open source
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  )}
                </>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default KnowledgeHub;