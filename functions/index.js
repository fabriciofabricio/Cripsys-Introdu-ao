const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Adds a course/lesson to the user's completed list.
 * Expects: { courseId: string, lessonId: string }
 */
exports.addCourseCompleted = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { courseId, lessonId } = data;
  const userId = context.auth.uid;

  if (!courseId || !lessonId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with one argument 'courseId' and 'lessonId'."
    );
  }

  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    const progressRef = userRef.collection("progress").doc(courseId);

    // Use a transaction or batch if needed, but simple update is fine here
    // We store an array of completed lesson IDs
    await progressRef.set({
      completedLessons: admin.firestore.FieldValue.arrayUnion(lessonId),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true, message: "Lesson marked as completed." };
  } catch (error) {
    console.error("Error updating progress:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to update course progress."
    );
  }
});

/**
 * Removes a course/lesson from the user's completed list.
 * Expects: { courseId: string, lessonId: string }
 */
exports.removeCourseCompleted = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { courseId, lessonId } = data;
  const userId = context.auth.uid;

  if (!courseId || !lessonId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with one argument 'courseId' and 'lessonId'."
    );
  }

  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    const progressRef = userRef.collection("progress").doc(courseId);

    await progressRef.set({
      completedLessons: admin.firestore.FieldValue.arrayRemove(lessonId),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true, message: "Lesson marked as incomplete." };
  } catch (error) {
    console.error("Error updating progress:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to update course progress."
    );
  }
});
