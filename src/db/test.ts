import { UserRepository } from "../repositories/user.repository";
import { SettingsRepository } from "../repositories/settings.repository";
import { ConflictError } from "../utils/errors";

async function testRepositories() {
  try {
    console.log("Testing repositories...");
    
    const userRepo = new UserRepository();
    const settingsRepo = new SettingsRepository();
    
    // Wait a bit for table initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const testEmail = "test@example.com";
    let user;

    try {
      // Try to create a new user
      user = await userRepo.create(testEmail, await Bun.password.hash("test123"));
      console.log("Created user:", user);
    } catch (error) {
      if (error instanceof ConflictError) {
        // If user exists, retrieve it
        user = await userRepo.findByEmail(testEmail);
        console.log("Using existing user:", user);
      } else {
        throw error;
      }
    }
    
    // Test settings creation
    const settings = await settingsRepo.getSettings(user.id);
    console.log("Settings:", settings);
    
    // Test user retrieval
    const foundUser = await userRepo.findByEmail(testEmail);
    console.log("Found user:", foundUser);
    
    console.log(" All tests passed!");
  } catch (error) {
    console.error(" Test failed:", error);
  }
}

testRepositories();
