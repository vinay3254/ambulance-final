import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stepper, Step, StepLabel, Box, Typography,
  Card, CardContent, CardActionArea, Grid, Chip, CircularProgress,
  Alert, TextField, FormControlLabel, Checkbox, Divider
} from '@mui/material';
import { LocalTaxi, LocalHospital, Check, Star } from '@mui/icons-material';
import { assignmentsApi, ambulancesApi, hospitalsApi } from '../services/api';

const steps = ['Select Ambulance', 'Select Hospital', 'Confirm Assignment'];

export default function AssignmentWizard({ 
  open, 
  onClose, 
  incident,
  onAssignmentCreated 
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [notes, setNotes] = useState('');
  const [activateGreenCorridor, setActivateGreenCorridor] = useState(false);

  useEffect(() => {
    if (open && incident) {
      loadRecommendations();
    }
  }, [open, incident]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ambResponse, hospResponse] = await Promise.all([
        ambulancesApi.getAvailable(incident.location_lat, incident.location_lng, 15),
        hospitalsApi.getScored(incident.id)
      ]);
      
      setAmbulances(ambResponse.data.ambulances || ambResponse.data || []);
      setHospitals(hospResponse.data.hospitals || hospResponse.data || []);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      submitAssignment();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const submitAssignment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assignmentsApi.create({
        incident_id: incident.id,
        ambulance_id: selectedAmbulance.id,
        hospital_id: selectedHospital.id,
        notes,
        activate_green_corridor: activateGreenCorridor
      });
      
      onAssignmentCreated?.(response.data);
      handleClose();
    } catch (err) {
      setError('Failed to create assignment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedAmbulance(null);
    setSelectedHospital(null);
    setNotes('');
    setActivateGreenCorridor(false);
    setError(null);
    onClose();
  };

  const canProceed = () => {
    if (activeStep === 0) return selectedAmbulance !== null;
    if (activeStep === 1) return selectedHospital !== null;
    return true;
  };

  const renderAmbulanceSelection = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        Select an ambulance for this emergency. Sorted by ETA.
      </Typography>
      
      {ambulances.length === 0 ? (
        <Alert severity="warning">No available ambulances nearby</Alert>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {ambulances.slice(0, 6).map((amb, index) => (
            <Grid item xs={12} sm={6} key={amb.id}>
              <Card 
                variant={selectedAmbulance?.id === amb.id ? 'elevation' : 'outlined'}
                sx={{ 
                  border: selectedAmbulance?.id === amb.id ? '2px solid' : undefined,
                  borderColor: 'primary.main'
                }}
              >
                <CardActionArea onClick={() => setSelectedAmbulance(amb)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          🚑 {amb.call_sign || amb.vehicle_number}
                        </Typography>
                        <Chip 
                          label={amb.type} 
                          size="small" 
                          color={amb.type === 'ALS' ? 'error' : 'default'}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      {index === 0 && (
                        <Chip icon={<Star />} label="Recommended" size="small" color="success" />
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        ETA: <strong>{amb.eta_minutes || Math.round(amb.distance / 500)} min</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distance: {(amb.distance / 1000).toFixed(1)} km
                      </Typography>
                    </Box>
                    
                    {selectedAmbulance?.id === amb.id && (
                      <Check sx={{ position: 'absolute', top: 8, right: 8 }} color="primary" />
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderHospitalSelection = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        Select destination hospital. Sorted by multi-factor score.
      </Typography>
      
      {hospitals.length === 0 ? (
        <Alert severity="warning">No hospitals found</Alert>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {hospitals.slice(0, 6).map((hosp, index) => (
            <Grid item xs={12} sm={6} key={hosp.id}>
              <Card 
                variant={selectedHospital?.id === hosp.id ? 'elevation' : 'outlined'}
                sx={{ 
                  border: selectedHospital?.id === hosp.id ? '2px solid' : undefined,
                  borderColor: 'primary.main'
                }}
              >
                <CardActionArea onClick={() => setSelectedHospital(hosp)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: 200 }}>
                          🏥 {hosp.name}
                        </Typography>
                      </Box>
                      {index === 0 && (
                        <Chip icon={<Star />} label="Best Match" size="small" color="success" />
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Score: <strong>{hosp.total_score?.toFixed(1) || 'N/A'}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Beds: {hosp.available_beds || 0} | ICU: {hosp.icu_beds_available || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ETA: {hosp.eta_minutes || '?'} min
                      </Typography>
                    </Box>
                    
                    {hosp.score_breakdown && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(hosp.score_breakdown).slice(0, 3).map(([key, val]) => (
                          <Chip 
                            key={key} 
                            label={`${key}: ${val.toFixed(1)}`} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: 18 }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderConfirmation = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Review the assignment details before confirming.
      </Alert>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">Incident</Typography>
              <Typography variant="h6">{incident.incident_type}</Typography>
              <Chip label={incident.severity} size="small" color="error" sx={{ mt: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {incident.location_address}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">Ambulance</Typography>
              <Typography variant="h6">🚑 {selectedAmbulance?.call_sign}</Typography>
              <Chip label={selectedAmbulance?.type} size="small" sx={{ mt: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ETA to scene: {selectedAmbulance?.eta_minutes || '?'} min
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">Destination Hospital</Typography>
              <Typography variant="h6">🏥 {selectedHospital?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Score: {selectedHospital?.total_score?.toFixed(1)} | 
                Beds: {selectedHospital?.available_beds} | 
                ICU: {selectedHospital?.icu_beds_available}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <TextField
        fullWidth
        multiline
        rows={2}
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <FormControlLabel
        control={
          <Checkbox 
            checked={activateGreenCorridor} 
            onChange={(e) => setActivateGreenCorridor(e.target.checked)}
            color="success"
          />
        }
        label="🚦 Activate Green Corridor (traffic signal preemption)"
      />
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Create Assignment
        {incident && (
          <Typography variant="subtitle2" color="text.secondary">
            {incident.incident_type} - {incident.severity}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeStep === 0 && renderAmbulanceSelection()}
            {activeStep === 1 && renderHospitalSelection()}
            {activeStep === 2 && renderConfirmation()}
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleBack} disabled={activeStep === 0}>
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          variant="contained" 
          disabled={!canProceed() || loading}
        >
          {activeStep === steps.length - 1 ? 'Create Assignment' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
