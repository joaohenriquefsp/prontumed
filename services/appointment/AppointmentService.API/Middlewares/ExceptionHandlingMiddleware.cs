using System.Text.Json;
using FluentValidation;
using AppointmentService.Domain.Exceptions;

namespace AppointmentService.API.Middlewares;

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
        catch (ConsultaNaoEncontradaException ex)
        {
            await EscreverRespostaAsync(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (GradeHorarioNaoEncontradaException ex)
        {
            await EscreverRespostaAsync(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (HorarioBloqueadoNaoEncontradoException ex)
        {
            await EscreverRespostaAsync(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (SlotIndisponivelException ex)
        {
            await EscreverRespostaAsync(context, StatusCodes.Status409Conflict, ex.Message);
        }
        catch (ConsultaNaoPodeSerCanceladaException ex)
        {
            await EscreverRespostaAsync(context, StatusCodes.Status422UnprocessableEntity, ex.Message);
        }
        catch (TransicaoStatusInvalidaException ex)
        {
            await EscreverRespostaAsync(context, StatusCodes.Status422UnprocessableEntity, ex.Message);
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
