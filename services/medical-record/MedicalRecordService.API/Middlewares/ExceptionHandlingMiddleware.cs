using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MedicalRecordService.Domain.Exceptions;

namespace MedicalRecordService.API.Middlewares;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            var erros = ex.Errors.Select(e => new { campo = e.PropertyName, mensagem = e.ErrorMessage });
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { erros }));
        }
        catch (ProntuarioNaoEncontradoException ex)
        {
            await EscreverRespostaAsync(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (EntradaNaoEncontradaException ex)
        {
            await EscreverRespostaAsync(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (TipoEntradaInvalidaException ex)
        {
            await EscreverRespostaAsync(context, StatusCodes.Status422UnprocessableEntity, ex.Message);
        }
        catch (TipoEventoDesconhecidoException ex)
        {
            // Corrupção de dados no event store — não é um erro do cliente.
            logger.LogError(ex, "Tipo de evento desconhecido no event store.");
            await EscreverRespostaAsync(context, StatusCodes.Status500InternalServerError, "Ocorreu um erro interno ao processar o prontuário.");
        }
        catch (DbUpdateException)
        {
            // Violação da constraint única (id_agregado, versao) — concorrência ao adicionar evento.
            await EscreverRespostaAsync(context, StatusCodes.Status409Conflict, "Conflito de concorrência ao salvar o prontuário. Tente novamente.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro inesperado.");
            await EscreverRespostaAsync(context, StatusCodes.Status500InternalServerError, "Ocorreu um erro interno.");
        }
    }

    private static async Task EscreverRespostaAsync(HttpContext context, int statusCode, string mensagem)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem }));
    }
}
