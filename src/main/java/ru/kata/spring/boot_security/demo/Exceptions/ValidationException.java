package ru.kata.spring.boot_security.demo.Exceptions;

public class ValidationException  extends RuntimeException{
    public ValidationException(String message) {
        super(message);
    }
}
