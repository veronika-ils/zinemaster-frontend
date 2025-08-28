package com.zinemasterapp.zinemasterapp.controller;


import com.zinemasterapp.zinemasterapp.dto.LoginRequest;
import com.zinemasterapp.zinemasterapp.model.User;
import com.zinemasterapp.zinemasterapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.naming.AuthenticationException;

@RestController//deka e REST API kontroler, vrakja JSON
@RequestMapping("/api/auth")//osnovna ruta
public class AuthController {

//    @Autowired
//    private AuthenticationManager authenticationManager;//avtomatski Springboot pravi AuthenticationManager
//
//    @PostMapping("/login")//na /api/auth/login primame POST metoda
//    public ResponseEntity<?> login(@RequestBody LoginRequest request) {//ResponseEntity ni dozvoluva da kontrolirame HTTP status, response body
//        try {
//            Authentication authentication = authenticationManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
//            );
//            return ResponseEntity.ok("Login successful!");
//        }catch (BadCredentialsException e){
//            return ResponseEntity.status(401).body("Invalid username or password");
//        }catch (DisabledException e){
//            return ResponseEntity.status(403).body("User is inactive");
//        }
//
//    }
    private final UserRepository userRepository;//isto e kako @Autowired ama povekje imam so konstructor koristeno

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")// koga se pravi metod POST na ovaa specificna ruta
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {//JSON teloto go zema i go mapira vo LoginRequest
        User user = userRepository.findByUsername(request.getUsername()).orElse(null);//dali ima vo baza korisnik vakov(so pomos na interfejsot
        // )
        System.out.println("Login request received from " + request.getUsername());//proverka


        if (user == null) {
            return ResponseEntity.status(401).body("User not found");
        }
        if(user.getAccess() == 0){
            return ResponseEntity.status(401).body("User is not active");
        }

        // za demo
        if ("test123".equals(request.getPassword())) {
            return ResponseEntity.ok(user);//ova se stava vo localStorage, ova e JSON
        } else {
            return ResponseEntity.status(401).body("Invalid password");//ova e String
        }
    }
}
