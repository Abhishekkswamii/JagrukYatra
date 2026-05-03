/**
 * Reusable utility to generate and download the premium "Certificate of Civic Achievement".
 */
export async function downloadCertificate({
  name,
  score,
  stagesCompleted,
  profileName,
  firstTimeVoter,
}: {
  name: string;
  score: number;
  stagesCompleted: number;
  profileName?: string;
  firstTimeVoter: boolean;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, 1400, 900);

  // Subtle saffron gradient top
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, "#FFF3E8");
  grad.addColorStop(1, "#FFFFFF");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1400, 200);

  // Tricolour top bar
  ctx.fillStyle = "#FF671F"; ctx.fillRect(0, 0, 1400, 14);
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 14, 1400, 7);
  ctx.fillStyle = "#046A38"; ctx.fillRect(0, 21, 1400, 14);

  // Tricolour bottom bar
  ctx.fillStyle = "#FF671F"; ctx.fillRect(0, 872, 1400, 10);
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 882, 1400, 6);
  ctx.fillStyle = "#046A38"; ctx.fillRect(0, 888, 1400, 12);

  // Gold border
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 40, 1344, 820);

  // Saffron subtle inner frame
  ctx.strokeStyle = "#FF671F22";
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 48, 1328, 804);

  // Ashok Chakra watermark (Subtle)
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.strokeStyle = "#0047A0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(700, 450, 200, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    ctx.beginPath();
    ctx.moveTo(700, 450);
    ctx.lineTo(700 + 200 * Math.cos(angle), 450 + 200 * Math.sin(angle));
    ctx.stroke();
  }
  ctx.restore();

  // Title
  ctx.font = "bold 72px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "#1A2C6B";
  ctx.textAlign = "center";
  ctx.fillText("Certificate of Civic Achievement", 700, 180);

  // Subtitle
  ctx.font = "italic 34px Georgia, serif";
  ctx.fillStyle = "#FF671F";
  ctx.fillText("JagrukYatra — Official ECI Election Awareness Journey", 700, 235);

  // Divider
  const divGrad = ctx.createLinearGradient(200, 265, 1200, 265);
  divGrad.addColorStop(0, "#FF671F");
  divGrad.addColorStop(0.5, "#FFD700");
  divGrad.addColorStop(1, "#046A38");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(200, 270); ctx.lineTo(1200, 270); ctx.stroke();

  // "Certified Informed Voter" badge style name display
  ctx.fillStyle = "#1A2C6B";
  ctx.font = "bold 60px Georgia, serif";
  ctx.fillText(name, 700, 360);

  // Main text
  ctx.font = "32px Georgia, serif";
  ctx.fillStyle = "#374151";
  ctx.fillText("has successfully completed all 8 Stages of", 700, 415);
  ctx.fillText("the Official Indian Election Process", 700, 460);

  // Score
  ctx.font = "bold 88px Georgia, serif";
  ctx.fillStyle = "#FF671F";
  ctx.fillText(`${score} / 100`, 700, 570);
  ctx.font = "bold 24px Georgia, serif";
  ctx.fillStyle = "#9CA3AF";
  ctx.fillText("JAGRUK SCORE", 700, 605);

  // Stages badge
  ctx.font = "bold 40px Georgia, serif";
  ctx.fillStyle = "#046A38";
  ctx.fillText(`✓ ${stagesCompleted} / 8 Stages Completed`, 700, 670);

  // Profile (State & Voter Type)
  if (profileName) {
    ctx.font = "italic 30px Georgia, serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText(
      `${firstTimeVoter ? "First-Time Voter  ·  " : ""}${profileName}`,
      700, 725
    );
  }

  // Footer
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  ctx.font = "24px Georgia, serif";
  ctx.fillStyle = "#9CA3AF";
  ctx.fillText(`Issued on: ${date}  |  Jai Hind 🇮🇳`, 700, 810);
  ctx.font = "bold 18px Georgia, serif";
  ctx.fillStyle = "#D1D5DB";
  ctx.fillText("jagrukyatra.in", 700, 845);

  // Trigger download
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve();
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JagrukYatra-Certificate-${name.replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}
