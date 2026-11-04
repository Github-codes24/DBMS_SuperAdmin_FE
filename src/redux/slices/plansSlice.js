import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const getPlansBaseUrl = () => {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_WEBSITE_API_BASE_URL ||
    import.meta.env.VITE_SUBSCRIPTION_API_BASE_URL ||
    "http://localhost:5000"
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
          resData.message || "Failed to fetch subscription plans"
        );
      }

      let rawPlans = [];
      if (Array.isArray(resData.data)) {
        rawPlans = resData.data;
      } else if (Array.isArray(resData)) {
        rawPlans = resData;
      }

      // Filter only active / non-deleted plans
      const activePlans = rawPlans.filter(
        (p) =>
          p &&
          p.isActive !== false &&
          p.isDelete !== true &&
          p.isDeleted !== true &&
          p.status !== "Inactive"
      );

      // Order priority: Membership / Prime first, then Silver, Gold, Diamond
      const planOrder = ["prime", "onboarding", "silver", "gold", "diamond"];
      const sortedPlans = [...activePlans].sort((a, b) => {
        const keyA = (a.subCategory || a.category || a.name || "").toLowerCase();
        const keyB = (b.subCategory || b.category || b.name || "").toLowerCase();
        const idxA = planOrder.findIndex((k) => keyA.includes(k));
        const idxB = planOrder.findIndex((k) => keyB.includes(k));
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });

      // Convert all plans and their durations into the exact 10 selectable options
      const options = sortedPlans.flatMap((plan) => {
        const isMembership =
          (plan.subCategory || "").toLowerCase() === "prime" ||
          (plan.category || "").toLowerCase() === "onboarding" ||
          (plan.name || "").toLowerCase().includes("prime") ||
          (plan.name || "").toLowerCase().includes("membership") ||
          (plan.name || "").toLowerCase().includes("starter");

        // Format plan name
        const cleanSubCategory = (plan.subCategory || "").trim();
        const planName = isMembership
          ? "Membership"
          : cleanSubCategory
          ? `LTS ${cleanSubCategory}`
          : plan.name || "LTS Plan";

        // Case 1: Plan has duration tiers (Live synced plans)
        if (Array.isArray(plan.durations) && plan.durations.length > 0) {
          // Sort durations ascending by month/duration
          const sortedDurations = [...plan.durations].sort((a, b) => {
            const mA = Number(a.durationInMonths) || (Number(a.duration) >= 300 ? 12 : Number(a.duration) >= 150 ? 6 : 1);
            const mB = Number(b.durationInMonths) || (Number(b.duration) >= 300 ? 12 : Number(b.duration) >= 150 ? 6 : 1);
            return mA - mB;
          });

          return sortedDurations.map((d) => {
            const months =
              Number(d.durationInMonths) ||
              (Number(d.duration) >= 300 ? 12 : Number(d.duration) >= 150 ? 6 : 1);
            const price = Number(d.price) || Number(d.totalPayable) || 0;
            const durationDays = Number(d.duration) || months * 30;

            const durationLabel = isMembership
              ? "1 Year"
              : `${months} month`;

            const optionLabel = isMembership
              ? `Membership ${price}`
              : `${planName} ${months} month ${price}`;

            const optionId = `${plan._id || plan.id}-${d._id || months}`;

            return {
              id: optionId,
              planId: plan._id || plan.id || plan.planId,
              durationId: d._id || optionId,
              planName,
              category: plan.category,
              subCategory: plan.subCategory,
              durationDays,
              durationInMonths: months,
              durationLabel,
              price,
              taxPercent: Number(d.gst) || 0,
              totalPayable: Number(d.totalPayable) || price,
              features: Array.isArray(d.features) && d.features.length > 0 ? d.features : (plan.features || []),
              label: optionLabel,
            };
          });
        }

        // Case 2: Flat plan without durations array
        const months = Number(plan.durationInMonths) || 1;
        const price = Number(plan.finalAmount ?? plan.price) || 0;
        const durationLabel = isMembership ? "1 Year" : `${months} month`;
        const optionLabel = isMembership ? `Membership ${price}` : `${planName} ${months} month ${price}`;

        return [
          {
            id: plan._id || plan.id || plan.planId,
            planId: plan._id || plan.id || plan.planId,
            durationId: plan.planId || plan._id,
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
            label: optionLabel,
          },
        ];
      });

      return {
        plans: activePlans,
        options,
      };
    } catch (err) {
      return rejectWithValue(
        err.message || "Network error fetching subscription plans"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const status = getState().plans.status;
      return status !== "loading" && status !== "succeeded";
    },
  }
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
    resetPlansStatus: (state) => {
      state.status = "idle";
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

export const { clearPlansError, resetPlansStatus } = plansSlice.actions;
export default plansSlice.reducer;
