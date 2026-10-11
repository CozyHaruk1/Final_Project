const User = require("./models/User");

const runTest = async () => {
console.log("=== USER MODEL TEST ===");

const student = new User({
name: "Test Student",
email: "TEST@UNIVERSITY.COM",
passwordHash: "hashedpassword",
role: "student",
studentId: "TEST001"
});

try {
await student.validate();

console.log("PASS - Valid student accepted");

if (student.email === "test@university.com") {
console.log("PASS - Email converted to lowercase");
}

if (student.active === true) {
console.log("PASS - active defaults to true");
}

if (student.advisorId === null) {
console.log("PASS - advisorId defaults to null");
}
} catch (error) {
console.log("FAIL - Valid student rejected");
console.log(error.message);
}

const missingStudentId = new User({
name: "Student Two",
email: "student2@test.com",
passwordHash: "hash",
role: "student"
});

try {
await missingStudentId.validate();
console.log("FAIL - Student without studentId accepted");
} catch (error) {
console.log("PASS - Student without studentId rejected");
}

const advisor = new User({
name: "Test Advisor",
email: "advisor@test.com",
passwordHash: "hash",
role: "advisor"
});

try {
await advisor.validate();
console.log("PASS - Advisor can omit studentId");
} catch (error) {
console.log("FAIL - Advisor rejected");
}

const invalidRole = new User({
name: "Invalid User",
email: "invalid@test.com",
passwordHash: "hash",
role: "teacher"
});

try {
await invalidRole.validate();
console.log("FAIL - Invalid role accepted");
} catch (error) {
console.log("PASS - Invalid role rejected");
}

console.log("=== USER TEST COMPLETE ===");
};

runTest();