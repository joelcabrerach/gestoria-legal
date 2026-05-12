import { NextResponse } from "next/server";
import { transporter } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { nombre, email, mensaje, plan } = await request.json();

    if (!nombre || !email || !mensaje || !plan) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: `"${nombre}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // The admin email receives the inquiries
      replyTo: email,
      subject: `Nueva consulta: Plan ${plan} — Gestoría Legal`,
      text: `Nombre: ${nombre}\nEmail: ${email}\nPlan: ${plan}\n\nMensaje:\n${mensaje}`,
      html: `
        <h2>Nueva consulta desde la web</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Plan de interés:</strong> ${plan}</p>
        <br/>
        <h3>Mensaje:</h3>
        <p>${mensaje.replace(/\n/g, "<br>")}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Correo enviado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al enviar el correo" },
      { status: 500 }
    );
  }
}
