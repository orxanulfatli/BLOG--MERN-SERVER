"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = void 0;
const twilio_1 = require("twilio");
const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;
const from = `${process.env.TWILIO_PHONE_NUMBER}`;
const client = new twilio_1.Twilio(accountSid, authToken);
const sendSms = (to, body, txt) => {
    try {
        client.messages
            .create({
            body: `BlogDev ${txt} - ${body}`,
            from,
            to,
        })
            .then(message => console.log(message.sid));
    }
    catch (err) {
        console.log(err);
    }
};
exports.sendSms = sendSms;
