import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Tab, Tabs, Chip,
  Drawer, IconButton, Divider, AppBar, Toolbar, Badge, Avatar
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications, Refresh, Add,
  FilterList, FullscreenExit, Fullscreen
} from '@mui/icons-material';

import DispatchMap from '../components/DispatchMap';
import IncidentQueue from '../components/IncidentQueue';
import StatsCards from '../components/StatsCards';
import AssignmentWizard from '../components/AssignmentWizard';
import { useIncidents, useAmbulances, useHospitals, useDashboardStats } from '../hooks/useData';
import socketService from '../services/socket';
import { incidentsApi } from '../services/api';

const DRAWER_WIDTH = 380;

export default function DashboardPage() {
  const { incidents, loading: incidentsLoading, refetch: refetchIncidents } = useIncidents();
  const { ambulances, loading: ambulancesLoading, refetch: refetchAmbulances } = useAmbulances();
  const { hospitals, loading: hospitalsLoading } = useHospitals();
  const { stats } = useDashboardStats();

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      socketService.connect(token);
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
    if (incident && ['PENDING', 'ACKNOWLEDGED'].includes(incident.status)) {
      // Auto-open wizard for unassigned incidents
    }
  };

  const handleAcknowledge = async () => {
    if (!selectedIncident) return;
    try {
      await incidentsApi.acknowledge(selectedIncident.id);
      refetchIncidents();
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  };

  const handleAssign = () => {
    setWizardOpen(true);
  };

  const handleAssignmentCreated = (assignment) => {
    refetchIncidents();
    refetchAmbulances();
    setSelectedIncident(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const activeCount = incidents.filter(i => !['RESOLVED', 'CANCELLED'].includes(i.status)).length;
  const pendingCount = incidents.filter(i => i.status === 'PENDING').length;

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(!drawerOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            🚑 Ambulance Dispatch Command Center
          </Typography>
          
          <IconButton color="inherit" onClick={() => { refetchIncidents(); refetchAmbulances(); }}>
            <Refresh />
          </IconButton>
          
          <IconButton color="inherit">
            <Badge badgeContent={pendingCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton color="inherit" onClick={toggleFullscreen}>
            {fullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          
          <Avatar sx={{ ml: 2, bgcolor: 'secondary.main' }}>D</Avatar>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: 64,
            height: 'calc(100% - 64px)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Incidents
              <Chip label={activeCount} size="small" color="error" sx={{ ml: 1 }} />
            </Typography>
            <IconButton size="small">
              <FilterList />
            </IconButton>
          </Box>
          
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 1 }}>
            <Tab label="Active" />
            <Tab label="Pending" />
            <Tab label="All" />
          </Tabs>
        </Box>
        
        <Divider />
        
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          <IncidentQueue
            incidents={incidents}
            onSelect={handleIncidentSelect}
            selectedId={selectedIncident?.id}
            filter={['active', 'pending', 'all'][tabValue]}
          />
        </Box>
        
        {/* Selected Incident Actions */}
        {selectedIncident && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              {selectedIncident.incident_type} - {selectedIncident.severity}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedIncident.status === 'PENDING' && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleAcknowledge}
                >
                  Acknowledge
                </Button>
              )}
              {['PENDING', 'ACKNOWLEDGED'].includes(selectedIncident.status) && (
                <Button 
                  variant="contained" 
                  size="small" 
                  color="success"
                  onClick={handleAssign}
                  startIcon={<Add />}
                >
                  Assign
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: 8,
          ml: drawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
          transition: 'margin 0.2s'
        }}
      >
        {/* Stats Row */}
        <StatsCards
          stats={stats}
          incidents={incidents}
          ambulances={ambulances}
          hospitals={hospitals}
        />
        
        {/* Map */}
        <Paper sx={{ mt: 2, height: 'calc(100vh - 220px)', overflow: 'hidden' }}>
          <DispatchMap
            incidents={incidents.filter(i => !['RESOLVED', 'CANCELLED'].includes(i.status))}
            ambulances={ambulances}
            hospitals={hospitals}
            selectedIncident={selectedIncident}
            onIncidentClick={handleIncidentSelect}
            onAmbulanceClick={(amb) => console.log('Ambulance clicked:', amb)}
            onHospitalClick={(hosp) => console.log('Hospital clicked:', hosp)}
          />
        </Paper>
      </Box>

      {/* Assignment Wizard */}
      <AssignmentWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        incident={selectedIncident}
        onAssignmentCreated={handleAssignmentCreated}
      />
    </Box>
  );
}
