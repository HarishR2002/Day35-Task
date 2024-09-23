const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create an Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('your_mongodb_connection_string', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Mongoose Models
const Mentor = mongoose.model('Mentor', new mongoose.Schema({
    name: { type: String, required: true },
    expertise: { type: String },
}));

const Student = mongoose.model('Student', new mongoose.Schema({
    name: { type: String, required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
}));

// API to create a Mentor
app.post('/api/mentors', async (req, res) => {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).send(mentor);
});

// API to create a Student
app.post('/api/students', async (req, res) => {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send(student);
});

// API to assign a Student to a Mentor
app.post('/api/students/:studentId/mentor/:mentorId', async (req, res) => {
    const { studentId, mentorId } = req.params;
    const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
    res.send(student);
});

// API to get all Students for a particular Mentor
app.get('/api/mentors/:mentorId/students', async (req, res) => {
    const students = await Student.find({ mentor: req.params.mentorId });
    res.send(students);
});

// API to get the previously assigned Mentor for a particular Student
app.get('/api/students/:studentId/mentor', async (req, res) => {
    const student = await Student.findById(req.params.studentId).populate('mentor');
    res.send(student.mentor);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
