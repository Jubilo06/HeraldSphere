import SibApiV3Sdk from "sib-api-v3-sdk";

export const handleContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Initialize Brevo
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendEmail = {
    sender: {
      name: "Herald Sphere Contact System",
      email: process.env.SENDER_EMAIL,
    },
    to: [{ email: process.env.SENDER_EMAIL }], // Send TO yourself
    replyTo: { email: email, name: name }, // So you can click "Reply" in your email
    subject: `[CONTACT FORM] ${subject}`,
    htmlContent: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #4f46e5;">New Message from Herald Sphere</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
  };

  try {
    await apiInstance.sendTransacEmail(sendEmail);
    res.status(200).json({ message: "Transmission received successfully." });
  } catch (error) {
    console.error("Brevo Contact Error:", error);
    res
      .status(500)
      .json({ message: "Failed to send message. Please try again later." });
  }
};

const contactController = {
  handleContactForm,
};
export default contactController