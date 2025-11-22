import { useEffect, useState } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [itemsError, setItemsError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'LOST',
    location: '',
    contactName: '',
    contactPhone: '',
  });

  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL | LOST | FOUND

  //  Load items from backend

  const loadItems = () => {
    fetch('http://localhost:8080/api/items')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        return response.json();
      })
      .then((data) => {
        setItems(data);
        setItemsError('');
      })
      .catch((err) => {
        console.error(err);
        setItemsError('Could not load items. Check if backend is running.');
      });
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Form handling

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitMessage('');
    setSubmitError('');

    // Simple required checks on frontend
    if (!formData.title || !formData.contactName || !formData.contactPhone) {
      setSubmitError('Please fill in Title, Contact Name and Contact Phone.');
      return;
    }

    fetch('http://localhost:8080/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams(formData).toString(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSubmitMessage('Item reported successfully.');
          setSubmitError('');
          // Clear form
          setFormData({
            title: '',
            description: '',
            type: 'LOST',
            location: '',
            contactName: '',
            contactPhone: '',
          });
          // Reload items list
          loadItems();
        } else {
          setSubmitError(data.message || 'Failed to save item.');
        }
      })
      .catch((err) => {
        console.error(err);
        setSubmitError('Error sending data. Check backend.');
      });
  };

  // Mark item as claimed

  const markAsClaimed = (id) => {
    if (!window.confirm('Mark this item as claimed?')) {
      return;
    }

    fetch('http://localhost:8080/api/items/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({ id: String(id) }).toString(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadItems();
        } else {
          alert(data.message || 'Failed to update item.');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Error talking to backend.');
      });
  };

  // Filtering

  const filteredItems = items.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  // UI 

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '2rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          maxWidth: '1100px',
          width: '100%',
        }}
      >
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.8rem', textAlign: 'center' }}>
          Lost &amp; Found Portal
        </h1>
        <p
          style={{
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            color: '#555',
            textAlign: 'center',
          }}
        >
          Report lost or found items on campus.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
            gap: '2rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Form */}
          <section>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>
              Report Lost or Found Item
            </h2>

            {submitMessage && (
              <p style={{ color: '#065f46', fontWeight: 500, marginBottom: '0.5rem' }}>
                {submitMessage}
              </p>
            )}
            {submitError && (
              <p style={{ color: '#b91c1c', fontWeight: 500, marginBottom: '0.5rem' }}>
                {submitError}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                  }}
                >
                  <option value="LOST">Lost Item</option>
                  <option value="FOUND">Found Item</option>
                </select>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontStyle: 'italic',
                    color: '#6b7280',
                    marginTop: '0.2rem',
                  }}
                >
                  (where item was lost, last seen or found)
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Contact Phone *
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Submit
              </button>
            </form>
          </section>

          {/* Items list */}
          <section>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Recent Items</h2>
                  <p
          style={{
            marginBottom: '0.75rem',
            fontSize: '0.85rem',
            color: '#6b7280',
          }}
        >
          Showing the latest 50 reported items.
        </p>

            {itemsError && (
              <p style={{ color: '#b91c1c', fontWeight: 500 }}>{itemsError}</p>
            )}

            {/* Filter buttons */}
            <div
              style={{
                marginBottom: '0.75rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '999px',
                  border:
                    filterType === 'ALL' ? '2px solid #2563eb' : '1px solid #d1d5db',
                  backgroundColor: filterType === 'ALL' ? '#2563eb' : 'white',
                  color: filterType === 'ALL' ? 'white' : '#111827',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('LOST')}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '999px',
                  border:
                    filterType === 'LOST' ? '2px solid #b91c1c' : '1px solid #d1d5db',
                  backgroundColor: filterType === 'LOST' ? '#b91c1c' : 'white',
                  color: filterType === 'LOST' ? 'white' : '#111827',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Lost
              </button>
              <button
                type="button"
                onClick={() => setFilterType('FOUND')}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '999px',
                  border:
                    filterType === 'FOUND' ? '2px solid #065f46' : '1px solid #d1d5db',
                  backgroundColor: filterType === 'FOUND' ? '#065f46' : 'white',
                  color: filterType === 'FOUND' ? 'white' : '#111827',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Found
              </button>
            </div>

            {filteredItems.length === 0 && !itemsError ? (
              <p style={{ color: '#555' }}>No items match this filter.</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                }}
              >
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      padding: '0.9rem',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: item.type === 'LOST' ? '#b91c1c' : '#065f46',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {item.type === 'LOST' ? 'LOST ITEM' : 'FOUND ITEM'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        marginBottom: '0.4rem',
                        color:
                          item.status === 'CLAIMED' ? '#4b5563' : '#047857',
                        fontWeight: 500,
                      }}
                    >
                      Status: {item.status || 'OPEN'}
                    </div>
                    <h3 style={{ marginBottom: '0.4rem', fontSize: '1.05rem' }}>
                      {item.title}
                    </h3>
                    <p
                      style={{
                        marginBottom: '0.4rem',
                        fontSize: '0.9rem',
                        color: '#444',
                      }}
                    >
                      {item.description}
                    </p>
                    <p
                      style={{
                        marginBottom: '0.25rem',
                        fontSize: '0.85rem',
                        color: '#555',
                      }}
                    >
                      <strong>Location:</strong> {item.location}
                    </p>
                    <p
                      style={{
                        marginBottom: '0.25rem',
                        fontSize: '0.85rem',
                        color: '#555',
                      }}
                    >
                      <strong>Contact:</strong> {item.contactName}
                    </p>
                    <p
                      style={{
                        marginBottom: '0.25rem',
                        fontSize: '0.85rem',
                        color: '#555',
                      }}
                    >
                      <strong>Phone:</strong> {item.contactPhone}
                    </p>
                    {item.dateReported && (
                      <p
                        style={{
                          marginTop: '0.2rem',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                        }}
                      >
                        Reported: {item.dateReported}
                      </p>
                    )}

                    {item.status !== 'CLAIMED' && (
                      <button
                        type="button"
                        onClick={() => markAsClaimed(item.id)}
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.35rem 0.9rem',
                          borderRadius: '999px',
                          border: 'none',
                          backgroundColor: '#10b981',
                          color: 'white',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Mark as claimed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;