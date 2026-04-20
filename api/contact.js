import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { prenom, nom, email, sujet, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: "ssl0.ovh.net",
    port: 465,
    secure: true,
    auth: {
      user: "laure.marchand@studio-utopia.fr",
      pass: "Sophiaetnoah1234"
    }
  });

  try {
    await transporter.sendMail({
      from: `"Site Web" <laure.marchand@studio-utopia.fr>`,
      to: "laure.marchand@studio-utopia.fr",
      replyTo: email,
      subject: sujet || "Nouveau message site",
      text: `
Nom: ${prenom} ${nom}
Email: ${email}

Message:
${message}
      `
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
