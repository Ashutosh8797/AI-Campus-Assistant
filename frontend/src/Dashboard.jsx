import {
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  Wrench,
  X,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const quickActions = [
  {
    title: "Maintenance",
    description: "Report a campus issue",
    icon: Wrench,
    className: "action-blue",
  },
  {
    title: "Safety & Security",
    description: "Report a safety concern",
    icon: Shield,
    className: "action-green",
  },
  {
    title: "Lost & Found",
    description: "Report or find an item",
    icon: Search,
    className: "action-orange",
  },
  {
    title: "Campus Services",
    description: "Find student services",
    icon: GraduationCap,
    className: "action-purple",
  },
  {
    title: "My Requests",
    description: "Track your requests",
    icon: FileText,
    className: "action-sky",
  },
];

const navigation = [
  {
    label: "Dashboard",
    icon: Home,
  },
  {
    label: "AI Assistant",
    icon: Sparkles,
    accent: true,
  },
  {
    label: "Knowledge Hub",
    icon: BookOpen,
  },
  {
    label: "Maintenance",
    icon: Wrench,
  },
  {
    label: "Safety & Security",
    icon: Shield,
  },
  {
    label: "Lost & Found",
    icon: Search,
  },
  {
    label: "Campus Services",
    icon: GraduationCap,
  },
  {
    label: "My Requests",
    icon: FileText,
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [question, setQuestion] =
    useState("");

  const handleAsk = () => {
    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion) {
      navigate("/ai-assistant");
      return;
    }

    navigate(
      `/ai-assistant?question=${encodeURIComponent(
        trimmedQuestion
      )}`
    );
  };

  // =====================================================
  // SIDEBAR NAVIGATION
  // =====================================================

  const handleNavigation = (label) => {
    setSidebarOpen(false);

    if (label === "Dashboard") {
      navigate("/");
      return;
    }

    if (label === "AI Assistant") {
      navigate("/ai-assistant");
      return;
    }

    if (label === "Knowledge Hub") {
      navigate("/knowledge");
      return;
    }

    if (label === "Maintenance") {
      navigate("/maintenance");
      return;
    }

    if (label === "Safety & Security") {
      navigate("/safety");
      return;
    }

    if (label === "Lost & Found") {
      navigate("/lost-found");
      return;
    }

    if (label === "Campus Services") {
      navigate("/services");
      return;
    }

    if (label === "My Requests") {
      navigate("/my-requests");
      return;
    }
  };

  // =====================================================
  // QUICK ACTION NAVIGATION
  // =====================================================

  const handleQuickAction = (title) => {
    if (title === "Maintenance") {
      navigate("/maintenance");
      return;
    }

    if (title === "Safety & Security") {
      navigate("/safety");
      return;
    }

    if (title === "Lost & Found") {
      navigate("/lost-found");
      return;
    }

    if (title === "Campus Services") {
      navigate("/services");
      return;
    }

    if (title === "My Requests") {
      navigate("/my-requests");
      return;
    }
  };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">
              <GraduationCap
                size={25}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <div className="brand-title">
                KL
              </div>

              <div className="brand-subtitle">
                AI CAMPUS ASSISTANT
              </div>
            </div>
          </div>

          <button
            className="mobile-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-label">
              CAMPUS
            </p>

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`nav-item ${
                    item.label ===
                    "Dashboard"
                      ? "nav-active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      item.label
                    )
                  }
                >
                  <Icon
                    size={19}
                    strokeWidth={1.9}
                  />

                  <span>
                    {item.label}
                  </span>

                  {item.accent && (
                    <span className="nav-dot" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="nav-divider" />

          <div className="nav-section">
            <p className="nav-label">
              ACCOUNT
            </p>

            <button className="nav-item">
              <User size={19} />
              <span>Profile</span>
            </button>

            <button className="nav-item">
              <Settings size={19} />
              <span>Settings</span>
            </button>

            <button className="nav-item nav-logout">
              <LogOut size={19} />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* AI helper card */}

        <div className="sidebar-ai-card">
          <div className="sidebar-ai-icon">
            <Bot size={22} />
          </div>

          <div>
            <p className="sidebar-ai-title">
              Need help?
            </p>

            <p className="sidebar-ai-text">
              Ask your AI campus assistant.
            </p>
          </div>

          <button
            className="sidebar-ai-button"
            onClick={() =>
              navigate("/ai-assistant")
            }
          >
            Chat now
            <ArrowRight size={14} />
          </button>
        </div>
      </aside>

      {/* Main area */}

      <main className="main-area">
        {/* Topbar */}

        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="global-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search anything..."
                aria-label="Search anything"
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    handleAsk();
                  }
                }}
              />

              <span className="search-shortcut">
                ⌘ K
              </span>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="notification-dot">
                3
              </span>
            </button>

            <button
              className="icon-button"
              aria-label="Toggle theme"
            >
              <Moon size={19} />
            </button>

            <div className="profile-menu">
              <div className="profile-avatar">
                <User size={19} />
              </div>

              <div className="profile-info">
                <strong>Student</strong>
                <span>
                  KL Vijayawada
                </span>
              </div>

              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Content */}

        <div className="dashboard-content">
          {/* Hero heading */}

          <section className="welcome-section">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                KL VIJAYAWADA CAMPUS
              </div>

              <h1>
                Good to see you again{" "}
                <span>👋</span>
              </h1>

              <p>
                Your campus, one intelligent
                assistant.
              </p>
            </div>

            <div className="date-pill">
              <div className="date-icon">
                <BookOpen size={16} />
              </div>

              <span>
                Campus knowledge verified
              </span>
            </div>
          </section>

          {/* AI Hero */}

          <section className="ai-hero">
            <div className="ai-glow ai-glow-one" />
            <div className="ai-glow ai-glow-two" />

            <div className="ai-hero-content">
              <div className="ai-title-row">
                <div className="ai-spark-icon">
                  <Sparkles size={21} />
                </div>

                <div>
                  <p className="ai-small-title">
                    AI CAMPUS ASSISTANT
                  </p>

                  <h2>
                    Ask anything about your
                    campus
                  </h2>
                </div>
              </div>

              <p className="ai-description">
                Get answers from the verified
                KL Vijayawada campus
                knowledge base.
              </p>

              <div className="ai-search-box">
                <Search size={19} />

                <input
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      handleAsk();
                    }
                  }}
                  placeholder="Where is the central library?"
                />

                <button
                  onClick={handleAsk}
                  className="ai-send-button"
                  aria-label="Ask assistant"
                >
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="suggestions">
                <button
                  onClick={() => {
                    const text =
                      "Does KL Vijayawada have hostel facilities?";

                    setQuestion(text);

                    navigate(
                      `/ai-assistant?question=${encodeURIComponent(
                        text
                      )}`
                    );
                  }}
                >
                  Hostel facilities
                </button>

                <button
                  onClick={() => {
                    const text =
                      "Does KL Vijayawada provide transport facilities?";

                    setQuestion(text);

                    navigate(
                      `/ai-assistant?question=${encodeURIComponent(
                        text
                      )}`
                    );
                  }}
                >
                  Transport
                </button>

                <button
                  onClick={() => {
                    const text =
                      "Where is KL Vijayawada campus located?";

                    setQuestion(text);

                    navigate(
                      `/ai-assistant?question=${encodeURIComponent(
                        text
                      )}`
                    );
                  }}
                >
                  Campus location
                </button>

                <button
                  onClick={() => {
                    const text =
                      "What academic programs are available at KL Vijayawada?";

                    setQuestion(text);

                    navigate(
                      `/ai-assistant?question=${encodeURIComponent(
                        text
                      )}`
                    );
                  }}
                >
                  Academic programs
                </button>
              </div>
            </div>

            <div className="ai-orbit">
              <div className="orbit-ring orbit-ring-one" />
              <div className="orbit-ring orbit-ring-two" />

              <div className="ai-orb">
                <Bot
                  size={52}
                  strokeWidth={1.5}
                />
              </div>

              <div className="floating-chip chip-one">
                <Sparkles size={13} />
                Verified AI
              </div>

              <div className="floating-chip chip-two">
                <Shield size={13} />
                Trusted
              </div>
            </div>
          </section>

          {/* Quick actions */}

          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="section-kicker">
                  CAMPUS SERVICES
                </p>

                <h2>
                  Quick actions
                </h2>
              </div>

              <button className="view-all">
                View all
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="quick-grid">
              {quickActions.map(
                (action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      className={`quick-card ${action.className}`}
                      key={action.title}
                      onClick={() =>
                        handleQuickAction(
                          action.title
                        )
                      }
                    >
                      <div className="quick-icon">
                        <Icon size={21} />
                      </div>

                      <div className="quick-copy">
                        <h3>
                          {action.title}
                        </h3>

                        <p>
                          {action.description}
                        </p>
                      </div>

                      <ArrowRight
                        className="quick-arrow"
                        size={18}
                      />
                    </button>
                  );
                }
              )}
            </div>
          </section>

          {/* Lower dashboard */}

          <section className="lower-grid">
            {/* AI assistant card */}

            <div className="panel ai-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-icon panel-icon-ai">
                    <Bot size={18} />
                  </div>

                  <h3>
                    AI Assistant
                  </h3>

                  <p>
                    Your intelligent campus
                    companion
                  </p>
                </div>

                <span className="online-status">
                  <span />
                  Online
                </span>
              </div>

              <div className="ai-panel-body">
                <div className="mini-ai-orb">
                  <Bot size={37} />
                </div>

                <div>
                  <p>
                    Ask questions about
                    academics, facilities,
                    hostel, transport and
                    other verified campus
                    information.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() =>
                      navigate(
                        "/ai-assistant"
                      )
                    }
                  >
                    Start a conversation
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Activity */}

            <div className="panel">
              <div className="panel-header-simple">
                <div>
                  <div className="panel-icon panel-icon-blue">
                    <FileText size={18} />
                  </div>

                  <h3>
                    Recent activity
                  </h3>
                </div>

                <button className="small-link">
                  View all
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="empty-state">
                <div className="empty-icon">
                  <CircleHelp size={23} />
                </div>

                <h4>
                  No recent activity
                </h4>

                <p>
                  Your maintenance, safety,
                  lost & found and help
                  requests will appear here.
                </p>
              </div>
            </div>

            {/* Knowledge */}

            <div className="panel knowledge-panel">
              <div className="panel-header-simple">
                <div>
                  <div className="panel-icon panel-icon-purple">
                    <BookOpen size={18} />
                  </div>

                  <h3>
                    Knowledge hub
                  </h3>
                </div>

                <button
                  className="small-link"
                  onClick={() =>
                    navigate("/knowledge")
                  }
                >
                  Explore
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="knowledge-content">
                <div className="knowledge-row">
                  <div className="knowledge-icon">
                    <GraduationCap
                      size={17}
                    />
                  </div>

                  <div>
                    <strong>
                      Academics
                    </strong>

                    <span>
                      Programs & campus
                      information
                    </span>
                  </div>
                </div>

                <div className="knowledge-row">
                  <div className="knowledge-icon">
                    <BookOpen size={17} />
                  </div>

                  <div>
                    <strong>
                      Library
                    </strong>

                    <span>
                      Verified library
                      information
                    </span>
                  </div>
                </div>

                <div className="knowledge-row">
                  <div className="knowledge-icon">
                    <Shield size={17} />
                  </div>

                  <div>
                    <strong>
                      Campus services
                    </strong>

                    <span>
                      Facilities, hostel &
                      transport
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}

          <footer className="dashboard-footer">
            <div>
              <span className="footer-brand">
                KL AI CAMPUS ASSISTANT
              </span>

              <p>
                One intelligent place for
                your campus needs.
              </p>
            </div>

            <div className="footer-links">
              <span>
                Verified Knowledge
              </span>

              <span>
                Secure Access
              </span>

              <span>
                KL Vijayawada
              </span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;