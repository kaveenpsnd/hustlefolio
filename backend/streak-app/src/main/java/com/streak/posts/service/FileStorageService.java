package com.streak.posts.service;

import java.io.IOException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path root = Paths.get("uploads");

    @PostConstruct
    public void init(){
        try {
            Files.createDirectories(root);
        }catch(IOException e){
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }
    public String save(MultipartFile file){
        try{
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename;
        }catch (Exception e){
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }



}
