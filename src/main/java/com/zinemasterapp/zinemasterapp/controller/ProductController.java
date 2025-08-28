package com.zinemasterapp.zinemasterapp.controller;


import com.zinemasterapp.zinemasterapp.model.Product;
import com.zinemasterapp.zinemasterapp.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")//ke moze da GET/POST od ovde
@CrossOrigin(origins = "http://localhost:8082")//sega dozvoluvame od tuka da zemem(ovde e Vue)
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findByAccessableTrue(Sort.by(Sort.Direction.ASC, "id"));//custom metod

    }


    @DeleteMapping("/{id}")//logicko brishenje
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {//samo pravime da nemoze da se gleda vejke accessable = false
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        product.setAccessable(false);
        productRepository.save(product);
        return ResponseEntity.ok("Marked as inaccessible");

    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {//JSON go pravime vo Product
        product.setReserved(0);
        product.setAccessable(true);
        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(savedProduct);
    }
}
