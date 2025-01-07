// This is the server side of Print[Are] baby
// I'm making this with pure love 
// I really hope you all like it and find it as useful as I think it is!
// ~Imaad Bin Irshad @ Namma Bengaluru - i[Are] 2024 

// FIRST - IMPORTING ALL LIBRARIES 
const express = require('express'); //Express lib import
const QRCode = require('qrcode'); //QRCode lib import
const multer = require('multer'); //Multer for file uploads
const path = require('path'); //Path module to handle file paths
const session = require('express-session'); //Express Session

// SECOND - CREATING AN express app INSTANCE
const app = express();

// THIRD - SETTING THE PORT FOR SERVER REQUEST FETCHING
const PORT = 3000; // Assigning Port for the server to take in requests from

//MIDDLEWARE FOR LOCKING SESSION
app.use(session({
    secret: 'printare_secret_key', //Session id key?
    resave: false, //Prevents resaving 
    saveUninitialized: true, //Saves new sessions
    cookie: { maxAge: 180000 } //60,000 milliseconds = 1 minute - Server Lock
}));

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Original name is preserved
    }
});

const upload = multer({ storage: storage });

// FOURTH - LANDING PAGE (SHOW QR CODE)
app.get('/', async (req, res) => {
    console.log("Session data on '/' route:", req.session);
    if(!req.session.qrScanned){ // QR only visible when no session is active
        try {
            const url = 'https://f236-103-210-134-113.ngrok-free.app/upload'; // URL for file upload
            const qrCodeImageUrl = await QRCode.toDataURL(url); // Generate QR code
        
        // Show only the QR code on the landing page
            res.send(`
                <h1> Welcome to Print[Are] </h1>
                <p> Scan the QR to begin printing </p>
                <img src="${qrCodeImageUrl}" alt="Scan this QR" />
        `);
    }   catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
    }
}
});

// FIFTH - FILE UPLOAD PAGE (ONLY ACCESSED VIA QR CODE)
app.get('/upload', (req, res) => {
    // Serve an upload form to mobile users
    res.send(`
        <h1> Upload your document </h1>
        <form ref="uploadForm" 
          id="uploadForm" 
          action="/upload" 
          method="post" 
          encType="multipart/form-data">
            <input type="file" name="document" />
            <input type="submit" value="Upload" />
        </form>
    `);
});

// SIXTH - HANDLE FILE UPLOADS
app.post('/upload', upload.single('document'), (req, res) => {
    if (!req.session.qrScanned) {
        req.session.qrScanned = true; // Lock the session once the QR is scanned
        console.log("Session started: qrScanned is set to true");
    }
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }   
    console.log(req.file);
    res.send('File uploaded successfully!');
});

// STARTING THE SERVER
app.listen(PORT, () => {
    console.log(`Server is running @ http://localhost:${PORT}`);
});

//  NO MONGOOSE, OR SERVER LOCKING YET TO BE INTEGRATED!!
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠛⠛⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⣿⣿⣿⡿⠋⣠⣶⣿⣿⣿⣷⣄⠙⢿⣿⣿⣿⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠈⠿⡿⠁⣀⣄⡉⠻⣿⣿⠟⠉⢀⣉⠻⠟⠁⠀⣨⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⡄⠀⠀⢀⠀⣀⠀⢀⡃⠀⠀⢀⠀⠱⢠⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⢠⣶⣤⡤⠤⢶⣿⣿⣦⣤⣄⣤⣮⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠘⠛⠋⣀⣀⠈⠛⢛⣋⣩⣌⠻⠿⠆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠀⠿⠠⣄⡙⠿⢿⣿⣿⣿⣿⠿⢷⣄⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃⢀⣶⢸⣿⣿⣤⣤⣤⣴⣶⣶⣿⣿⣿⣆⡘⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⢠⣿⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣼⣿⣷⣮⣕⣈⣛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁⠀⠀⠀⠙⠃⣤⡙⠛⠻⢿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣮⣟⢿⣿⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⣿⣿⡿⠟⣋⣍⣩⣤⣄⠀⢀⣤⣶⣶⣄⣈⠙⠂⣀⣀⣭⣥⣴⣶⣾⢡⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡙⣿⣿⣿⣿
//⣿⣿⣿⣿⣿⡿⠁⣤⣾⣿⣿⣿⣿⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣛⣭⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡜⣿⣿⣿
//⣿⣿⣿⣿⠏⢀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠮⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢸⣿⣿
//⣿⣿⣿⠏⠀⠾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠘⢻⣿⣿⣿⣿⣿⣿⡌⢿⣿
//⣿⣿⣿⠀⢁⡀⠿⡿⠿⠙⠁⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢏⠔⠀⢀⣣⣄⣉⣿⣿⣿⣿⣿⡌⣿
//⣿⣿⡿⠀⠘⢁⠀⠀⠀⠀⠀⢈⠉⠛⢿⣿⣿⣿⣿⣿⣿⣿⡿⢋⡀⠀⠘⣿⢿⣿⡿⠿⠿⡭⠛⠉⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸
//⣿⣿⢁⣾⣦⠀⢷⣶⣦⠀⠀⠈⠓⢤⡀⠉⠉⠋⠉⠉⠉⠛⠛⣛⣁⠀⠀⠀⢀⣀⠀⣀⡀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸
//⣿⠇⣼⣿⣿⡇⣼⣿⣿⡇⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⣠⢶⣿⣿⣿⣷⣦⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸
//⣿⠀⣿⣿⡿⢰⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣶⣾⣿⣿⣿⣿⣿⣶⣟⣀⣠⣄⣠⣴⣶⡀⠀⠙⢿⡏⢿⣿⣿⣿⣿⣿⣿⣾
//⡿⠀⢹⡿⢁⣿⣿⣿⣿⠁⣰⡀⠀⠀⠀⠐⠦⡈⢻⣿⣿⣿⣿⣿⡇⢻⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠀⠄⡀⠈⠿⠈⠻⣿⣿⣿⣿⡇⣿
//⡇⣼⣟⠃⣼⣿⣿⠟⠁⢠⣿⣷⡀⠀⢀⣀⠀⠀⢀⣀⣀⣀⣈⠻⣷⣀⣤⣄⣉⡉⠻⠿⠿⢟⣷⡤⢀⣼⣷⡀⠀⠀⢀⣿⣿⣿⣿⣿⢿
//⣠⣿⣿⡄⠉⠉⠁⠀⢠⣾⣿⣿⡇⠀⡺⣿⣷⠀⢸⣿⣿⣿⣿⣿⠈⣽⣿⣿⣿⣿⣯⣴⣶⣶⣿⡇⣾⣿⣿⣿⡄⠀⣤⣿⣿⣿⣿⡿⣸
//⣿⣿⣿⣿⣆⠀⠀⣴⣿⣿⣿⣿⡇⠘⣿⣏⢿⡇⠈⠛⠛⢻⣿⣿⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢹⣿⣿⣿⣿⢁⣿⣿⣿⣿⣿⣿⡃⢸
//⣿⣿⣿⣿⣿⣦⡄⣻⣿⣿⣿⣿⠀⣶⣿⣿⣷⣬⡐⢶⣶⣶⡎⠉⣰⣦⣤⣥⣾⣿⣿⣿⣿⣿⠃⣸⣿⣿⣿⡿⢸⣿⣿⣿⣿⣿⣿⣿⢸
//⣿⣿⣿⣿⣿⣿⣄⣻⣿⣿⣿⡿⠀⣿⡟⢻⣿⣿⣿⠾⣾⢿⣿⡟⣿⣿⣿⣿⣿⣿⣿⣿⡿⠯⢠⣿⣿⣿⣿⡇⢸⣿⣿⣿⣿⣿⣿⡟⢸