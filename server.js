// This is the server side of Print[Are] baby
// I'm making this with pure love 
// I really hope you all like it and find it as useful as I think it is!
// ~Imaad Bin Irshad @ Namma Bengaluru - i[Are] 2024 

// FIRST - IMPORTING ALL LIBRARIES 
const express = require('express'); //Express lib import ("require()fn loads module-express")
const QRCode = require('qrcode'); //QRCode lib import ("require()fn loads QRCode module")
const multer = require('multer'); //Multer import (Storage -> uploads/ Directory)
//const path = require('path'); //Path Module


// SECOND - CREATING AN express app INSTANCE
const app = express(); // express app

// THIRD - SETTING THE PORT FOR SERVER REQUEST FETCHING
const PORT = 3000; // Assigning Port for the server to take in requests from


// FOURTH - MULTER STORAGE CONFIGURATION
//const storage = multer.memoryStorage(); // for temp storage
const storage = multer.diskStorage({ // Configuring how files will store
    destination: function (req, file, cb) { // Storage Destination
        cb(null, 'uploads/'); // Save Directory for uploads
    },
    filename: function (req, file, cb) { // Name of the saved file(s)
        cb(null, file.originalname); // Original name is preserved
    }
});

// FIFTH - MULTER UPLOAD INSTANCE
const upload = multer({ storage: storage }); // Multer instance with specified storage config.

// SIXTH - ROUTING THE GENERATION AND DISPLAY OF QRCode (FOR PORT)
app.get('/', async (req, res) => { //  (GET <-> Print[Are] page access)
    // Here async()fn is used for the asynchronous operation -> QR Generation
    try{
        const url = 'http://localhost:3000/upload'; // The actual URL behind the QRCode (the upload portal)
        const qrCodeImageUrl = await QRCode.toDataURL(url);// Generate QR that leads to the URL, not uploaded but embedded
        
        // Landing Page for the client
        res.send(`
            <h1> Welcome to Print[Are] </h1>
            <p> Scan the QR to begin printing </p>
            <p> Upload the documents for printing </p>
            <img src ="${qrCodeImageUrl}" alt="KEY (next iteration)" />
        `);
    } catch (err) { 
        console.error(err); // Log errors to the console
        res.status(500).send('Internal Server Error'); // Error Response -> Client
    }
});

// SEVENTH - ROUTING THE UPLOAD FILES
app.post('/upload', upload.single('document'), (req, res) => {
    // 'document' is the name given 
    if (!req.file) { // Upload check
        return res.status(400).send('No file uploaded'); // 400 Error if no file uploads
    }
    console.log(req.file); // Log file info (Pricing in next iteration)
    res.send('File uploaded successfully!'); // Success Response
});


// STARTING THE SERVER
app.listen(PORT, () => { // Listen for requests on the 5000 PORT
    console.log('Server is running @ http://localhost:${PORT}'); // Log server run(s)
});