import { useEffect, useState } from 'react';

const EventForm = ({ onSubmit, initialData = {}, submitting }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    capacity: 1,
    image: null,
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...initialData,
      dateTime: initialData.dateTime
        ? new Date(initialData.dateTime).toISOString().slice(0, 16)
        : '',
      capacity: initialData.capacity || 1,
    }));
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      dateTime: new Date(form.dateTime).toISOString(),
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>
      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={3}
        />
      </label>
      <label>
        Date & Time
        <input
          type="datetime-local"
          name="dateTime"
          value={form.dateTime}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Location
        <input name="location" value={form.location} onChange={handleChange} required />
      </label>
      <label>
        Capacity
        <input
          type="number"
          name="capacity"
          value={form.capacity}
          min={1}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Image
        <input type="file" accept="image/*" onChange={handleFile} />
        {initialData.imageUrl && (
          <span className="muted">Current: {initialData.imageUrl}</span>
        )}
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default EventForm;


