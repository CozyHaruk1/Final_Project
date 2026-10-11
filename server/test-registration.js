const mongoose = require("mongoose");
const Registration = require("./models/Registration");

const runTest = async () => {
console.log("=== REGISTRATION MODEL TEST ===");

const registration = new Registration({
studentId: new mongoose.Types.ObjectId(),
offeringId: new mongoose.Types.ObjectId(),
term: "2026-1"
});

try {
await registration.validate();

console.log("PASS - Valid registration accepted");

if (registration.status === "registered") {
console.log("PASS - status defaults to registered");
}

if (registration.createdAt instanceof Date) {
console.log("PASS - createdAt generated automatically");
}
} catch (error) {
console.log("FAIL - Valid registration rejected");
console.log(error.message);
}

const dropped = new Registration({
studentId: new mongoose.Types.ObjectId(),
offeringId: new mongoose.Types.ObjectId(),
term: "2026-1",
status: "dropped"
});

try {
await dropped.validate();
console.log("PASS - dropped status accepted");
} catch (error) {
console.log("FAIL - dropped status rejected");
}

const invalidStatus = new Registration({
studentId: new mongoose.Types.ObjectId(),
offeringId: new mongoose.Types.ObjectId(),
term: "2026-1",
status: "pending"
});

try {
await invalidStatus.validate();
console.log("FAIL - Invalid pending status accepted");
} catch (error) {
console.log("PASS - Invalid pending status rejected");
}

const missingStudent = new Registration({
offeringId: new mongoose.Types.ObjectId(),
term: "2026-1"
});

try {
await missingStudent.validate();
console.log("FAIL - Missing studentId accepted");
} catch (error) {
console.log("PASS - Missing studentId rejected");
}

console.log(
"Indexes:",
Registration.schema.indexes()
);

console.log("=== REGISTRATION TEST COMPLETE ===");
};

runTest();