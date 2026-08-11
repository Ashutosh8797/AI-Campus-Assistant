import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Loader2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { chatWithAssistant } from "../services/api";

const suggestedQuestions = [
  "Where is the central library?",
  "What are the hostel facilities?",
  "Where can I find campus transportation information?",
  "What academic programs are available?",
];

function AIAssistant() {
  const [searchParams] =
    useSearchParams();

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const hasProcessedUrlQuestion =
    useRef(false);

  /*
  =====================================================
  ASK QUESTION
  =====================================================
  */

  const askQuestion = async (
    questionText
  ) => {
    const text =
      String(questionText || "").trim();

    if (!text || loading) {
      return;
    }

    setError("");

    setMessages((previous) => [
      ...previous,
      {
        id:
          Date.now() +
          "-user-" +
          Math.random(),
        type: "user",
        text,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const result =
  await chatWithAssistant(text);

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to get an answer."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          id:
            Date.now() +
            "-assistant-" +
            Math.random(),
          type: "assistant",
          text:
            result.message ||
            "I couldn't find an answer.",
          sources:
            result.sources || [],
        },
      ]);
    } catch (err) {
      console.error(
        "AI Assistant error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to connect to the AI Assistant."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  READ QUESTION FROM DASHBOARD URL
  =====================================================
  */

  useEffect(() => {
    const urlQuestion =
      searchParams.get("question");

    if (
      urlQuestion &&
      !hasProcessedUrlQuestion.current
    ) {
      hasProcessedUrlQuestion.current =
        true;

      setQuestion(urlQuestion);

      /*
       * Small delay makes sure the page
       * has mounted before sending.
       */
      setTimeout(() => {
        askQuestion(urlQuestion);
      }, 150);
    }
  }, [searchParams]);

  /*
  =====================================================
  FORM SUBMIT
  =====================================================
  */

  const handleSubmit = (event) => {
    event.preventDefault();

    askQuestion(question);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">

      {/* =====================================
          TOP BAR
      ====================================== */}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-20 items-center justify-between px-6 lg:px-10">

          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Verified campus knowledge
          </div>
        </div>
      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-12">

        {/* HEADER */}

        <div className="mb-8">

          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Sparkles className="h-6 w-6" />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            AI CAMPUS ASSISTANT
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Ask anything about your campus
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Get answers from the verified KL
            University Vijayawada campus
            knowledge base.
          </p>
        </div>

        {/* =====================================
            CHAT AREA
        ====================================== */}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* CHAT */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* CHAT HEADER */}

            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Bot className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-950">
                    Campus AI
                  </h2>

                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Online
                  </div>
                </div>

              </div>
            </div>

            {/* MESSAGES */}

            <div className="min-h-[430px] space-y-5 p-6">

              {messages.length === 0 && (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">

                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                    <Bot className="h-10 w-10" />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-950">
                    How can I help?
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Ask me about verified campus
                    information, facilities,
                    transportation, academic
                    programs and more.
                  </p>

                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.type === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >

                  <div
                    className={
                      message.type === "user"
                        ? "flex max-w-[85%] items-start gap-3"
                        : "flex max-w-[90%] items-start gap-3"
                    }
                  >

                    {message.type ===
                      "assistant" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div>

                      <div
                        className={
                          message.type ===
                          "user"
                            ? "rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-3 text-sm leading-6 text-white"
                            : "rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-800"
                        }
                      >
                        {message.text}
                      </div>

                      {message.type ===
                        "assistant" &&
                        message.sources?.length >
                          0 && (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">

                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                              <BookOpen className="h-3.5 w-3.5 text-violet-600" />
                              Verified sources
                            </div>

                            <div className="space-y-2">

                              {message.sources.map(
                                (source) => (
                                  <div
                                    key={
                                      source.id
                                    }
                                    className="text-xs text-slate-500"
                                  >
                                    <p className="font-medium text-slate-700">
                                      {
                                        source.title
                                      }
                                    </p>

                                    {source.category && (
                                      <span className="text-slate-400">
                                        {
                                          source.category
                                        }
                                      </span>
                                    )}
                                  </div>
                                )
                              )}

                            </div>
                          </div>
                        )}

                    </div>

                    {message.type ===
                      "user" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <User className="h-4 w-4" />
                      </div>
                    )}

                  </div>
                </div>
              ))}

              {/* LOADING */}

              {loading && (
                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* ERROR */}

            {error && (
              <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* INPUT */}

            <div className="border-t border-slate-100 bg-slate-50 p-5">

              <form
                onSubmit={handleSubmit}
                className="flex gap-3"
              >

                <div className="relative flex-1">

                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={question}
                    onChange={(event) =>
                      setQuestion(
                        event.target.value
                      )
                    }
                    placeholder="Ask something about your campus..."
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-100"
                  />

                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !question.trim()
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>

              </form>

              <p className="mt-3 text-center text-xs text-slate-400">
                Answers are generated using
                verified campus knowledge.
              </p>

            </div>

          </section>

          {/* =====================================
              SUGGESTIONS
          ====================================== */}

          <aside className="space-y-5">

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />

                <h3 className="font-semibold text-slate-950">
                  Try asking
                </h3>
              </div>

              <div className="space-y-2">

                {suggestedQuestions.map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        askQuestion(item)
                      }
                      disabled={loading}
                      className="group flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 text-left text-sm text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <span>
                        {item}
                      </span>

                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-500" />

                    </button>
                  )
                )}

              </div>

            </div>

            {/* VERIFIED CARD */}

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h3 className="font-semibold text-slate-950">
                Verified knowledge
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                The assistant only uses
                published Vijayawada campus
                knowledge provided by the
                university system.
              </p>

            </div>

          </aside>

        </div>

      </main>
    </div>
  );
}

export default AIAssistant;