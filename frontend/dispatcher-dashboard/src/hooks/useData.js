import { useState, useEffect, useCallback } from 'react';
import { incidentsApi, ambulancesApi, hospitalsApi, analyticsApi } from '../services/api';
import socketService from '../services/socket';

export function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncidents = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await incidentsApi.getAll({ ...filters, limit: 100 });
      setIncidents(response.data.incidents || response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents({ status: 'active' });

    const handleNewIncident = (incident) => {
      setIncidents(prev => [incident, ...prev]);
    };

    const handleIncidentUpdated = (updated) => {
      setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
    };

    socketService.on('incident:created', handleNewIncident);
    socketService.on('incident:updated', handleIncidentUpdated);

    return () => {
      socketService.off('incident:created', handleNewIncident);
      socketService.off('incident:updated', handleIncidentUpdated);
    };
  }, [fetchIncidents]);

  return { incidents, loading, error, refetch: fetchIncidents };
}

export function useAmbulances() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAmbulances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ambulancesApi.getAll({ limit: 200 });
      setAmbulances(response.data.ambulances || response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmbulances();

    const handleLocationUpdate = (data) => {
      setAmbulances(prev => prev.map(a => 
        a.id === data.ambulance_id 
          ? { ...a, latitude: data.latitude, longitude: data.longitude }
          : a
      ));
    };

    const handleStatusUpdate = (data) => {
      setAmbulances(prev => prev.map(a => 
        a.id === data.ambulance_id ? { ...a, status: data.status } : a
      ));
    };

    socketService.on('ambulance:location', handleLocationUpdate);
    socketService.on('ambulance:status', handleStatusUpdate);

    return () => {
      socketService.off('ambulance:location', handleLocationUpdate);
      socketService.off('ambulance:status', handleStatusUpdate);
    };
  }, [fetchAmbulances]);

  return { ambulances, loading, error, refetch: fetchAmbulances };
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await hospitalsApi.getAll({ limit: 100 });
      setHospitals(response.data.hospitals || response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();

    const handleCapacityUpdate = (data) => {
      setHospitals(prev => prev.map(h => 
        h.id === data.hospital_id ? { ...h, ...data } : h
      ));
    };

    socketService.on('hospital:capacity', handleCapacityUpdate);

    return () => {
      socketService.off('hospital:capacity', handleCapacityUpdate);
    };
  }, [fetchHospitals]);

  return { hospitals, loading, error, refetch: fetchHospitals };
}

export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await analyticsApi.getDashboardStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
}
