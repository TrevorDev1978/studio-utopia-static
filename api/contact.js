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
      return json({ ok: false, error: "JSON invalide." }, 400);
    }

    const prenom = clean(body.prenom);
    const nom = clean(body.nom);
    const email = clean(body.email);
    const sujet = clean(body.sujet);
    const message = clean(body.message);
    const company = clean(body.company);

    if (company) {
      return json({ ok: true });
    }

    if (!prenom || !nom || !email || !sujet || !message) {
      return json({ ok: false, error: "Champs manquants." }, 400);
    }

    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const CONTACT_TO = process.env.CONTACT_TO || process.env.SMTP_USER;
    const CONTACT_FROM = process.env.CONTACT_FROM || process.env.SMTP_USER;

    const missing = [];
    if (!SMTP_HOST) missing.push("SMTP_HOST");
    if (!SMTP_PORT) missing.push("SMTP_PORT");
    if (!SMTP_USER) missing.push("SMTP_USER");
    if (!SMTP_PASS) missing.push("SMTP_PASS");
    if (!CONTACT_TO) missing.push("CONTACT_TO");
    if (!CONTACT_FROM) missing.push("CONTACT_FROM");

    if (missing.length) {
      console.error("CONTACT_ENV_MISSING", missing);
      return json(
        { ok: false, error: "Variables manquantes", missing },
        500
      );
    }

    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });

      // Teste d'abord la connexion SMTP
      await transporter.verify();

      const info = await transporter.sendMail({
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

      console.log("CONTACT_SEND_OK", {
        messageId: info.messageId,
        response: info.response
      });

      return json({ ok: true, messageId: info.messageId, response: info.response });
    } catch (error) {
      console.error("CONTACT_SEND_FAIL", {
        message: error?.message,
        code: error?.code,
        command: error?.command,
        response: error?.response,
        responseCode: error?.responseCode
      });

      return json(
        {
          ok: false,
          error: error?.message || "Erreur SMTP",
          code: error?.code || null,
          command: error?.command || null,
          response: error?.response || null,
          responseCode: error?.responseCode || null
        },
        500
      );
    }
  }
};
