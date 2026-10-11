const mongoose = require("mongoose");
const Notification = require("./models/Notification");

const runTest = async () => {
console.log("=== NOTIFICATION MODEL TEST ===");

const registeredNotification =
new Notification({
userId: new mongoose.Types.ObjectId(),
type: "course_registered",
message: "You were registered for ITE220."
});

try {
await registeredNotification.validate();

console.log(
"PASS - course_registered notification accepted"
);

if (registeredNotification.read === false) {
console.log(
"PASS - read defaults to false"
);
}
} catch (error) {
console.log(
"FAIL - Valid notification rejected"
);
console.log(error.message);
}

const droppedNotification =
new Notification({
userId: new mongoose.Types.ObjectId(),
type: "course_dropped",
message: "ITE220 was dropped."
});

try {
await droppedNotification.validate();

console.log(
"PASS - course_dropped notification accepted"
);
} catch (error) {
console.log(
"FAIL - course_dropped notification rejected"
);
}

const invalidNotification =
new Notification({
userId: new mongoose.Types.ObjectId(),
type: "course_updated",
message: "Invalid type"
});

try {
await invalidNotification.validate();

console.log(
"FAIL - Invalid notification type accepted"
);
} catch (error) {
console.log(
"PASS - Invalid notification type rejected"
);
}

const missingMessage =
new Notification({
userId: new mongoose.Types.ObjectId(),
type: "course_registered"
});

try {
await missingMessage.validate();

console.log(
"FAIL - Missing message accepted"
);
} catch (error) {
console.log(
"PASS - Missing message rejected"
);
}

if (
Notification.schema.options.timestamps === true
) {
console.log(
"PASS - timestamps are enabled"
);
} else {4
console.log(
"FAIL - timestamps are not enabled"
);
}

console.log(
"=== NOTIFICATION TEST COMPLETE ==="
);
};

runTest();