// server.js - Node.js backend for Employee Database
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure Supabase client
const supabaseUrl = 'https://igfcuqyaaevrbyzvdeys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZmN1cXlhYWV2cmJ5enZkZXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0OTIwNDAsImV4cCI6MjA2MjA2ODA0MH0.kJfjEi7b4nws3sZPayhr1EPAmANM7ks3jHevnYTA8sE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));  // Ensure the static files are served correctly

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for employee registration
app.post('/api/register', async (req, res) => {
  try {
    const { id, Emp_name, salary, PF, DATE_OF_JOINING, MOBILE_NO, password } = req.body;
    
    // Check if employee ID already exists
    const { data: existingEmployee } = await supabase
      .from('EMPLOYEE')
      .select('id')
      .eq('id', id)
      .single();  // Ensuring only a single result is returned
    
    if (existingEmployee) {
      return res.status(400).json({ success: false, message: 'Employee ID already exists.' });
    }

    // Insert new employee into database
    const { data, error } = await supabase
      .from('EMPLOYEE')
      .insert([
        { 
          id, 
          Emp_name, 
          salary, 
          PF, 
          DATE_OF_JOINING, 
          MOBILE_NO, 
          password 
        }
      ]);
    
    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to register employee.', error: error.message });
    }

    // Successful registration
    return res.status(200).json({ success: true, message: 'Employee registered successfully!', data: data });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred during registration.', error: error.message });
  }
});

// API endpoint for employee verification
app.post('/api/verify', async (req, res) => {
  try {
    const { id, password } = req.body;

    // Check if employee exists
    const { data: employee, error } = await supabase
      .from('EMPLOYEE')
      .select('*')
      .eq('id', id)
      .eq('password', password)
      .single();  // Ensuring single result
    
    if (error || !employee) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or employee not found.' });
    }

    // Successful verification
    return res.status(200).json({ success: true, message: 'Verification successful!', employee: employee });
  } catch (error) {
    console.error('Error during verification:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred during verification.', error: error.message });
  }
});

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
