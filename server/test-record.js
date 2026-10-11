const mongoose = require("mongoose");
const Record = require("./models/Record");

const runTest = async () => {
console.log("=== RECORD MODEL TEST ===");

const validRecord = new Record({
studentId: new mongoose.Types.ObjectId(),
courseId: new mongoose.Types.ObjectId(),
term: "2025-2",
grade: "B+"
});

try {
await validRecord.validate();
console.log("PASS - Valid record accepted");
} catch (error) {
console.log("FAIL - Valid record rejected");
console.log(error.message);
}

const failedRecord = new Record({
studentId: new mongoose.Types.ObjectId(),
courseId: new mongoose.Types.ObjectId(),
term: "2025-2",
grade: "F"
});

try {
await failedRecord.validate();
console.log("PASS - F grade accepted");
} catch (error) {
console.log("FAIL - F grade rejected");
}

const withdrawnRecord = new Record({
studentId: new mongoose.Types.ObjectId(),
courseId: new mongoose.Types.ObjectId(),
term: "2025-2",
grade: "W"
});

try {
await withdrawnRecord.validate();
console.log("PASS - W grade accepted");
} catch (error) {
console.log("FAIL - W grade rejected");
}

const invalidGrade = new Record({
studentId: new mongoose.Types.ObjectId(),
courseId: new mongoose.Types.ObjectId(),
term: "2025-2",
grade: "A+"
});

try {
await invalidGrade.validate();
console.log("FAIL - Invalid A+ grade accepted");
} catch (error) {
console.log("PASS - Invalid A+ grade rejected");
}

const missingCourse = new Record({
studentId: new mongoose.Types.ObjectId(),
term: "2025-2",
grade: "A"
});

try {
await missingCourse.validate();
console.log("FAIL - Record without courseId accepted");
} catch (error) {
console.log("PASS - Record without courseId rejected");
}

console.log(
"Indexes:",
Record.schema.indexes()
);

console.log("=== RECORD TEST COMPLETE ===");
};

runTest();