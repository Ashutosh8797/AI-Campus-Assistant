import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Search,
  Package,
  MapPin,
  Plus,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  createLostFound,
  getLostFoundItems,
  getMyLostFoundItems,
  claimLostFoundItem,
  uploadLostFoundImage,
} from "../services/api";

const categories = [
  "ID_CARD",
  "BOOK",
  "ELECTRONICS",
  "CLOTHING",
  "KEYS",
  "DOCUMENT",
  "OTHER",
];

// =====================================================
// IMAGE URL HELPER
// =====================================================

const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `http://127.0.0.1:5000${imageUrl}`;
};

function LostFound() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingMyItems, setLoadingMyItems] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [claimingId, setClaimingId] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [typeFilter, setTypeFilter] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [previewImage, setPreviewImage] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    type: "LOST",
    category: "OTHER",
    location: "",
    contactInfo: "",
  });

  // =====================================================
  // LOAD OPEN ITEMS
  // =====================================================

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (typeFilter) {
        params.type = typeFilter;
      }

      if (categoryFilter) {
        params.category =
          categoryFilter;
      }

      if (search.trim()) {
        params.search =
          search.trim();
      }

      const result =
        await getLostFoundItems(
          params
        );

      if (result.success) {
        setItems(result.items || []);
      } else {
        setError(
          result.message ||
            "Unable to load lost and found items."
        );
      }
    } catch (err) {
      console.error(
        "Lost and found load error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load lost and found items."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD MY ITEMS
  // =====================================================

  const loadMyItems = async () => {
    try {
      setLoadingMyItems(true);

      const result =
        await getMyLostFoundItems();

      if (result.success) {
        setMyItems(result.items || []);
      }
    } catch (err) {
      console.error(
        "My lost and found error:",
        err
      );
    } finally {
      setLoadingMyItems(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [
    typeFilter,
    categoryFilter,
  ]);

  useEffect(() => {
    loadMyItems();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =====================================================
  // PHOTO CHANGE
  // =====================================================

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      setSelectedImage(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be 5 MB or smaller."
      );

      event.target.value = "";
      setSelectedImage(null);
      return;
    }

    setError("");
    setSelectedImage(file);
  };

  // =====================================================
  // REMOVE PHOTO
  // =====================================================

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  // =====================================================
  // CREATE REPORT
  // =====================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      !form.contactInfo.trim()
    ) {
      setError(
        "Please fill in title, description, location and contact information."
      );

      return;
    }

    try {
      setSubmitting(true);

      let imageUrl = "";

      // =====================================================
      // UPLOAD PHOTO FIRST
      // =====================================================

      if (selectedImage) {
        const uploadResult =
          await uploadLostFoundImage(
            selectedImage
          );

        if (!uploadResult.success) {
          setError(
            uploadResult.message ||
              "Unable to upload the photo."
          );

          return;
        }

        imageUrl =
          uploadResult.imageUrl || "";
      }

      // =====================================================
      // CREATE LOST & FOUND REPORT
      // =====================================================

      const result =
        await createLostFound({
          title: form.title.trim(),

          description:
            form.description.trim(),

          imageUrl,

          type: form.type,

          category: form.category,

          location:
            form.location.trim(),

          contactInfo:
            form.contactInfo.trim(),
        });

      if (!result.success) {
        setError(
          result.message ||
            "Unable to create report."
        );

        return;
      }

      setMessage(
        result.message ||
          "Lost and found report created successfully."
      );

      // =====================================================
      // RESET FORM
      // =====================================================

      setForm({
        title: "",
        description: "",
        imageUrl: "",
        type: "LOST",
        category: "OTHER",
        location: "",
        contactInfo: "",
      });

      setSelectedImage(null);

      setShowForm(false);

      // =====================================================
      // REFRESH LISTS
      // =====================================================

      await loadItems();
      await loadMyItems();
    } catch (err) {
      console.error(
        "Create lost and found error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create lost and found report."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // CLAIM FOUND ITEM
  // =====================================================

  const handleClaim = async (
    id
  ) => {
    setMessage("");
    setError("");

    try {
      setClaimingId(id);

      const result =
        await claimLostFoundItem(id);

      if (!result.success) {
        setError(
          result.message ||
            "Unable to claim this item."
        );

        return;
      }

      setMessage(
        result.message ||
          "Item claimed successfully."
      );

      await loadItems();
      await loadMyItems();
    } catch (err) {
      console.error(
        "Claim item error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to claim this item."
      );
    } finally {
      setClaimingId(null);
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusClass = (
    status
  ) => {
    if (status === "CLAIMED") {
      return "status-claimed";
    }

    if (status === "CLOSED") {
      return "status-closed";
    }

    return "status-open";
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
          maxWidth: "1150px",
          margin: "0 auto",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate("/")
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            background:
              "transparent",
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
            border:
              "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: "20px",
              flexWrap:
                "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "14px",
                  marginBottom:
                    "10px",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius:
                      "14px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      "#fff7ed",
                  }}
                >
                  <Package
                    size={28}
                  />
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize:
                      "30px",
                  }}
                >
                  Lost & Found
                </h1>
              </div>

              <p
                style={{
                  margin: 0,
                  color:
                    "#6b7280",
                }}
              >
                Report lost items,
                find reported items,
                and claim found
                belongings.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowForm(
                  true
                )
              }
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "8px",
                padding:
                  "12px 18px",
                borderRadius:
                  "10px",
                border: "none",
                cursor:
                  "pointer",
                fontWeight:
                  600,
              }}
            >
              <Plus size={18} />
              Report Item
            </button>
          </div>
        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
              background:
                "#ecfdf5",
              color:
                "#065f46",
              padding:
                "14px 16px",
              borderRadius:
                "12px",
              marginBottom:
                "20px",
            }}
          >
            <CheckCircle
              size={18}
            />
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background:
                "#fef2f2",
              color:
                "#991b1b",
              padding:
                "14px 16px",
              borderRadius:
                "12px",
              marginBottom:
                "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            REPORT FORM
        ================================================= */}

        {showForm && (
          <div
            style={{
              background:
                "#ffffff",
              borderRadius:
                "20px",
              padding:
                "32px",
              marginBottom:
                "28px",
              border:
                "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "24px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                Report a lost or
                found item
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowForm(
                    false
                  )
                }
                style={{
                  border: "none",
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "20px",
                }}
              >
                {/* TYPE */}

                <div>
                  <label>
                    Report type
                  </label>

                  <select
                    name="type"
                    value={
                      form.type
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "12px",
                      marginTop:
                        "8px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid #d1d5db",
                    }}
                  >
                    <option value="LOST">
                      LOST
                    </option>

                    <option value="FOUND">
                      FOUND
                    </option>
                  </select>
                </div>

                {/* CATEGORY */}

                <div>
                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "12px",
                      marginTop:
                        "8px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid #d1d5db",
                    }}
                  >
                    {categories.map(
                      (
                        category
                      ) => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* TITLE */}

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label>
                    Item title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      form.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Black wallet"
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "12px",
                      marginTop:
                        "8px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid #d1d5db",
                    }}
                  />
                </div>

                {/* LOCATION */}

                <div>
                  <label>
                    Location
                  </label>

                  <div
                    style={{
                      position:
                        "relative",
                      marginTop:
                        "8px",
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
                      value={
                        form.location
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Where was it lost/found?"
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "12px 12px 12px 40px",
                        borderRadius:
                          "10px",
                        border:
                          "1px solid #d1d5db",
                      }}
                    />
                  </div>
                </div>

                {/* CONTACT */}

                <div>
                  <label>
                    Contact information
                  </label>

                  <input
                    type="text"
                    name="contactInfo"
                    value={
                      form.contactInfo
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Phone, email or other contact"
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "12px",
                      marginTop:
                        "8px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid #d1d5db",
                    }}
                  />
                </div>

                {/* DESCRIPTION */}

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows={5}
                    placeholder="Describe the item and any useful identifying details..."
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "12px",
                      marginTop:
                        "8px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid #d1d5db",
                      resize:
                        "vertical",
                    }}
                  />
                </div>

                {/* PHOTO */}

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        "600",
                      marginBottom:
                        "8px",
                    }}
                  >
                    Photo

                    <span
                      style={{
                        color:
                          "#9ca3af",
                        marginLeft:
                          "6px",
                        fontWeight:
                          "400",
                      }}
                    >
                      (optional)
                    </span>
                  </label>

                  <div
                    style={{
                      border:
                        "1px dashed #cbd5e1",
                      borderRadius:
                        "12px",
                      padding:
                        "20px",
                      background:
                        "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "10px",
                        marginBottom:
                          "12px",
                        color:
                          "#64748b",
                      }}
                    >
                      <ImageIcon
                        size={20}
                      />

                      <span
                        style={{
                          fontSize:
                            "14px",
                        }}
                      >
                        Upload a photo
                        of the lost or
                        found item
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageChange
                      }
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "10px",
                        cursor:
                          "pointer",
                      }}
                    />

                    <p
                      style={{
                        margin:
                          "10px 0 0",
                        color:
                          "#94a3b8",
                        fontSize:
                          "13px",
                      }}
                    >
                      JPG, PNG, WEBP and
                      other image files.
                      Maximum size: 5 MB.
                    </p>

                    {selectedImage && (
                      <div
                        style={{
                          marginTop:
                            "18px",
                        }}
                      >
                        <p
                          style={{
                            margin:
                              "0 0 10px",
                            fontSize:
                              "14px",
                            color:
                              "#475569",
                          }}
                        >
                          Selected photo:

                          <strong
                            style={{
                              marginLeft:
                                "5px",
                            }}
                          >
                            {
                              selectedImage.name
                            }
                          </strong>
                        </p>

                        <img
                          src={URL.createObjectURL(
                            selectedImage
                          )}
                          alt="Selected lost or found item"
                          onClick={() =>
                            setPreviewImage(
                              URL.createObjectURL(
                                selectedImage
                              )
                            )
                          }
                          style={{
                            width:
                              "200px",
                            height:
                              "200px",
                            objectFit:
                              "cover",
                            borderRadius:
                              "12px",
                            border:
                              "1px solid #e2e8f0",
                            display:
                              "block",
                            cursor:
                              "pointer",
                          }}
                        />

                        <p
                          style={{
                            margin:
                              "7px 0 0",
                            fontSize:
                              "12px",
                            color:
                              "#64748b",
                          }}
                        >
                          Click photo to
                          enlarge
                        </p>

                        <button
                          type="button"
                          onClick={
                            handleRemoveImage
                          }
                          style={{
                            marginTop:
                              "10px",
                            padding:
                              "8px 14px",
                            borderRadius:
                              "8px",
                            border:
                              "1px solid #e2e8f0",
                            background:
                              "#ffffff",
                            cursor:
                              "pointer",
                          }}
                        >
                          <X
                            size={14}
                            style={{
                              marginRight:
                                "5px",
                              verticalAlign:
                                "middle",
                            }}
                          />

                          Remove photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap: "12px",
                  marginTop:
                    "24px",
                }}
              >
                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  style={{
                    padding:
                      "13px 22px",
                    borderRadius:
                      "10px",
                    border: "none",
                    cursor:
                      submitting
                        ? "not-allowed"
                        : "pointer",
                    fontWeight:
                      600,
                    opacity:
                      submitting
                        ? 0.7
                        : 1,
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit report"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(
                      false
                    )
                  }
                  style={{
                    padding:
                      "13px 22px",
                    borderRadius:
                      "10px",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =================================================
            SEARCH & FILTERS
        ================================================= */}

        <div
          style={{
            background:
              "#ffffff",
            borderRadius:
              "18px",
            padding:
              "20px",
            marginBottom:
              "24px",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "2fr 1fr 1fr auto",
              gap: "12px",
            }}
          >
            <div
              style={{
                position:
                  "relative",
              }}
            >
              <Search
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
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event
                      .target
                      .value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    loadItems();
                  }
                }}
                placeholder="Search lost and found items..."
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px 12px 12px 40px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid #d1d5db",
                }}
              />
            </div>

            <select
              value={
                typeFilter
              }
              onChange={(
                event
              ) =>
                setTypeFilter(
                  event
                    .target
                    .value
                )
              }
              style={{
                padding:
                  "12px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #d1d5db",
              }}
            >
              <option value="">
                All types
              </option>

              <option value="LOST">
                Lost
              </option>

              <option value="FOUND">
                Found
              </option>
            </select>

            <select
              value={
                categoryFilter
              }
              onChange={(
                event
              ) =>
                setCategoryFilter(
                  event
                    .target
                    .value
                )
              }
              style={{
                padding:
                  "12px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #d1d5db",
              }}
            >
              <option value="">
                All categories
              </option>

              {categories.map(
                (
                  category
                ) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={
                loadItems
              }
              style={{
                padding:
                  "12px 18px",
                borderRadius:
                  "10px",
                border: "none",
                cursor:
                  "pointer",
                fontWeight:
                  600,
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* =================================================
            OPEN ITEMS
        ================================================= */}

        <div
          style={{
            background:
              "#ffffff",
            borderRadius:
              "20px",
            padding:
              "30px",
            marginBottom:
              "28px",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Open lost & found items
          </h2>

          <p
            style={{
              color:
                "#6b7280",
              marginBottom:
                "24px",
            }}
          >
            Browse items reported
            by students.
          </p>

          {loading ? (
            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "40px",
                color:
                  "#6b7280",
              }}
            >
              Loading items...
            </div>
          ) : items.length ===
            0 ? (
            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "45px 20px",
                color:
                  "#6b7280",
              }}
            >
              <Package
                size={38}
              />

              <h3
                style={{
                  color:
                    "#111827",
                }}
              >
                No open items
              </h3>

              <p>
                No lost or found
                items match your
                search.
              </p>
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              {items.map(
                (item) => {
                  const imageUrl =
                    getImageUrl(
                      item.imageUrl
                    );

                  return (
                    <div
                      key={
                        item._id
                      }
                      style={{
                        border:
                          "1px solid #e5e7eb",
                        borderRadius:
                          "15px",
                        padding:
                          "20px",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap:
                            "12px",
                          marginBottom:
                            "12px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin:
                                "0 0 7px",
                            }}
                          >
                            {
                              item.title
                            }
                          </h3>

                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "8px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <span
                              className={getStatusClass(
                                item.status
                              )}
                            >
                              {
                                item.status
                              }
                            </span>

                            <span>
                              {
                                item.type
                              }
                            </span>

                            <span>
                              {
                                item.category
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <p
                        style={{
                          color:
                            "#4b5563",
                        }}
                      >
                        {
                          item.description
                        }
                      </p>

                      {/* =================================================
                          ITEM PHOTO
                      ================================================= */}

                      {imageUrl && (
                        <div
                          style={{
                            marginBottom:
                              "16px",
                          }}
                        >
                          <img
                            src={
                              imageUrl
                            }
                            alt={
                              item.title
                            }
                            onClick={() =>
                              setPreviewImage(
                                imageUrl
                              )
                            }
                            style={{
                              width:
                                "100%",
                              maxWidth:
                                "320px",
                              height:
                                "220px",
                              objectFit:
                                "cover",
                              borderRadius:
                                "12px",
                              border:
                                "1px solid #e5e7eb",
                              cursor:
                                "pointer",
                              display:
                                "block",
                            }}
                          />

                          <div
                            style={{
                              marginTop:
                                "6px",
                              fontSize:
                                "12px",
                              color:
                                "#6b7280",
                            }}
                          >
                            Click photo
                            to enlarge
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          display:
                            "grid",
                          gap:
                            "8px",
                          color:
                            "#6b7280",
                          fontSize:
                            "14px",
                          marginBottom:
                            "16px",
                        }}
                      >
                        <span>
                          <MapPin
                            size={14}
                            style={{
                              marginRight:
                                "6px",
                              verticalAlign:
                                "middle",
                            }}
                          />

                          {
                            item.location
                          }
                        </span>

                        <span>
                          Contact:{" "}
                          {
                            item.contactInfo
                          }
                        </span>

                        <span>
                          <Clock
                            size={14}
                            style={{
                              marginRight:
                                "6px",
                              verticalAlign:
                                "middle",
                            }}
                          />

                          {new Date(
                            item.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {item.type ===
                        "FOUND" && (
                        <button
                          type="button"
                          disabled={
                            claimingId ===
                            item._id
                          }
                          onClick={() =>
                            handleClaim(
                              item._id
                            )
                          }
                          style={{
                            width:
                              "100%",
                            padding:
                              "11px",
                            borderRadius:
                              "9px",
                            border:
                              "none",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                            opacity:
                              claimingId ===
                              item._id
                                ? 0.7
                                : 1,
                          }}
                        >
                          {claimingId ===
                          item._id
                            ? "Claiming..."
                            : "Claim this item"}
                        </button>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* =================================================
            MY REPORTS
        ================================================= */}

        <div
          style={{
            background:
              "#ffffff",
            borderRadius:
              "20px",
            padding:
              "30px",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            My lost & found reports
          </h2>

          <p
            style={{
              color:
                "#6b7280",
            }}
          >
            Track items you have
            reported or claimed.
          </p>

          {loadingMyItems ? (
            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "30px",
                color:
                  "#6b7280",
              }}
            >
              Loading your reports...
            </div>
          ) : myItems.length ===
            0 ? (
            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "40px 20px",
                color:
                  "#6b7280",
              }}
            >
              <Package
                size={34}
              />

              <h3
                style={{
                  color:
                    "#111827",
                }}
              >
                No reports yet
              </h3>

              <p>
                Your lost and found
                reports will appear
                here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gap:
                  "14px",
              }}
            >
              {myItems.map(
                (item) => {
                  const imageUrl =
                    getImageUrl(
                      item.imageUrl
                    );

                  return (
                    <div
                      key={
                        item._id
                      }
                      style={{
                        border:
                          "1px solid #e5e7eb",
                        borderRadius:
                          "14px",
                        padding:
                          "18px",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap:
                            "15px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin:
                                "0 0 7px",
                            }}
                          >
                            {
                              item.title
                            }
                          </h3>

                          <p
                            style={{
                              margin:
                                0,
                              color:
                                "#6b7280",
                            }}
                          >
                            {
                              item.type
                            }{" "}
                            •{" "}
                            {
                              item.category
                            }{" "}
                            •{" "}
                            {
                              item.location
                            }
                          </p>
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "8px",
                          }}
                        >
                          <span
                            className={getStatusClass(
                              item.status
                            )}
                          >
                            {
                              item.status
                            }
                          </span>

                          <span
                            style={{
                              color:
                                "#6b7280",
                              fontSize:
                                "13px",
                            }}
                          >
                            <Clock
                              size={13}
                              style={{
                                marginRight:
                                  "4px",
                                verticalAlign:
                                  "middle",
                              }}
                            />

                            {new Date(
                              item.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* =================================================
                          MY REPORT PHOTO
                      ================================================= */}

                      {imageUrl && (
                        <div
                          style={{
                            marginTop:
                              "16px",
                          }}
                        >
                          <img
                            src={
                              imageUrl
                            }
                            alt={
                              item.title
                            }
                            onClick={() =>
                              setPreviewImage(
                                imageUrl
                              )
                            }
                            style={{
                              width:
                                "180px",
                              height:
                                "130px",
                              objectFit:
                                "cover",
                              borderRadius:
                                "10px",
                              border:
                                "1px solid #e5e7eb",
                              cursor:
                                "pointer",
                              display:
                                "block",
                            }}
                          />

                          <div
                            style={{
                              marginTop:
                                "6px",
                              fontSize:
                                "12px",
                              color:
                                "#6b7280",
                            }}
                          >
                            Click photo
                            to enlarge
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          FULL SCREEN PHOTO PREVIEW
      ===================================================== */}

      {previewImage && (
        <div
          onClick={() =>
            setPreviewImage(null)
          }
          style={{
            position:
              "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "rgba(0, 0, 0, 0.82)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "30px",
            boxSizing:
              "border-box",
          }}
        >
          {/* CLOSE BUTTON */}

          <button
            type="button"
            aria-label="Close photo preview"
            onClick={(event) => {
              event.stopPropagation();
              setPreviewImage(null);
            }}
            style={{
              position:
                "fixed",
              top: "22px",
              right: "25px",
              width: "44px",
              height: "44px",
              borderRadius:
                "50%",
              border:
                "1px solid rgba(255,255,255,0.4)",
              background:
                "rgba(0,0,0,0.55)",
              color:
                "#ffffff",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              cursor:
                "pointer",
              zIndex:
                10000,
            }}
          >
            <X size={25} />
          </button>

          {/* LARGE PHOTO */}

          <img
            src={
              previewImage
            }
            alt="Lost and found item preview"
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              maxWidth:
                "92vw",
              maxHeight:
                "88vh",
              objectFit:
                "contain",
              borderRadius:
                "12px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.45)",
              background:
                "#ffffff",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default LostFound;