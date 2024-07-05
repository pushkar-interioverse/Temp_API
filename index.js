const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

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

// Express Route to get data
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

// Express Route to add new data
app.post('/api/common/add-data', async (req, res) => {
    const { name, projectName } = req.body;

    try {
        // Check if project exists, if not create a new one
        let project = await TempProject.findOne({ name: projectName });
        if (!project) {
            project = new TempProject({ name: projectName });
            await project.save();
        }

        // Create and save new user
        const newUser = new TempUser({ name, project: project._id });
        await newUser.save();

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).json({ error: 'Failed to add data' });
    }
});



// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});