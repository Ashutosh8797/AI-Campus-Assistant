import axios from "axios";

const API_BASE_URL =
  "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// AUTH TOKEN
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "campus_token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

// =====================================================
// AUTH ERROR
// =====================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "campus_token"
      );

      localStorage.removeItem(
        "campus_user"
      );
    }

    return Promise.reject(error);
  }
);

// =====================================================
// AUTH
// =====================================================

export const loginUser = async (
  studentId,
  password
) => {
  const response =
    await api.post(
      "/auth/login",
      {
        studentId,
        password,
      }
    );

  return response.data;
};

export const registerUser = async (
  data
) => {
  const response =
    await api.post(
      "/auth/register",
      data
    );

  return response.data;
};

export const verifyOtp = async (
  data
) => {
  const response =
    await api.post(
      "/auth/verify-otp",
      data
    );

  return response.data;
};

export const resendVerificationOtp =
  async (data) => {
    const response =
      await api.post(
        "/auth/resend-verification-otp",
        data
      );

    return response.data;
  };

export const forgotPassword = async (
  studentId
) => {
  const response =
    await api.post(
      "/auth/forgot-password",
      {
        studentId,
      }
    );

  return response.data;
};

export const resetPassword = async (
  data
) => {
  const response =
    await api.post(
      "/auth/reset-password",
      data
    );

  return response.data;
};

// =====================================================
// AI ASSISTANT
// =====================================================

export const chatWithAssistant =
  async (message) => {
    const response =
      await api.post(
        "/assistant/chat",
        {
          message,
        }
      );

    return response.data;
  };

// =====================================================
// MAINTENANCE
// =====================================================

// Create maintenance request
export const createMaintenanceRequest =
  async (data) => {
    const response =
      await api.post(
        "/maintenance",
        data
      );

    return response.data;
  };

// Get student's own maintenance requests
export const getMyMaintenanceRequests =
  async () => {
    const response =
      await api.get(
        "/maintenance/my"
      );

    return response.data;
  };

// Get one maintenance request
export const getMaintenanceRequestById =
  async (id) => {
    const response =
      await api.get(
        `/maintenance/${id}`
      );

    return response.data;
  };

// =====================================================
// ADMIN MAINTENANCE
// =====================================================

// Get all maintenance requests
export const getAllMaintenanceRequests =
  async (params = {}) => {
    const response =
      await api.get(
        "/maintenance/admin/all",
        {
          params,
        }
      );

    return response.data;
  };

// Update maintenance request
export const updateMaintenanceRequest =
  async (id, data) => {
    const response =
      await api.put(
        `/maintenance/${id}`,
        data
      );

    return response.data;
  };

// =====================================================
// SAFETY & SECURITY
// =====================================================

export const createSafetyReport =
  async (data) => {
    const response =
      await api.post(
        "/safety",
        data
      );

    return response.data;
  };

export const getMySafetyReports =
  async () => {
    const response =
      await api.get(
        "/safety/my"
      );

    return response.data;
  };

// =====================================================
// LOST & FOUND
// =====================================================

// Report a lost or found item
export const createLostFound =
  async (data) => {
    const response =
      await api.post(
        "/lost-found",
        data
      );

    return response.data;
  };

// Get open lost and found items
export const getLostFoundItems =
  async (params = {}) => {
    const response =
      await api.get(
        "/lost-found",
        {
          params,
        }
      );

    return response.data;
  };

// Get student's own lost and found reports
export const getMyLostFoundItems =
  async () => {
    const response =
      await api.get(
        "/lost-found/my"
      );

    return response.data;
  };

// Get one lost and found item
export const getLostFoundById =
  async (id) => {
    const response =
      await api.get(
        `/lost-found/${id}`
      );

    return response.data;
  };

// Claim a found item
export const claimLostFoundItem =
  async (id) => {
    const response =
      await api.post(
        `/lost-found/${id}/claim`
      );

    return response.data;
  };

// =====================================================
// LOST & FOUND IMAGE UPLOAD
// =====================================================

export const uploadLostFoundImage =
  async (imageFile) => {
    const formData =
      new FormData();

    formData.append(
      "image",
      imageFile
    );

    const response =
      await api.post(
        "/lost-found/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };

// =====================================================
// DEFAULT API
// =====================================================

export default api;