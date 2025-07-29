package com.example.converter.service;

import com.example.converter.client.ExchangeRateClient;
import com.example.converter.model.ConversionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CurrencyService {

    @Autowired
    private ExchangeRateClient exchangeRateClient;

    public Mono<ConversionResponse> convert(String from, String to, double amount) {
        return exchangeRateClient.getConversion(from, to, amount)
                .map(json -> {
                    ConversionResponse response = new ConversionResponse();
                    response.setFrom(from);
                    response.setTo(to);
                    response.setAmount(amount);
                    response.setRate(json.path("info").path("rate").asDouble());
                    response.setResult(json.path("result").asDouble());
                    return response;
                });
    }
}
