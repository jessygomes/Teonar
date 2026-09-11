export function rsvpConfirmationEmail() {
  const conciergeWhatsapp = "https://wa.me/33769143561";

  const html = `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Confirmation TEONAR</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #0a0a0a;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #171512;
  "
>
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background-color: #0a0a0a;"
  >
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- INVITATION -->
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            max-width: 680px;
            background-color: #f1eee7;
            border-collapse: collapse;
          "
        >
          
          <!-- TOP BORDER -->
          <tr>
            <td
              style="
                height: 5px;
                background-color: #815b3e;
                font-size: 0;
                line-height: 0;
              "
            >
              &nbsp;
            </td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td
              align="center"
              style="
                padding:
                  72px
                  36px
                  54px
                  36px;
              "
            >
              <div
                style="
                  margin: 0 0 20px 0;
                  font-size: 32px;
                  font-weight: 300;
                  letter-spacing: 12px;
                  line-height: 1.2;
                  color: #171512;
                "
              >
                TEONAR
              </div>

              <div
                style="
                  font-size: 10px;
                  font-weight: 400;
                  letter-spacing: 5px;
                  text-transform: uppercase;
                  color: #815b3e;
                "
              >
                SALON PRIVÉ · PARIS
              </div>

              <div
                style="
                  width: 44px;
                  height: 1px;
                  margin: 38px auto 0 auto;
                  background-color: #815b3e;
                "
              ></div>
            </td>
          </tr>

          <!-- CONFIRMATION -->
          <tr>
            <td
              align="center"
              style="
                padding: 0 50px 60px 50px;
              "
            >
              <div
                style="
                  margin-bottom: 20px;
                  font-size: 10px;
                  text-transform: uppercase;
                  letter-spacing: 4px;
                  color: #815b3e;
                "
              >
                Votre présence est confirmée
              </div>

              <div
                style="
                  max-width: 470px;
                  margin: 0 auto;
                  font-family:
                    Didot,
                    'Bodoni MT',
                    Georgia,
                    serif;
                  font-size: 27px;
                  font-weight: 400;
                  line-height: 1.45;
                  color: #171512;
                "
              >
                La Maison TEONAR a le plaisir
                de vous recevoir
              </div>
            </td>
          </tr>

          <!-- DATE -->
          <tr>
            <td style="padding: 0 44px;">
              <div
                style="
                  border-top: 1px solid rgba(23,21,18,.16);
                "
              ></div>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="
                padding: 54px 36px;
              "
            >
              <div
                style="
                  font-family:
                    Didot,
                    'Bodoni MT',
                    Georgia,
                    serif;
                  font-size: 23px;
                  line-height: 1.5;
                "
              >
                Jeudi 1<sup>er</sup> octobre 2026
              </div>

              <div
                style="
                  margin-top: 13px;
                  font-size: 10px;
                  text-transform: uppercase;
                  letter-spacing: 3px;
                  color: #6e6962;
                "
              >
                À partir de 20h
              </div>

              <div
                style="
                  margin-top: 8px;
                  font-size: 10px;
                  text-transform: uppercase;
                  letter-spacing: 3px;
                  color: #6e6962;
                "
              >
                De 21h à 23h
              </div>
            </td>
          </tr>

          <!-- DEROULE -->
          <tr>
            <td
              style="
                padding:
                  20px
                  54px
                  64px
                  54px;
              "
            >
              <div
                style="
                  margin-bottom: 42px;
                  text-align: center;
                  font-size: 9px;
                  text-transform: uppercase;
                  letter-spacing: 4px;
                  color: #815b3e;
                "
              >
                Le déroulé
              </div>

              <!-- I -->
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td
                    width="48"
                    valign="top"
                    style="
                      padding-bottom: 34px;
                      font-family:
                        Didot,
                        Georgia,
                        serif;
                      font-size: 25px;
                      color: #815b3e;
                    "
                  >
                    I
                  </td>

                  <td
                    valign="top"
                    style="
                      padding-bottom: 34px;
                    "
                  >
                    <div
                      style="
                        margin-bottom: 5px;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        color: #171512;
                      "
                    >
                      L'accueil
                    </div>

                    <div
                      style="
                        font-family:
                          Didot,
                          Georgia,
                          serif;
                        font-size: 16px;
                        line-height: 1.5;
                        color: #6e6962;
                      "
                    >
                      Chaleureux, par les hôtesses.
                    </div>
                  </td>
                </tr>

                <!-- II -->

                <tr>
                  <td
                    width="48"
                    valign="top"
                    style="
                      padding-bottom: 34px;
                      font-family:
                        Didot,
                        Georgia,
                        serif;
                      font-size: 25px;
                      color: #815b3e;
                    "
                  >
                    II
                  </td>

                  <td
                    valign="top"
                    style="
                      padding-bottom: 34px;
                    "
                  >
                    <div
                      style="
                        margin-bottom: 5px;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        color: #171512;
                      "
                    >
                      La parole
                    </div>

                    <div
                      style="
                        font-family:
                          Didot,
                          Georgia,
                          serif;
                        font-size: 16px;
                        line-height: 1.5;
                        color: #6e6962;
                      "
                    >
                      Accompagnée de mets délicieux.
                    </div>
                  </td>
                </tr>

                <!-- III -->

                <tr>
                  <td
                    width="48"
                    valign="top"
                    style="
                      font-family:
                        Didot,
                        Georgia,
                        serif;
                      font-size: 25px;
                      color: #815b3e;
                    "
                  >
                    III
                  </td>

                  <td valign="top">
                    <div
                      style="
                        margin-bottom: 5px;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        color: #171512;
                      "
                    >
                      La découverte
                    </div>

                    <div
                      style="
                        font-family:
                          Didot,
                          Georgia,
                          serif;
                        font-size: 16px;
                        line-height: 1.5;
                        color: #6e6962;
                      "
                    >
                      D’un héritage intemporel.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SEPARATEUR -->
          <tr>
            <td style="padding: 0 44px;">
              <div
                style="
                  border-top: 1px solid rgba(23,21,18,.16);
                "
              ></div>
            </td>
          </tr>

          <!-- ACCOMPAGNEMENT -->
          <tr>
            <td
              align="center"
              style="
                padding:
                  58px
                  52px
                  24px
                  52px;
              "
            >
              <div
                style="
                  max-width: 500px;
                  margin: 0 auto;
                  font-family:
                    Didot,
                    Georgia,
                    serif;
                  font-size: 18px;
                  line-height: 1.65;
                  color: #171512;
                "
              >
                Vous serez accueillis et accompagnés
                tout au long de la soirée.
              </div>
            </td>
          </tr>

          <!-- CONCIERGERIE -->
          <tr>
            <td
              align="center"
              style="
                padding:
                  20px
                  50px
                  24px
                  50px;
              "
            >
              <div
                style="
                  max-width: 500px;
                  margin: 0 auto;
                  font-size: 12px;
                  font-weight: 300;
                  line-height: 1.8;
                  letter-spacing: 0.5px;
                  color: #66615b;
                "
              >
                Pour toute demande particulière,
                notre conciergerie se tient à votre
                disposition sur WhatsApp.
              </div>

              <a
                href="${conciergeWhatsapp}"
                style="
                  display: inline-block;
                  margin-top: 24px;
                  padding:
                    15px
                    24px;
                  background-color: #171512;
                  color: #f1eee7;
                  text-decoration: none;
                  font-size: 9px;
                  text-transform: uppercase;
                  letter-spacing: 3px;
                "
              >
                Contacter la conciergerie
              </a>
            </td>
          </tr>

          <!-- TELEPHONE -->
          <tr>
            <td
              align="center"
              style="
                padding:
                  20px
                  50px
                  54px
                  50px;
              "
            >
              <div
                style="
                  max-width: 500px;
                  margin: 0 auto;
                  font-size: 12px;
                  font-weight: 300;
                  line-height: 1.8;
                  color: #66615b;
                "
              >
                Pour toute question, ou en cas
                d'empêchement, vous pouvez nous joindre au
              </div>

              <a
                href="tel:+33769143561"
                style="
                  display: inline-block;
                  margin-top: 12px;
                  color: #815b3e;
                  text-decoration: none;
                  font-size: 13px;
                  letter-spacing: 2px;
                "
              >
                07 69 14 35 61
              </a>
            </td>
          </tr>

          <!-- CLOSING -->
          <tr>
            <td
              align="center"
              style="
                background-color: #171512;
                padding:
                  54px
                  40px
                  50px
                  40px;
              "
            >
              <div
                style="
                  max-width: 480px;
                  margin: 0 auto;
                  font-family:
                    Didot,
                    Georgia,
                    serif;
                  font-size: 19px;
                  font-weight: 400;
                  line-height: 1.6;
                  color: #f1eee7;
                "
              >
                La Maison vous reçoit en confiance,
                dans le secret d’un salon parisien.
              </div>

              <div
                style="
                  width: 35px;
                  height: 1px;
                  margin: 32px auto;
                  background-color: #815b3e;
                "
              ></div>

              <div
                style="
                  font-size: 18px;
                  font-weight: 300;
                  letter-spacing: 8px;
                  color: #f1eee7;
                "
              >
                TEONAR
              </div>

              <div
                style="
                  margin-top: 14px;
                  font-size: 8px;
                  text-transform: uppercase;
                  letter-spacing: 4px;
                  color: rgba(241,238,231,.45);
                "
              >
                Paris
              </div>
            </td>
          </tr>
        </table>

        <!-- FOOTER -->
        <div
          style="
            max-width: 680px;
            padding-top: 20px;
            text-align: center;
            font-size: 9px;
            line-height: 1.6;
            color: rgba(255,255,255,.35);
          "
        >
          Cette invitation est personnelle.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
TEONAR
Salon privé · Paris

Votre présence est confirmée.

La Maison TEONAR a le plaisir de vous recevoir

le jeudi 1er octobre 2026,
à partir de 20h.
De 21h à 23h.

LE DÉROULÉ

I — L'accueil
Chaleureux, par les hôtesses.

II — La parole
Accompagnée de mets délicieux.

III — La découverte
D’un héritage intemporel.

Vous serez accueillis et accompagnés tout au long de la soirée.

Pour toute demande particulière, notre conciergerie se tient à votre disposition sur WhatsApp.

Pour toute question, ou en cas d'empêchement :
07 69 14 35 61

La Maison vous reçoit en confiance, dans le secret d’un salon parisien.

TEONAR
Paris
  `.trim();

  return {
    html,
    text,
  };
}