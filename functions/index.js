// G:\Web Apps\nwu-blood-bank\functions\index.js
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
// Import the entire firebase-admin module to use admin.apps
const admin = require("firebase-admin");
const {getFirestore} = require("firebase-admin/firestore");
const {logger} = require("firebase-functions");

// Initialize Firebase Admin SDK if not already initialized.
// This ensures admin.initializeApp() is called only once.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = getFirestore();

/**
 * Cloud Function (v2) that triggers when a new blood request is created.
 * It finds matching donors and creates email documents in the 'mail' collection
 * for the "Trigger Email" extension to process.
 */
exports.notifyDonorsOnNewRequest = onDocumentCreated(
    "bloodRequests/{requestId}",
    async (event) => {
      const snap = event.data; // DocumentSnapshot
      if (!snap) {
        logger.log("No data associated with the event.");
        return null;
      }
      const newRequest = snap.data();
      const requestId = event.params.requestId;

      logger.log(
          `New blood request created (ID: ${requestId}):`,
          newRequest,
      );

      if (!newRequest || newRequest.status !== "active") {
        logger.log(
            `Request ${requestId} is not active or data is missing. ` +
        "No notifications will be sent.",
        );
        return null;
      }

      const requiredBloodGroup = newRequest.requiredBloodGroup;
      if (!requiredBloodGroup) {
        logger.log(
            `Request ${requestId} does not have a requiredBloodGroup. ` +
        "No notifications will be sent.",
        );
        return null;
      }

      logger.log(
          `Processing request ${requestId} for: ${requiredBloodGroup}`,
      );

      try {
      // 1. Query the 'donors' collection for matching donors
        const donorsRef = db.collection("donors");
        const querySnapshot = await donorsRef
            .where("bloodGroup", "==", requiredBloodGroup)
            .where("isAvailable", "==", true)
            .where("isProfileActive", "==", true)
        // Consider adding: .where("allowEmailNotifications", "==", true)
            .get();

        if (querySnapshot.empty) {
          logger.log( // Line 54 (approx)
              "No matching available/active donors found for blood group " +
          `${requiredBloodGroup}.`,
          );
          return null;
        }

        const matchingDonors = [];
        querySnapshot.forEach((doc) => {
          matchingDonors.push({id: doc.id, ...doc.data()});
        });

        logger.log(
            `Found ${matchingDonors.length} matching donor for ` +
        `${requiredBloodGroup}.`,
        );

        // 2. For each matching donor, create an email document
        const emailPromises = matchingDonors.map(async (donor) => {
          if (!donor.email) {
            logger.log(`Donor ${donor.id} has no email. Skipping.`);
            return null;
          }

          const donorName = donor.fullName || "Donor";
          const patientName = newRequest.patientName || "a patient";
          // Line 81 (approx)
          const hospitalInfo = `${newRequest.hospitalName}` +
          `${newRequest.hospitalLocation ?
            ` (${newRequest.hospitalLocation})` : ""}`;
          const urgencyLabel = newRequest.urgency ?
          newRequest.urgency.charAt(0).toUpperCase() +
          newRequest.urgency.slice(1) :
          "N/A";
          const additionalInfoText = newRequest.additionalInfo ?
          `Additional Information: ${newRequest.additionalInfo}` : "";

          const emailSubject =
          `Urgent Blood Request: ${requiredBloodGroup} Needed - NWU Blood Bank`;

          // Constructing email body carefully to avoid long lines
          let emailHtmlBody = `<p>Dear ${donorName},</p>`;
          emailHtmlBody += "<p>An urgent blood request has been posted that ";
          emailHtmlBody += "matches your blood group ";
          emailHtmlBody += `(<strong>${requiredBloodGroup}</strong>) `;
          emailHtmlBody += `for patient '${patientName}'.</p>`;
          emailHtmlBody += `<p><strong>Hospital:</strong> ${hospitalInfo}</p>`;
          emailHtmlBody +=
          `<p><strong>Units Required:</strong> ${newRequest.unitsRequired}</p>`;
          emailHtmlBody += `<p><strong>Urgency:</strong> ${urgencyLabel}</p>`;
          emailHtmlBody += "<p><strong>Contact Person for Request:</strong> ";
          // Line 119 (approx) - Removed useless escapes
          emailHtmlBody +=
          `${newRequest.contactPerson} (${newRequest.contactNumber})</p>`;
          if (additionalInfoText) {
            emailHtmlBody += `<p>${additionalInfoText}</p>`;
          }
          emailHtmlBody += "<p>If you are available and able to help, ";
          emailHtmlBody += "please consider responding. ";
          emailHtmlBody += "Your donation can save a life.</p>";
          emailHtmlBody += "<p>Thank you for being a part of the ";
          emailHtmlBody += "NWU Blood Bank community.</p>";
          emailHtmlBody += "<p><em>Note: To manage your donor profile or ";
          emailHtmlBody +=
          "availability, please visit the NWU Blood Bank app.</em></p>";

          let emailTextBody = `Dear ${donorName},\n`;
          emailTextBody += "An urgent blood request has been posted that ";
          emailTextBody += `matches your blood group (${requiredBloodGroup}) `;
          emailTextBody += `for patient '${patientName}'.\n`;
          emailTextBody += `Hospital: ${hospitalInfo}\n`;
          emailTextBody += `Units Required: ${newRequest.unitsRequired}\n`;
          emailTextBody += `Urgency: ${urgencyLabel}\n`;
          // Line 140 (approx) - Removed useless escapes
          emailTextBody += "Contact Person for Request: " +
          `${newRequest.contactPerson} (${newRequest.contactNumber})\n`;
          if (additionalInfoText) {
            emailTextBody += `${additionalInfoText}\n`;
          }
          emailTextBody += "If you are available and able to help, " +
          "please consider responding. Your donation can save a life.\n";
          emailTextBody += "Thank you for being a part of the " +
          "NWU Blood Bank community.\n";
          emailTextBody += "Note: To manage your donor profile or " +
          "availability, please visit the NWU Blood Bank app.\n";

          const mailDoc = {
            to: donor.email,
            message: {
              subject: emailSubject,
              html: emailHtmlBody,
              text: emailTextBody,
            },
          };

          try {
            await db.collection("mail").add(mailDoc);
            logger.log(
                `Email document created for donor: ${donor.email}`,
            );
          } catch (emailError) {
            logger.error(
                `Failed to create email document for donor ${donor.email}:`,
                emailError,
            );
          }
          return null;
        });

        await Promise.all(emailPromises);
        logger.log(
            "Finished processing notifications for new blood request.",
        );
        return null;
      } catch (error) {
        logger.error(
            "Error in notifyDonorsOnNewRequest function:",
            error,
        );
        return null;
      }
    },
);
