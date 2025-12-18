import api from './client';

export const getEvents = async () => {
  const { data } = await api.get('/events');
  return data;
};

export const getMyEvents = async () => {
  const { data } = await api.get('/events/mine');
  return data;
};

export const getEvent = async (id) => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

export const createEvent = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const { data } = await api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateEvent = async (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const { data } = await api.put(`/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteEvent = async (id) => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};

export const rsvpJoin = async (id) => {
  const { data } = await api.post(`/events/${id}/rsvp`);
  return data;
};

export const rsvpLeave = async (id) => {
  const { data } = await api.delete(`/events/${id}/rsvp`);
  return data;
};


