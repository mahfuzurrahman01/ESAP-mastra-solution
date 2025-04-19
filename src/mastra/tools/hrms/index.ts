"use client";
import { updateEmployee } from "./update-employee";

// Debug function to test the API directly
const testUpdateEmployee = async () => {
  try {
    const testData = {
      id: 19, // Use a valid ID from your system
      firstName: "TEST_UPDATE",
      lastName: "TEST_LAST",
      email: "test@example.com",
      phone: "01234567890",
    };

    console.log("Testing update with data:", testData);
    const result = await updateEmployee(testData);
    console.log("Test result:", result);
    return result;
  } catch (error) {
    console.error("Test failed:", error);
    return null;
  }
};
