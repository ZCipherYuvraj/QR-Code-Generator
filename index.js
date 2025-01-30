import inquirer from "inquirer";
import qr from "qr-image";
import fs from "fs";
import nodemailer from "nodemailer";

// Prompt user for the URL or text to generate QR code
inquirer
  .prompt([
    {
      name: "URL",
      message: "Enter the text or URL you want to convert to a QR code:",
    },
  ])
  .then((answers) => {
    const url = answers.URL;
    const qrPath = "qr_image.png";  // Path where QR code image will be saved

    // Generate QR code as a stream
    const qr_svg = qr.image(url);
    const writeStream = fs.createWriteStream(qrPath);
    
    qr_svg.pipe(writeStream);

    writeStream.on("finish", () => {
      console.log("QR code generated and saved as qr_image.png!");

      // Now send the email with the QR code attached
      inquirer
        .prompt([
          {
            name: "email",
            message: "Enter the email address to send the QR code to:",
          },
        ])
        .then((emailAnswers) => {
          const recipientEmail = emailAnswers.email;

          // Set up the email transporter using Gmail (can change to other services)
          const transporter = nodemailer.createTransport({
            service: "gmail",  // Can be changed to another service like Outlook, Yahoo, etc.
            auth: {
              user: "your-email@gmail.com",  // Your email address
              pass: "your-email-password",  // Your email password or app-specific password
            },
          });

          // Define email options
          const mailOptions = {
            from: "your-email@gmail.com", // Sender's email
            to: recipientEmail,           // Recipient's email
            subject: "Your QR Code",      // Subject line
            text: "Here is your QR code image.", // Body text
            attachments: [
              {
                filename: "qr_image.png", // Filename of the attachment
                path: qrPath,             // Path to the QR code image
              },
            ],
          };

          // Send the email with the QR code as an attachment
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("Error sending email: ", error);
            } else {
              console.log("Email sent: " + info.response);
            }

            // Clean up the temporary QR code file after sending
            fs.unlinkSync(qrPath); // Delete the generated QR code file
          });
        })
        .catch((error) => {
          console.error("Error with email input:", error);
        });
    });
  })
  .catch((error) => {
    console.error("Error generating QR code:", error);
  });
