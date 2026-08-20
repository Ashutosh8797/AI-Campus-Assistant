import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Shield,
  MapPin,
} from "lucide-react";
import {
  createSafetyReport,
  getMySafetyReports,
} from "../services/api";
import { useNavigate } from "react-router-dom";

const categories = [
  "EMERGENCY",
  "SECURITY",
  "FIRE",
  "MEDICAL",
  "HARASSMENT",
  "ACCIDENT",
  "OTHER",
];

const priorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

function Safety() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "SECURITY",
    location: "",
    priority: "HIGH",
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] =
    useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoadingReports(true);

      const result =
        await getMySafetyReports();

      if (result.success) {
        setReports(result.reports || []);
      } else {
        setError(
          result.message ||
            "Unable to load safety reports."
        );
      }
    } catch (err) {
      console.error(
        "Safety reports error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your safety reports."
      );
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim()
    ) {
      setError(
        "Please fill in title, description and location."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await createSafetyReport({
          title: form.title,
          description: form.description,
          category: form.category,
          location: form.location,
          priority: form.priority,
        });

      if (!result.success) {
        setError(
          result.message ||
            "Unable to submit safety report."
        );
        return;
      }

      setMessage(
        "Safety report submitted successfully."
      );

      setForm({
        title: "",
        description: "",
        category: "SECURITY",
        location: "",
        priority: "HIGH",
      });

      await loadReports();
    } catch (err) {
      console.error(
        "Create safety report error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to submit safety report."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "RESOLVED":
        return "status-resolved";

      case "INVESTIGATING":
        return "status-investigating";

      case "REJECTED":
        return "status-rejected";

      default:
        return "status-reported";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "URGENT":
        return "priority-urgent";

      case "HIGH":
        return "priority-high";

      case "MEDIUM":
        return "priority-medium";

      default:
        return "priority-low";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}

        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            marginBottom: "24px",
            fontSize: "15px",
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#eef2ff",
              }}
            >
              <Shield size={28} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                }}
              >
                Safety & Security
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#6b7280",
                }}
              >
                Report a campus safety or
                security concern.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}

        {message && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#ecfdf5",
              color: "#065f46",
              padding: "14px 16px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <CheckCircle size={18} />
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fef2f2",
              color: "#991b1b",
              padding: "14px 16px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* Form */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "28px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "24px",
            }}
          >
            Report a safety concern
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "20px",
              }}
            >
              {/* Category */}

              <div>
                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    borderRadius: "10px",
                    border:
                      "1px solid #d1d5db",
                  }}
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Priority */}

              <div>
                <label>
                  Priority
                </label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    borderRadius: "10px",
                    border:
                      "1px solid #d1d5db",
                  }}
                >
                  {priorities.map(
                    (priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {priority}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Title */}

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label>
                  Issue title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Broken security light"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    marginTop: "8px",
                    borderRadius: "10px",
                    border:
                      "1px solid #d1d5db",
                  }}
                />
              </div>

              {/* Location */}

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label>
                  Location
                </label>

                <div
                  style={{
                    position: "relative",
                    marginTop: "8px",
                  }}
                >
                  <MapPin
                    size={18}
                    style={{
                      position:
                        "absolute",
                      left: "12px",
                      top: "13px",
                    }}
                  />

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Example: Block A, Main Gate"
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "12px 12px 12px 40px",
                      borderRadius: "10px",
                      border:
                        "1px solid #d1d5db",
                    }}
                  />
                </div>
              </div>

              {/* Description */}

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label>
                  Describe the problem
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe what happened or what safety concern you noticed..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    marginTop: "8px",
                    borderRadius: "10px",
                    border:
                      "1px solid #d1d5db",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "24px",
                padding:
                  "13px 22px",
                borderRadius: "10px",
                border: "none",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 600,
                opacity: loading
                  ? 0.7
                  : 1,
              }}
            >
              {loading
                ? "Submitting..."
                : "Submit safety report"}
            </button>
          </form>
        </div>

        {/* My reports */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            My safety reports
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "24px",
            }}
          >
            Track the safety concerns you
            have reported.
          </p>

          {loadingReports ? (
            <div
              style={{
                padding: "30px 0",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Loading your reports...
            </div>
          ) : reports.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <Shield
                size={34}
                style={{
                  marginBottom: "10px",
                }}
              />

              <h3
                style={{
                  color: "#111827",
                }}
              >
                No safety reports yet
              </h3>

              <p>
                Your submitted safety reports
                will appear here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {reports.map((report) => (
                <div
                  key={report._id}
                  style={{
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin:
                            "0 0 8px",
                        }}
                      >
                        {report.title}
                      </h3>

                      <p
                        style={{
                          margin:
                            "0 0 8px",
                          color:
                            "#6b7280",
                        }}
                      >
                        {report.description}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          flexWrap:
                            "wrap",
                          color:
                            "#6b7280",
                          fontSize:
                            "14px",
                        }}
                      >
                        <span>
                          📍{" "}
                          {report.location}
                        </span>

                        <span>
                          {report.category}
                        </span>

                        <span
                          className={getPriorityClass(
                            report.priority
                          )}
                        >
                          {report.priority}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        alignItems:
                          "flex-end",
                        gap: "8px",
                      }}
                    >
                      <span
                        className={getStatusClass(
                          report.status
                        )}
                      >
                        {report.status}
                      </span>

                      <span
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "5px",
                          color:
                            "#6b7280",
                          fontSize:
                            "13px",
                        }}
                      >
                        <Clock
                          size={14}
                        />

                        {new Date(
                          report.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Safety;