// // app.js
// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const { log } = require('console');

// dotenv.config();

// const app = express();
// const PORT =  100;

// mongoose.connect(process.env.MONGODB_URI);


// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//     },
// });

// const User = mongoose.model('User', userSchema);

// const userProgressSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//     },
//     progressbar: {
//         type: Number,
//         default: 0,
//     },
//     currentModule: {
//         type: String,
//         default: '',
//     },
//     currentModuleAssessment: {
//         type: String,
//         default: '',
//     },
//     answers: [{
//         question: String,
//         answer: String,
//     }],
// });

// const UserProgress = mongoose.model('UserProgress', userProgressSchema);

// app.use(express.json());

// app.post('/main/route1', async (req, res) => {
//     try {
//         const { name, email, answers } = req.body;

//         // Calculate progress
//         const questionsAndAnswers = JSON.parse(process.env.QUESTIONS_AND_ANSWERS);

// let correctAnswers = 0;
// for (const { question, answer } of answers) {
//     // Check if the question exists in the questionsAndAnswers object
//     if (questionsAndAnswers.hasOwnProperty(question)) {
//         // Compare the user's answer to the correct answer
//         if (questionsAndAnswers[question] === answer) {
//             correctAnswers++;
//         }
//     } else {
//         // Handle the case where the question is not found in the questionsAndAnswers object
//         console.error(`No answer found for question: ${question}`);
//     }
// }

//         console.log(correctAnswers);
        
//         const totalQuestions = answers.length;
//         console.log(totalQuestions);
//         const percentage = (correctAnswers / totalQuestions) * 100;

//         // Find or create user
//         let user = await User.findOne({ name, email });
//         if (!user) {
//             user = new User({ name, email });
//             await user.save();
//         }

//         // Update user progress
//         const userProgress = new UserProgress({
//             user: user._id,
//             answers,
//             progressbar: percentage,
//             currentModule: 'your_current_module', // Set this based on your logic
//             currentModuleAssessment: 'your_current_assessment', // Set this based on your logic
//         });

//          await userProgress.save();

//          res.json(userProgress.progressbar);
//      } catch (error) {
//          console.error(error);
//          res.status(500).send('Internal Server Error');
//      }
// });




// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });







// Load environment variables
require('dotenv').config();

require('dotenv').config({ path: '.env.example' });

// Load required modules
const express = require('express');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const PORT = 100;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define MongoDB schemas
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    progress: {
        type: Number,
        default: 0,
    },
});

const User = mongoose.model('User', userSchema);

// Middleware to check user's progress
const checkUserProgress = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        // Find user
        const user = await User.findOne({ name, email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check progress
        if (user.progress < 80) {
            return res.status(403).send('You need to score 80% or higher to access this route.');
        }

        // Proceed to next middleware
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// Define main route
app.post('/main/route1', async (req, res) => {
    try {
        const { name, email, answers } = req.body;

        // Calculate progress
        const questionsAndAnswers = JSON.parse(process.env.QUESTIONS_AND_ANSWERS);

        let correctAnswers = 0;
        for (const { question, answer } of answers) {
            if (questionsAndAnswers[question] === answer) {
                correctAnswers++;
            }
        }

        const totalQuestions = answers.length;
        const percentage = (correctAnswers / totalQuestions) * 100;

        // Find or create user
        let user = await User.findOne({ name, email });
        if (!user) {
            user = new User({ name, email });
        }

        // Update user progress
        user.progress = percentage;
        await user.save();

        // Respond with progress
        res.json({ progress: user.progress });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Protected route
// New route for submitting answers
app.post('/submit/answers', checkUserProgress, async (req, res) => {
    try {
        const { name, email, answers } = req.body;

        // Calculate progress
        const questionsAndAnswers = JSON.parse(process.env.Q);

        let correctAnswers = 0;
        for (const { question, answer } of answers) {
            if (questionsAndAnswers[question] === answer) {
                correctAnswers++;
            }
        }

        const totalQuestions = answers.length;
        const percentage = (correctAnswers / totalQuestions) * 100;

        // Find or create user
        let user = await User.findOne({ name, email });
        if (!user) {
            user = new User({ name, email });
        }

        // Update user progress
        user.progress = percentage;
        await user.save();

        // Respond with progress
        res.json({ progress: user.progress });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
