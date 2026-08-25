package com.spicyeat.notification.template;

import com.spicyeat.notification.domain.NotificationType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EmailTemplateRenderer {

    public EmailContent render(NotificationType type, Map<String, String> data) {
        return switch (type) {
            case PASSWORD_RESET -> passwordReset(data);
            case ORDER_PLACED -> orderPlaced(data);
            case ORDER_CONFIRMED -> orderConfirmed(data);
            case ORDER_OUT_FOR_DELIVERY -> orderOutForDelivery(data);
            case PAYMENT_SUCCEEDED -> paymentSucceeded(data);
            case PAYMENT_FAILED -> paymentFailed(data);
            case REFUND_PROCESSED -> refundProcessed(data);
        };
    }

    private EmailContent passwordReset(Map<String, String> data) {
        String resetLink = value(data, "resetLink");
        String body = """
                <p>We received a request to reset your SpicyEat password.</p>
                <p><a href="%s" class="button">Reset password</a></p>
                <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
                <p>This link expires in 30 minutes.</p>
                """.formatted(resetLink);
        return new EmailContent("Reset your SpicyEat password", wrap("Reset your password", body));
    }

    private EmailContent orderPlaced(Map<String, String> data) {
        String orderId = value(data, "orderId");
        String total = value(data, "total");
        String body = """
                <p>Thanks for your order! We've received it and the kitchen is getting started.</p>
                <p><strong>Order:</strong> %s<br/><strong>Total:</strong> $%s</p>
                """.formatted(shortId(orderId), total);
        return new EmailContent("Your SpicyEat order has been placed", wrap("Order placed 🔥", body));
    }

    private EmailContent orderConfirmed(Map<String, String> data) {
        String orderId = value(data, "orderId");
        String body = """
                <p>Your order is confirmed and heading to the kitchen.</p>
                <p><strong>Order:</strong> %s</p>
                """.formatted(shortId(orderId));
        return new EmailContent("Your SpicyEat order is confirmed", wrap("Order confirmed", body));
    }

    private EmailContent orderOutForDelivery(Map<String, String> data) {
        String orderId = value(data, "orderId");
        String body = """
                <p>Your order is on its way!</p>
                <p><strong>Order:</strong> %s</p>
                """.formatted(shortId(orderId));
        return new EmailContent("Your SpicyEat order is out for delivery", wrap("Out for delivery 🛵", body));
    }

    private EmailContent paymentSucceeded(Map<String, String> data) {
        String orderId = value(data, "orderId");
        String amount = value(data, "amount");
        String body = """
                <p>We've received your payment of <strong>$%s</strong> for order %s.</p>
                """.formatted(amount, shortId(orderId));
        return new EmailContent("Payment received", wrap("Payment received", body));
    }

    private EmailContent paymentFailed(Map<String, String> data) {
        String orderId = value(data, "orderId");
        String amount = value(data, "amount");
        String reason = value(data, "reason");
        String body = """
                <p>We couldn't process your payment of <strong>$%s</strong> for order %s.</p>
                <p>%s</p>
                <p>Please try again or use a different payment method.</p>
                """.formatted(amount, shortId(orderId), reason.isBlank() ? "The charge was declined." : reason);
        return new EmailContent("Payment failed for your SpicyEat order", wrap("Payment failed", body));
    }

    private EmailContent refundProcessed(Map<String, String> data) {
        String orderId = value(data, "orderId");
        String amount = value(data, "amount");
        String body = """
                <p>We've processed a refund of <strong>$%s</strong> for order %s.</p>
                <p>It may take a few business days to appear on your statement.</p>
                """.formatted(amount, shortId(orderId));
        return new EmailContent("Your SpicyEat refund has been processed", wrap("Refund processed", body));
    }

    private String value(Map<String, String> data, String key) {
        String value = data.get(key);
        return value == null ? "" : value;
    }

    private String shortId(String id) {
        return id.length() > 8 ? "#" + id.substring(0, 8) : id;
    }

    private String wrap(String heading, String bodyHtml) {
        return """
                <!doctype html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="margin:0;padding:0;background:#f5f1ee;font-family:Arial,Helvetica,sans-serif;color:#2b2320;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
                    <tr><td align="center">
                      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                        <tr><td style="background:#d9481f;padding:20px 32px;">
                          <span style="color:#ffffff;font-size:20px;font-weight:bold;">SpicyEat</span>
                        </td></tr>
                        <tr><td style="padding:32px;">
                          <h1 style="font-size:20px;margin:0 0 16px;">%s</h1>
                          <div style="font-size:15px;line-height:1.6;">%s</div>
                        </td></tr>
                        <tr><td style="padding:16px 32px;background:#f5f1ee;font-size:12px;color:#8a7d76;">
                          SpicyEat &middot; This is an automated message.
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                  <style>.button{display:inline-block;background:#d9481f;color:#ffffff !important;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;}</style>
                </body>
                </html>
                """.formatted(heading, bodyHtml);
    }
}
