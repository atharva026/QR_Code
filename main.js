import qr from "qr-image";
import fs from "fs";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
let url = "";

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

function getData(req, res, next) {
    console.log(req.body);
    url = req.body["url"];
    next();
}

app.use(getData);

app.get("/", (req, res) => {
    res.render('index', { qrPath: null });
});

app.post("/generate", (req, res) => {
    let qrImg = qr.image(url,{ type: 'png' });
    const imgPath = "public/qr_img.png";
    qrImg.pipe(fs.createWriteStream(imgPath)).on("finish", () => {
        // Append the URL to the file
        fs.appendFile("./urls.txt", url + '\n', (err) => {
            if (err) {
                return res.status(500).send('Failed to save the URL');
            }

            // Send the download link as a response
            res.render('index', { qrPath: '/qr_img.png' })
                // Schedule the deletion of the QR code after 30 seconds
                // setTimeout(() => {
                //     fs.unlink(imgPath, (err) => {
                //         if (err) {
                //             console.error('Failed to delete the QR code:', err);
                //         } else {
                //             console.log('QR code deleted successfully');
                //         }
                //     });
                // }, 30000); // 30000 milliseconds = 30 seconds
        });
    })
    .on('error', (err) => {
        res.status(500).send('Failed to generate the QR code');
    });
});

app.use(express.static(__dirname + "/public"));

app.listen(3000, () => {
    console.log("Running")
});