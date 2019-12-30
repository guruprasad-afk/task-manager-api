const mail = require("@sendgrid/mail");

mail.setApiKey(process.env.SEND_GRID_API);

const sendWelcomeEmail = (email, name) => {
  mail.send({
    to: email,
    from: "rishi98kesh7@gmail.com",
    subject: "Welcome To My Node Application",
    text: "Have a fun time " + name + " :)"
  });
};

module.exports = sendWelcomeEmail;
