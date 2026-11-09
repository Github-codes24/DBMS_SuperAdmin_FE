import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// 1. Async Thunk: Fetch Tickets List (API 35)
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1 } = filterParams;
      const response = await api.get('/tickets', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch support tickets.';
      return rejectWithValue(message);
    }
  }
);

// 2. Async Thunk: Fetch Ticket Detail With Thread (API 36)
export const fetchTicketDetail = createAsyncThunk(
  'tickets/fetchTicketDetail',
  async (ticketId, { rejectWithValue }) => {
    try {
      // Must use ticketId (e.g. TKT-8021) as documented
      const response = await api.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch ticket details.';
      return rejectWithValue(message);
    }
  }
);

// 3. Async Thunk: Raise Support Ticket (API 37)
export const createSupportTicket = createAsyncThunk(
  'tickets/createSupportTicket',
  async ({ category, subject, description, priority }, { rejectWithValue }) => {
    try {
      // Send ONLY category, subject, description, priority
      const response = await api.post('/tickets', {
        category,
        subject,
        description,
        priority
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to create support ticket.';
      return rejectWithValue(message);
    }
  }
);

// 4. Async Thunk: Reply to Ticket (API 38)
export const replyToTicket = createAsyncThunk(
  'tickets/replyToTicket',
  async ({ ticketId, message }, { rejectWithValue }) => {
    try {
      // Must use ticketId in URL and send only message body
      const response = await api.post(`/tickets/${ticketId}/replies`, {
        message
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to send reply to ticket.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  tickets: [],
  currentTicket: null,
  page: 1,
  pages: 1,
  totalTickets: 0,
  loading: false,
  detailLoading: false,
  creating: false,
  replying: false,
  error: null,
  successMessage: null
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearTicketsError: (state) => {
      state.error = null;
    },
    clearTicketsSuccess: (state) => {
      state.successMessage = null;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    }
  },
  extraReducers: (builder) => {
    // 1. fetchTickets (API 35)
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = Array.isArray(action.payload?.tickets)
          ? action.payload.tickets
          : [];
        state.page = Number(action.payload?.page) || 1;
        state.pages = Number(action.payload?.pages) || 1;
        state.totalTickets = Number(action.payload?.totalTickets) || 0;
        state.error = null;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tickets';
      });

    // 2. fetchTicketDetail (API 36)
    builder
      .addCase(fetchTicketDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchTicketDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentTicket = action.payload;
        state.error = null;
      })
      .addCase(fetchTicketDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to fetch ticket detail';
      });

    // 3. createSupportTicket (API 37)
    builder
      .addCase(createSupportTicket.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSupportTicket.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.tickets = [action.payload, ...state.tickets];
          state.totalTickets += 1;
        }
        state.successMessage = `Support Ticket ${action.payload?.ticketId || ''} created successfully!`;
        state.error = null;
      })
      .addCase(createSupportTicket.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Failed to create support ticket';
      });

    // 4. replyToTicket (API 38)
    builder
      .addCase(replyToTicket.pending, (state) => {
        state.replying = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(replyToTicket.fulfilled, (state, action) => {
        state.replying = false;
        state.currentTicket = action.payload;
        state.successMessage = 'Reply submitted successfully!';
        // Also update matching ticket in tickets list if status/replies changed
        if (action.payload?.ticketId) {
          const index = state.tickets.findIndex(
            (t) => t.ticketId === action.payload.ticketId
          );
          if (index !== -1) {
            state.tickets[index] = {
              ...state.tickets[index],
              ...action.payload
            };
          }
        }
        state.error = null;
      })
      .addCase(replyToTicket.rejected, (state, action) => {
        state.replying = false;
        state.error = action.payload || 'Failed to submit reply';
      });
  }
});

export const {
  clearTicketsError,
  clearTicketsSuccess,
  clearCurrentTicket
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
