import { Quiz } from "@/types/Quiz";
import { QuizItem } from "@/types/Quiz";
import { QuestionItem } from "@/types/Question";

// Combines all the quiz items from a query into a single quiz object
const organizeQuizzes = (items: (QuizItem | QuestionItem)[]): Quiz[] => {
  const quizzesMap: { [key: string]: Quiz } = {};

  for (const item of items) {
    const quizId = item.PK.split('#')[1];

    if (!quizzesMap[quizId]) {
      quizzesMap[quizId] = {
        quizId,
        userId: "unknown",
        quizName: "unknown",
        questions: []
      };
    }

    if ('userId' in item) {
      quizzesMap[quizId].userId = item.userId;
      quizzesMap[quizId].quizName = item.quizName;
    }

    if ('question' in item) {
      quizzesMap[quizId].questions?.push({
        question: item.question,
        answer: item.answer,
        location: {
          longitude: item.longitude,
          latitude: item.latitude
        }
      });
    }
  }

  return Object.values(quizzesMap);
};

export default organizeQuizzes;