import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Use the DBMS backend (same origin as the rest of the telecaller app) to avoid
// cross-origin issues when the telecaller panel is deployed to its live domain.
// Falls back to the website backend only if the DBMS env var is not set.
const getPlansBaseUrl = () => {
  return (
    import.meta.env.VITE_API_BASE_URL || // primary: DBMS backend
    import.meta.env.VITE_WEBSITE_API_BASE_URL || // legacy fallback
    import.meta.env.VITE_SUBSCRIPTION_API_BASE_URL || // legacy fallback
    "https://lts-dbms-backend.onrender.com" // hard-coded fallback
  );
};

export const fetchSubscriptionPlans = createAsyncThunk(
  "plans/fetchSubscriptionPlans",
  async (_, { rejectWithValue }) => {
    try {
      const baseUrl = getPlansBaseUrl().replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/api/customer/plan`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resData = await response.json();

      if (!response.ok || resData.success === false) {
        return rejectWithValue(
          resData.message || "Failed to fetch subscription plans",
        );
      }

      let rawPlans = [];
      if (Array.isArray(resData.data)) {
        rawPlans = resData.data;
      } else if (Array.isArray(resData)) {
        rawPlans = resData;
      }

      // Filter only active plans
      const activePlans = rawPlans.filter(
        (p) =>
          p &&
          p.isActive !== false &&
          p.isDeleted !== true &&
          p.status !== "Inactive",
      );

      // Flatten plans into selectable (plan, duration) option items
      const options = [];
      activePlans.forEach((plan) => {
        const planName =
          plan.subCategory || plan.name || plan.category || "Subscription Plan";
        const durations = Array.isArray(plan.durations) ? plan.durations : [];

        durations.forEach((dur) => {
          if (dur && dur.isDeleted !== true) {
            const months =
              dur.durationInMonths ||
              (dur.duration ? Math.round(dur.duration / 30) : 1);
            const durationLabel =
              months > 0
                ? `${months} Month${months > 1 ? "s" : ""}`
                : `${dur.duration || 30} Days`;
            const price = parseFloat(dur.totalPayable || dur.price) || 0;
            const taxPercent =
              dur.gst !== undefined ? parseFloat(dur.gst) || 0 : 0;

            options.push({
              id: dur._id || `${plan._id}_${dur.duration}`,
              planId: plan._id,
              durationId: dur._id,
              planName,
              category: plan.category,
              subCategory: plan.subCategory,
              durationDays: dur.duration,
              durationInMonths: months,
              durationLabel,
              price,
              taxPercent,
              totalPayable: dur.totalPayable,
              features: dur.features || plan.features || [],
              label: `${planName} - ${durationLabel} - ₹${Number(price).toLocaleString("en-IN")}`,
            });
          }
        });
      });

      return {
        plans: activePlans,
        options,
      };
    } catch (err) {
      return rejectWithValue(
        err.message || "Network error fetching subscription plans",
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const status = getState().plans.status;
      return status !== "loading" && status !== "succeeded";
    },
  },
);

const initialState = {
  plans: [],
  options: [],
  status: "idle",
  loading: false,
  error: null,
};

const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    clearPlansError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        state.plans = action.payload.plans;
        state.options = action.payload.options;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "Failed to load plans";
      });
  },
});

export const { clearPlansError } = plansSlice.actions;
export default plansSlice.reducer;
