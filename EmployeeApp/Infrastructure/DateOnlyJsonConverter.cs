using Newtonsoft.Json;

namespace EmployeeApp.Infrastructure;

/// <summary>
/// Newtonsoft.Json converter for System.DateOnly.
/// DevExtreme dxDateBox sends dates as full ISO strings like "2026-02-09T18:30:00.000Z".
/// This converter strips the time portion and parses only the date part.
/// </summary>
public class DateOnlyJsonConverter : JsonConverter<DateOnly>
{
    private const string DateFormat = "yyyy-MM-dd";

    public override void WriteJson(JsonWriter writer, DateOnly value, JsonSerializer serializer)
    {
        writer.WriteValue(value.ToString(DateFormat));
    }

    public override DateOnly ReadJson(JsonReader reader, Type objectType, DateOnly existingValue,
        bool hasExistingValue, JsonSerializer serializer)
    {
        if (reader.TokenType == JsonToken.Null)
            return default;

        var raw = reader.Value?.ToString();
        if (string.IsNullOrWhiteSpace(raw))
            return default;

        // Handle full ISO datetime: "2026-02-09T18:30:00.000Z" or "09-02-2026 18:30:00"
        if (DateTime.TryParse(raw, out var dt))
            return DateOnly.FromDateTime(dt);

        // Handle plain date: "2026-02-09"
        if (DateOnly.TryParseExact(raw, DateFormat,
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var d))
            return d;

        throw new JsonSerializationException($"Cannot convert '{raw}' to DateOnly.");
    }
}

/// <summary>
/// Nullable DateOnly? variant.
/// </summary>
public class NullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
{
    private const string DateFormat = "yyyy-MM-dd";

    public override void WriteJson(JsonWriter writer, DateOnly? value, JsonSerializer serializer)
    {
        if (value is null) writer.WriteNull();
        else writer.WriteValue(value.Value.ToString(DateFormat));
    }

    public override DateOnly? ReadJson(JsonReader reader, Type objectType, DateOnly? existingValue,
        bool hasExistingValue, JsonSerializer serializer)
    {
        if (reader.TokenType == JsonToken.Null) return null;

        var raw = reader.Value?.ToString();
        if (string.IsNullOrWhiteSpace(raw)) return null;

        if (DateTime.TryParse(raw, out var dt)) return DateOnly.FromDateTime(dt);

        if (DateOnly.TryParseExact(raw, DateFormat,
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var d))
            return d;

        return null;
    }
}