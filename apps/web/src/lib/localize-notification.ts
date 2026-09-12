import type { Locale } from "@/locales/types";

interface RawNotification {
  type: string;
  title: string;
  message: string;
}

export function localizeNotification(
  notif: RawNotification,
  locale: Locale
): { title: string; message: string } {
  if (!notif) return { title: "", message: "" };

  const { type, title, message } = notif;

  // Handle Offer / Task Rewards (REWARD_ADDED)
  if (type === "REWARD_ADDED" || title.includes("احتساب") || title.toLowerCase().includes("offer completed")) {
    let offerTitle = "";
    let points = "";
    let cash = "";
    let provider = "";

    // 1. Extract offer title from title: e.g. "🎉 تم احتساب العرض: Raid: Shadow Legends" or "🎉 Offer Completed: Raid: Shadow Legends"
    const titleMatch = title.match(/(?:العرض(?:\s*تجريبياً)?:\s*|Offer Completed:\s*|Angebot abgeschlossen:\s*|Oferta completada:\s*|オファー完了:\s*)(.+)$/i);
    if (titleMatch && titleMatch[1]) {
      offerTitle = titleMatch[1].trim();
    }

    // Fallback extract from message quotes: e.g. عرض "Raid: Shadow Legends" بنجاح
    if (!offerTitle) {
      const quoteMatch = message.match(/["'“]([^"'”]+)["'”]/);
      if (quoteMatch && quoteMatch[1]) {
        offerTitle = quoteMatch[1].trim();
      }
    }

    // 2. Extract points amount: e.g. "+5,000 نقطة" or "+5,000 pts" or "5,000"
    const pointsMatch = message.match(/\+?([0-9,]+)\s*(?:نقطة|points|pts|Punkte|puntos|ポイント)/i) || message.match(/\+([0-9,]+)/);
    if (pointsMatch && pointsMatch[1]) {
      points = pointsMatch[1].trim();
    }

    // 3. Extract cash value: e.g. "($5.00 USD)" or "$5.00"
    const cashMatch = message.match(/(\$[0-9,.]+(?:\s*USD)?)/i);
    if (cashMatch && cashMatch[1]) {
      cash = cashMatch[1].trim();
    }

    // 4. Extract provider name: e.g. "من شركة CPALead" or "from CPALead" or "von CPALead"
    const providerMatch = message.match(/(?:من شركة|from|von|de la empresa|de|から)\s+([^.]+?)(?:\.|$)/i);
    if (providerMatch && providerMatch[1]) {
      provider = providerMatch[1].trim();
    }

    // If we extracted at least an offer title or points, render localized
    if (offerTitle || points) {
      const displayTitle = offerTitle || (locale === "ar" ? "عرض جديد" : "New Offer");
      const displayPoints = points || "0";
      const displayCash = cash ? ` (${cash})` : "";

      switch (locale) {
        case "ar":
          return {
            title: `🎉 تم احتساب العرض: ${displayTitle}`,
            message: `تم احتساب عرض "${displayTitle}" بنجاح! حصلت على +${displayPoints} نقطة${displayCash}${provider ? ` من شركة ${provider}` : ""}.`,
          };
        case "de":
          return {
            title: `🎉 Angebot abgeschlossen: ${displayTitle}`,
            message: `Angebot "${displayTitle}" erfolgreich abgeschlossen! Sie haben +${displayPoints} Punkte${displayCash}${provider ? ` von ${provider}` : ""} erhalten.`,
          };
        case "es":
          return {
            title: `🎉 Oferta completada: ${displayTitle}`,
            message: `¡Oferta "${displayTitle}" completada con éxito! Has recibido +${displayPoints} pts${displayCash}${provider ? ` de ${provider}` : ""}.`,
          };
        case "ja":
          return {
            title: `🎉 オファー完了: ${displayTitle}`,
            message: `オファー「${displayTitle}」が正常に完了しました！${provider ? `${provider} から ` : ""}+${displayPoints} ポイント${displayCash} を獲得しました。`,
          };
        case "en":
        default:
          return {
            title: `🎉 Offer Completed: ${displayTitle}`,
            message: `Offer "${displayTitle}" completed successfully! You received +${displayPoints} pts${displayCash}${provider ? ` from ${provider}` : ""}.`,
          };
      }
    }
  }

  // Handle Referral Reward (REFERRAL_REWARD)
  if (type === "REFERRAL_REWARD" || title.toLowerCase().includes("referral")) {
    const pointsMatch = message.match(/([0-9,]+)\s*(?:نقطة|points|pts)?/i);
    const pts = pointsMatch ? pointsMatch[1] : "";

    switch (locale) {
      case "ar":
        return {
          title: "🎁 مكافأة إحالة مكتسبة!",
          message: pts ? `حصلت على +${pts} نقطة من أرباح إحالتك!` : "حصلت على نقاط جديدة من أرباح إحالتك!",
        };
      case "de":
        return {
          title: "🎁 Empfehlungsbelohnung erhalten!",
          message: pts ? `Sie haben +${pts} Punkte von Ihrer Empfehlung erhalten!` : "Sie haben Punkte von Ihrer Empfehlung erhalten!",
        };
      case "es":
        return {
          title: "🎁 ¡Recompensa de referido ganada!",
          message: pts ? `¡Has ganado +${pts} puntos de tu referido!` : "¡Has ganado puntos de tu referido!",
        };
      case "ja":
        return {
          title: "🎁 紹介報酬を獲得しました！",
          message: pts ? `紹介から +${pts} ポイントを獲得しました！` : "紹介からポイントを獲得しました！",
        };
      case "en":
      default:
        return {
          title: "🎁 Referral Reward Earned!",
          message: pts ? `You earned +${pts} points from your referral!` : "You earned points from your referral!",
        };
    }
  }

  // Handle Withdrawal Status Notifications
  if (type.startsWith("WITHDRAWAL_") || title.toLowerCase().includes("withdrawal")) {
    if (type === "WITHDRAWAL_COMPLETED" || title.toLowerCase().includes("completed") || title.toLowerCase().includes("paid") || title.includes("مكتمل")) {
      switch (locale) {
        case "ar":
          return {
            title: "✅ تم تأكيد السحب بنجاح",
            message: "تمت معالجة وإرسال مبلغ السحب بنجاح إلى حسابك.",
          };
        case "de":
          return {
            title: "✅ Auszahlung abgeschlossen",
            message: "Ihre Auszahlung wurde erfolgreich bearbeitet und überwiesen.",
          };
        case "es":
          return {
            title: "✅ Retiro completado con éxito",
            message: "Tu solicitud de retiro ha sido procesada y enviada a tu cuenta.",
          };
        case "ja":
          return {
            title: "✅ 出金が完了しました",
            message: "出金リクエストが処理され、アカウントに送金されました。",
          };
        case "en":
        default:
          return {
            title: "✅ Withdrawal Completed",
            message: "Your withdrawal has been successfully processed and sent.",
          };
      }
    }

    if (type === "WITHDRAWAL_REJECTED" || title.toLowerCase().includes("cancelled") || title.toLowerCase().includes("rejected") || title.includes("رفض")) {
      switch (locale) {
        case "ar":
          return {
            title: "⚠️ تم إلغاء/رفض طلب السحب",
            message: "تم رفض طلب السحب وإعادة النقاط تلقائياً إلى رصيد محفظتك.",
          };
        case "de":
          return {
            title: "⚠️ Auszahlung abgelehnt/storniert",
            message: "Ihre Auszahlung wurde abgelehnt und die Punkte Ihrem Guthaben wieder gutgeschrieben.",
          };
        case "es":
          return {
            title: "⚠️ Retiro rechazado o cancelado",
            message: "Tu retiro fue rechazado y los puntos han sido reembolsados a tu billetera.",
          };
        case "ja":
          return {
            title: "⚠️ 出金が拒否/キャンセルされました",
            message: "出金リクエストが拒否され、ポイントがウォレットに返金されました。",
          };
        case "en":
        default:
          return {
            title: "⚠️ Withdrawal Rejected / Cancelled",
            message: "Your withdrawal request was rejected and refunded to your wallet.",
          };
      }
    }
  }

  // Fallback to original
  return { title, message };
}
