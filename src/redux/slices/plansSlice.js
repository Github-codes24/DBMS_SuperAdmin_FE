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
      console.log(
        "API Plan Names:",
        activePlans.map((p) => p.name),
      );

      const selectedPlans = activePlans.filter((plan) => {
        const name = (plan.name || "").toLowerCase();

        return (
          name.includes("starter") ||
          name.includes("silver") ||
          name.includes("gold") ||
          name.includes("platinum")
        );
      });

      // Flatten plans into selectable (plan, duration) option items

      // Convert API plans into selectable options

      const options = selectedPlans.flatMap((plan) => {
        const planName = plan.name || "Subscription Plan";
        if (planName.toLowerCase().includes("starter")) {
          const price = Number(plan.finalAmount ?? plan.price) || 0;

          return [
            {
              id: plan._id || plan.id || plan.planId,
              planId: plan._id || plan.id || plan.planId,
              durationId: plan.planId,
              planName,
              category: plan.category,
              subCategory: plan.subCategory,
              durationDays: 0,
              durationInMonths: 0,
              durationLabel: "One Time",
              price,
              taxPercent: 0,
              totalPayable: price,
              features: plan.features || [],
              label: `${planName} - ₹${price.toLocaleString("en-IN")}`,
            },
          ];
        }

        // Membership ka sirf ek option
        if (planName.toLowerCase().includes("membership")) {
          const price = Number(plan.finalAmount ?? plan.price) || 0;

          return [
            {
              id: plan._id || plan.id || plan.planId,
              planId: plan._id || plan.id || plan.planId,
              durationId: plan.planId,
              planName,
              category: plan.category,
              subCategory: plan.subCategory,
              durationDays: 0,
              durationInMonths: 0,
              durationLabel: plan.duration || "One Time",
              price,
              taxPercent: 0,
              totalPayable: price,
              features: plan.features || [],
              label: `${planName} - ₹${price.toLocaleString("en-IN")}`,
            },
          ];
        }

        // Silver, Gold, Diamond ke duration options
        const durations = [1, 6, 12];
        const originalMonths = Number(plan.durationInMonths) || 1;
        const originalPrice = Number(plan.finalAmount ?? plan.price) || 0;

        return durations.map((months) => {
          const price =
            months === originalMonths
              ? originalPrice
              : (originalPrice * months) / originalMonths;

          const durationLabel = `${months} Month${months > 1 ? "s" : ""}`;

          return {
            id: `${plan._id || plan.id || plan.planId}-${months}`,
            planId: plan._id || plan.id || plan.planId,
            durationId: plan.planId,
            planName,
            category: plan.category,
            subCategory: plan.subCategory,
            durationDays: months * 30,
            durationInMonths: months,
            durationLabel,
            price,
            taxPercent: 0,
            totalPayable: price,
            features: plan.features || [],
            label: `${planName} - ${durationLabel} - ₹${Math.round(price).toLocaleString("en-IN")}`,
          };
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
