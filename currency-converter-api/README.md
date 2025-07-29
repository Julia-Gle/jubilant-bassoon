# Currency Converter API

## Starten
```
mvn spring-boot:run
```

## Beispiel-Anfrage
GET http://localhost:8080/api/convert?from=EUR&to=PLN&amount=100

## Beispiel-Antwort
{
  "from": "EUR",
  "to": "PLN",
  "amount": 100.0,
  "rate": 4.315,
  "result": 431.5
}
