package com.example.converter.controller;

import com.example.converter.model.ConversionResponse;
import com.example.converter.service.CurrencyService;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class CurrencyController {

    @Autowired
    private CurrencyService currencyService;

    @GetMapping("/convert")
    public Mono<ConversionResponse> convert(
            @RequestParam @NotBlank String from,
            @RequestParam @NotBlank String to,
            @RequestParam @Min(0) double amount) {

        return currencyService.convert(from.toUpperCase(), to.toUpperCase(), amount);
    }
}
