import { db } from '../firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";

async function generateUserEvaluationReport(userId) {
  try {
    // Fetch data from different collections
    const memoryMatchRef = doc(db, "memoryMatchReports", userId);
    const objectIdentificationRef = doc(db, "objectidentificationreport", userId);
    const puzzleRef = doc(db, "puzzleReports", userId);
    const sequenceRecallRef = doc(db, "sequenceRecallReport", userId);
    const userPointsRef = doc(db, "userPoints", userId);

    const [memoryMatchSnap, objectIdentificationSnap, puzzleSnap, sequenceRecallSnap, userPointsSnap] = await Promise.all([
      getDoc(memoryMatchRef),
      getDoc(objectIdentificationRef),
      getDoc(puzzleRef),
      getDoc(sequenceRecallRef),
      getDoc(userPointsRef)
    ]);

    if (!memoryMatchSnap.exists() || !objectIdentificationSnap.exists() || !puzzleSnap.exists() || !sequenceRecallSnap.exists() || !userPointsSnap.exists()) {
      console.log("One or more activity reports missing for user:", userId);
      return;
    }

    const memoryMatchData = memoryMatchSnap.data();
    const objectIdentificationData = objectIdentificationSnap.data();
    const puzzleData = puzzleSnap.data();
    const sequenceRecallData = sequenceRecallSnap.data();
    const userPointsData = userPointsSnap.data();

    // If storytelling data exists in userPoints
    const storytellingTime = userPointsData.storytellingTime || 0;  // Assuming storytellingTime is stored here

    // Now create a final report
    const evaluationReport = {
      userName: userPointsData.userName || "User",
      evaluatedStage: userPointsData.lastLevel || "Unknown",
      totalTime: (memoryMatchData.timeTaken || 0) + (objectIdentificationData.timeTaken || 0) + (puzzleData.timeTaken || 0) + (sequenceRecallData.timeTaken || 0) + storytellingTime,
      puzzleFailedAttempts: puzzleData.failedAttempts || 0,
      memoryMatchTime: memoryMatchData.timeTaken || 0,
      objectIdentificationTime: objectIdentificationData.timeTaken || 0,
      puzzleTime: puzzleData.timeTaken || 0,
      sequenceRecallTime: sequenceRecallData.timeTaken || 0,
      storytellingTime: storytellingTime, // Include storytelling time from userPoints
      personalizedMessage: "Great job! Keep improving your memory and cognitive skills!" // Customize this message
    };

    // Save the evaluation report
    const reportRef = doc(db, "userEvaluationReport", userId);
    await setDoc(reportRef, evaluationReport);

    console.log("User evaluation report generated successfully!");

  } catch (error) {
    console.error("Error generating evaluation report:", error);
  }
}

export default generateUserEvaluationReport;
