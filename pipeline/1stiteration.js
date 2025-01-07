// This is the server side of Print[Are] baby
// I'm making this with pure love 
// I really hope you all like it and find it as useful as I think it is!
// ~Imaad Bin Irshad @ Namma Bengaluru - i[Are] 2024 

// FIRST - IMPORTING ALL LIBRARIES 
const express = require('express'); //Express lib import ("require()fn loads module-express")
const QRCode = require('qrcode'); //QRCode lib import ("require()fn loads QRCode module") 

// SECOND - CREATING AN express app INSTANCE
const app = express(); // express app

// THIRD - SETTING THE PORT FOR SERVER REQUEST FETCHING
const PORT = 3000; // Assigning Port for the server to take in requests from

// FOURTH - ROUTING THE GENERATION AND DISPLAY OF QRCode (FOR PORT)
app.get('/', async (req, res) => { //  (GET <-> Print[Are] page access)
    // Here async()fn is used for the asynchronous operation -> QR Generation
    try{
        const url = 'http://localhost:3000/upload'; // The actual URL behind the QRCode (the upload portal)
        const qrCodeImageUrl = await QRCode.toDataURL(url); // Generate QR that leads to the URL, not uploaded but embedded
        
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

// STARTING THE SERVER
app.listen(PORT, () => { // Listen for requests on the 5000 PORT
    console.log('Server is running @ http://localhost:${PORT}'); // Log server run(s)
});