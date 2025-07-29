package com.example.converter.client;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.databind.JsonNode;

@Component
public class ExchangeRateClient {
    private final WebClient webClient = WebClient.create("https://api.exchangerate.host");

    public Mono<JsonNode> getConversion(String from, String to, double amount) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/convert")
                        .queryParam("from", from)
                        .queryParam("to", to)
                        .queryParam("amount", amount)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }
}
