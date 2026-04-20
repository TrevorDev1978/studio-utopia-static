import nodemailer from "nodemailer";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function clean(value) {
  return String(value || "").trim();
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Requête invalide." }, 400);
    }

    const prenom = clean(body.prenom);
    const nom = clean(body.nom);
    const email = clean(body.email);
    const sujet = clean(body.sujet);
    const message = clean(body.message);
    const company = clean(body.company); // honeypot

    if (company) {
      return json({ ok: true });
    }

    if (!prenom || !nom || !email || !sujet || !message) {
      return json({ ok: false, error: "Merci de remplir tous les champs." }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ ok: false, error: "Adresse e-mail invalide." }, 400);
    }

    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const CONTACT_TO = process.env.CONTACT_TO || process.env.SMTP_USER;
    const CONTACT_FROM = process.env.CONTACT_FROM || process.env.SMTP_USER;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO || !CONTACT_FROM) {
      return json({ ok: false, error: "Configuration serveur manquante." }, 500);
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: `"Studio Utopia" <${CONTACT_FROM}>`,
        to: CONTACT_TO,
        replyTo: email,
        subject: `Nouveau message — ${sujet}`,
        text: [
          `Prénom: ${prenom}`,
          `Nom: ${nom}`,
          `Email: ${email}`,
          `Sujet: ${sujet}`,
          ``,
          `Message:`,
          message
        ].join("\n")
      });

      return json({ ok: true });
    } catch (error) {
      console.error("CONTACT_FORM_ERROR", error);
      return json(
        { ok: false, error: "Impossible d'envoyer le message pour le moment." },
        500
      );
    }
  }
};
