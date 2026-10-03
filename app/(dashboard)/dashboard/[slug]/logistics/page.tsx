// app/(dashboard)/dashboard/[slug]/logistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  plateNumber: string | null;
  status: string;
}

export default function LogisticsControlPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // React State Drivers para sa Data at Loaders
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form States para sa registration backend mapping
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [plateNumber, setPlateNumber] = useState('');

  // 1. SYSTEM FETCH ENGINE (GET CONNECTION TO BACKEND)
  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stores/${slug}/couriers?slug=${slug}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch fleet.');
      setCouriers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchCouriers();
    }
  }, [slug]);

  // 2. SYSTEM MUTATION DISPATCHER (POST CONNECTION TO REGISTER COURIER)
  const handleRegisterCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      setSubmitting(true);
      setError('');

      const res = await fetch(`/api/stores/${slug}/couriers?slug=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, vehicleType, plateNumber }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      // Refresh list at i-clear ang simple inputs kapag successful ang save transaction
      setName('');
      setPhone('');
      setPlateNumber('');
      fetchCouriers();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Logistics Control</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Manage your localized delivery riders and availability tracking.</p>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* SYSTEM ARCHITECTURE SPLIT LAYER: SIMPLE FORM AND FLEET DISPLAY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: ONBOARDING ENGINE */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '6px', marginBottom: '16px' }}>Register New Courier</h2>
          <form onSubmit={handleRegisterCourier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Rider Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Contact Number *</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Vehicle Type</label>
              <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Tricycle">Tricycle</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Plate Number (Optional)</label>
              <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <button type="submit" disabled={submitting} style={{ backgroundColor: '#E8A33D', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {submitting ? 'Registering...' : 'Add Courier Rider'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ACTIVE FLEET TRACKER TABLE */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '6px', marginBottom: '16px' }}>Active Courier Fleet</h2>
          
          {loading ? (
            <p>Accessing tenant database fleet logs...</p>
          ) : couriers.length === 0 ? (
            <p style={{ color: '#888' }}>No couriers registered for this storefront yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eaeaea', color: '#555' }}>
                  <th style={{ padding: '10px 5px' }}>Name</th>
                  <th style={{ padding: '10px 5px' }}>Contact</th>
                  <th style={{ padding: '10px 5px' }}>Vehicle</th>
                  <th style={{ padding: '10px 5px' }}>Plate</th>
                  <th style={{ padding: '10px 5px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {couriers.map((courier) => (
                  <tr key={courier.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 5px', fontWeight: '500' }}>{courier.name}</td>
                    <td style={{ padding: '10px 5px' }}>{courier.phone}</td>
                    <td style={{ padding: '10px 5px' }}>{courier.vehicleType}</td>
                    <td style={{ padding: '10px 5px', color: courier.plateNumber ? '#000' : '#aaa' }}>{courier.plateNumber || 'N/A'}</td>
                    <td style={{ padding: '10px 5px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: courier.status === 'available' ? '#dcfce7' : '#fee2e2', color: courier.status === 'available' ? '#166534' : '#991b1b' }}>
                        {courier.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
