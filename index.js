const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define MongoDB Schema
const tempUserSchema = new mongoose.Schema({
    name: String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'TempProject' }
});
const TempUser = mongoose.model('TempUser', tempUserSchema);

const tempProjectSchema = new mongoose.Schema({
    name: String
});
const TempProject = mongoose.model('TempProject', tempProjectSchema);

// Express Route
app.get('/api/common/get-data/:fileId', async (req, res) => {
    const { fileId } = req.params;

    try {
        let data;
        if (fileId === '0') {
            // Fetch user name only
            data = await TempUser.findOne().select('name');
        } else if (fileId === '1') {
            // Fetch project details with name only
            data = await TempProject.findOne().select('name');
        } else {
            return res.status(400).json({ error: 'Invalid fileId' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Data not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});