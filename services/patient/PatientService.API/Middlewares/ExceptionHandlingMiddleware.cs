using System.Text.Json;
using FluentValidation;
using PatientService.Domain.Exceptions;

namespace PatientService.API.Middlewares;

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
        catch (CpfInvalidoException ex)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem = ex.Message }));
        }
        catch (CpfJaCadastradoException ex)
        {
            context.Response.StatusCode = StatusCodes.Status409Conflict;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem = ex.Message }));
        }
        catch (PacienteNaoEncontradoException ex)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem = ex.Message }));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro não tratado");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem = "Erro interno do servidor." }));
        }
    }
}
