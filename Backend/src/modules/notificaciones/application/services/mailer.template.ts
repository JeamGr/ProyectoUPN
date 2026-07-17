// =================================================================
// CAPA: Application / Services
// Layout con <table> + estilos en línea (lo único que respeta
// Gmail/Outlook al renderizar el correo).
// =================================================================

export const NOMBRE_PLATAFORMA = 'Voluntariados UPN';

const AMARILLO_UPN  = '#F5A623';
const MORADO_ACENTO = '#4C3A8C';
const GRIS_TEXTO    = '#333333';
const GRIS_SUAVE    = '#777777';

export function construirCorreoHTML(nombreUsuario: string, mensaje: string): string {
    const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : 'Hola,';

    return `
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${NOMBRE_PLATAFORMA}</title>
  <style>
    body { margin:0; padding:0; width:100% !important; background-color:#ffffff; }
    table { border-collapse:collapse; }
    @media only screen and (max-width:600px) {
      .px { padding-left:18px !important; padding-right:18px !important; }
      .texto { font-size:15px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">

  <tr>
    <td class="px" style="background-color:${AMARILLO_UPN};padding:20px 28px;">
      <span style="color:#1a1a1a;font-size:18px;font-weight:bold;">${NOMBRE_PLATAFORMA}</span><br/>
      <span style="color:#4a3a00;font-size:12px;">Universidad Privada del Norte</span>
    </td>
  </tr>

  <tr>
    <td class="px" style="padding:28px;">
      <p class="texto" style="margin:0 0 16px 0;color:${GRIS_TEXTO};font-size:15px;">${saludo}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f4fc;border-left:4px solid ${MORADO_ACENTO};border-radius:4px;">
        <tr>
          <td class="texto" style="padding:16px 18px;color:${GRIS_TEXTO};font-size:15px;line-height:1.5;">${mensaje}</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td class="px" style="background-color:#fafbfc;padding:18px 28px;border-top:1px solid #eaecef;">
      <p style="margin:0;color:${GRIS_SUAVE};font-size:12px;line-height:1.5;">Este es un mensaje automático de ${NOMBRE_PLATAFORMA}. Por favor, no respondas a este correo.</p>
    </td>
  </tr>

</table>
</body>
</html>`.trim();
}

export function correoCodigoVerificacion(nombreUsuario: string, codigo: string, minutos: number): string {
    const mensaje = `Tu código de verificación es <strong style="font-size:22px;letter-spacing:3px;color:${MORADO_ACENTO};">${codigo}</strong>.<br/>Vence en ${minutos} minutos. Si no fuiste tú, ignora este correo.`;
    return construirCorreoHTML(nombreUsuario, mensaje);
}