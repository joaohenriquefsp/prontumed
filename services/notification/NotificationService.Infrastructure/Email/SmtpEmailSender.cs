using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using NotificationService.Application.Interfaces;

namespace NotificationService.Infrastructure.Email;

// Envia via SMTP de desenvolvimento (smtp4dev, ver docker-compose.yml).
// Em produção bastaria apontar Smtp:Host/Smtp:Port para um provedor real,
// sem alterar este código.
public class SmtpEmailSender(IOptions<SmtpOptions> options) : IEmailSender
{
    public async Task EnviarAsync(string destinatario, string assunto, string corpo, CancellationToken ct = default)
    {
        var opcoes = options.Value;

        var mensagem = new MimeMessage();
        mensagem.From.Add(new MailboxAddress(opcoes.RemetenteNome, opcoes.RemetenteEmail));
        mensagem.To.Add(MailboxAddress.Parse(destinatario));
        mensagem.Subject = assunto;
        mensagem.Body = new TextPart("plain") { Text = corpo };

        using var client = new SmtpClient();
        await client.ConnectAsync(opcoes.Host, opcoes.Port, useSsl: false, ct);
        await client.SendAsync(mensagem, ct);
        await client.DisconnectAsync(quit: true, ct);
    }
}
