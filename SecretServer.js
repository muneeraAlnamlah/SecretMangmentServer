const express = require('express');
const bodyParser = require('body-parser');
const Vault = require('node-vault');
const cors = require('cors');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000; // Fallback to 3000 if PORT is not defined

const vaultClient = Vault({
    apiVersion: process.env.VAULT_API_VERSION,
    endpoint: process.env.VAULT_ENDPOINT,
    token: process.env.VAULT_TOKEN
});
  

app.use(bodyParser.json());
app.use(cors());



app.use(async (req, res, next) => {

    const path = req.path;
    const method = req.method;
        // Log the request path
        console.log('Request path:',path);
        next();
});

// Function to store token in Vault
async function storeTokenInVault(consumerAddress,Provider,action, token) {
  try {
    await vaultClient.write(`secret/data/${consumerAddress,Provider,action}`, { data: { token } });
    console.log('Token stored in Vault successfully');
  } catch (error) {
    console.error('Error storing token in Vault:', error);
    throw error; // Rethrow to handle it in the calling function
  }
}

// Endpoint to store token
app.post('/api/store-token', async (req, res) => {
  const { consumerAddress,Provider,action, token } = req.body;

  try {
    await storeTokenInVault(consumerAddress,Provider,action,token);
    res.json({ success: true, message: 'Token stored in Vault successfully.' });
  } catch (error) {
    console.error('Error storing token in Vault:', error);
    res.status(500).json({ success: false, error: 'Failed to store the token in Vault.' });
  }
});


// Endpoint to retrieve a stored token
app.get('/api/get-token', async (req, res) => {
    const { Consumeraddress, providerAddress, action } = req.query;
  
    try {
      const result = await vaultClient.read(`secret/data/${Consumeraddress,providerAddress,action}`);
      if (result && result.data && result.data.data) {
        res.json({ success: true, token: result.data.data.token, message: 'Token retrieved successfully.' });
      } else {
        res.status(404).json({ success: false, message: 'Token not found.' });
      }
    } catch (error) {
      console.error('Error retrieving token from Vault:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve the token from Vault.' });
    }
  });
  

// Endpoint to delete a stored token
app.delete('/api/delete-token', async (req, res) => {
    const { Consumeraddress, providerAddress, action } = req.body;
  
    try {
      await vaultClient.delete(`secret/data/${Consumeraddress,providerAddress,action}`);
      res.json({ success: true, message: 'Token deleted successfully.' });
    } catch (error) {
      console.error('Error deleting token from Vault:', error);
      res.status(500).json({ success: false, error: 'Failed to delete the token from Vault.' });
    }
  });
  

app.listen(port, () => {
  console.log(`Server running at port:${port}`);
});
