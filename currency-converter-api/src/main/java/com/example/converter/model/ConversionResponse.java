package com.example.converter.model;

public class ConversionResponse {
    private String from;
    private String to;
    private double amount;
    private double rate;
    private double result;

    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public double getRate() { return rate; }
    public void setRate(double rate) { this.rate = rate; }

    public double getResult() { return result; }
    public void setResult(double result) { this.result = result; }
}
