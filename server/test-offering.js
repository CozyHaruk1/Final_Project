const mongoose = require("mongoose");
const Offering = require("./models/Offering");

const runTest = async () => {
console.log("=== OFFERING MODEL TEST ===");

const offering = new Offering({
courseId: new mongoose.Types.ObjectId(),
term: "2026-1",
section: "A",
instructor: "Dr. Test",
day: "Monday",
startTime: "08:30",
endTime: "10:30",
room: "A101",
seats: 30
});

try {
await offering.validate();

console.log("PASS - Valid offering accepted");

if (offering.seatsTaken === 0) {
console.log("PASS - seatsTaken defaults to 0");
}

if (offering.addDropOpen === false) {
console.log("PASS - addDropOpen defaults to false");
}

if (offering.addDropCloseDate === null) {
console.log("PASS - addDropCloseDate defaults to null");
}
} catch (error) {
console.log("FAIL - Valid offering rejected");
console.log(error.message);
}

const zeroSeats = new Offering({
courseId: new mongoose.Types.ObjectId(),
term: "2026-1",
section: "B",
instructor: "Dr. Test",
day: "Tuesday",
startTime: "10:30",
endTime: "12:30",
room: "B101",
seats: 0
});

try {
await zeroSeats.validate();
console.log("FAIL - 0 seats accepted");
} catch (error) {
console.log("PASS - 0 seats rejected");
}

const negativeTaken = new Offering({
courseId: new mongoose.Types.ObjectId(),
term: "2026-1",
section: "C",
instructor: "Dr. Test",
day: "Wednesday",
startTime: "10:30",
endTime: "12:30",
room: "C101",
seats: 30,
seatsTaken: -1
});

try {
await negativeTaken.validate();
console.log("FAIL - Negative seatsTaken accepted");
} catch (error) {
console.log("PASS - Negative seatsTaken rejected");
}

console.log("Required fields:");

console.log(
"seats:",
Boolean(Offering.schema.path("seats"))
);

console.log(
"seatsTaken:",
Boolean(Offering.schema.path("seatsTaken"))
);

console.log(
"addDropOpen:",
Boolean(Offering.schema.path("addDropOpen"))
);

console.log(
"addDropCloseDate:",
Boolean(Offering.schema.path("addDropCloseDate"))
);

console.log("=== OFFERING TEST COMPLETE ===");
};

runTest();