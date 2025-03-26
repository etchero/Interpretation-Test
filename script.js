document.addEventListener('DOMContentLoaded', () => {
    const englishSentencesTextarea = document.getElementById('english-sentences');
    const koreanTranslationsTextarea = document.getElementById('korean-translations');
    const startTestBtn = document.getElementById('start-test-btn');
    const submitTestBtn = document.getElementById('submit-test-btn');
    const resetBtn = document.getElementById('reset-btn');
    const inputSection = document.getElementById('input-section');
    const testSection = document.getElementById('test-section');
    const resultSection = document.getElementById('result-section');
    const testQuestionsContainer = document.getElementById('test-questions');
    const totalPercentageSpan = document.getElementById('total-percentage');
    const detailedResultsContainer = document.getElementById('detailed-results');

    let englishSentences = [];
    let koreanTranslations = [];
    let testSentences = [];
    let userAnswers = [];

    // Helper function to shuffle array randomly
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to start the test
    startTestBtn.addEventListener('click', () => {
        // Validate input
        englishSentences = englishSentencesTextarea.value.trim().split('\n').filter(sentence => sentence.trim() !== '');
        koreanTranslations = koreanTranslationsTextarea.value.trim().split('\n').filter(translation => translation.trim() !== '');

        if (englishSentences.length !== koreanTranslations.length || englishSentences.length < 10) {
            alert('영어 문장과 한국어 번역의 개수를 동일하게 하고, 최소 10개 이상 입력해주세요.');
            return;
        }

        // Randomly select 10 sentences
        const shuffledIndices = shuffleArray([...Array(englishSentences.length).keys()]);
        testSentences = shuffledIndices.slice(0, 10).map(index => ({
            english: englishSentences[index],
            korean: koreanTranslations[index]
        }));

        // Generate test questions
        testQuestionsContainer.innerHTML = '';
        userAnswers = [];
        testSentences.forEach((sentence, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('test-question');
            questionDiv.innerHTML = `
                <p>${index + 1}. ${sentence.english}</p>
                <input type="text" placeholder="이 문장의 한국어 뜻을 입력하세요" id="user-answer-${index}">
            `;
            testQuestionsContainer.appendChild(questionDiv);
            
            // Store placeholder for user answer
            userAnswers.push('');
        });

        // Switch to test section
        inputSection.classList.add('hidden');
        testSection.classList.remove('hidden');
    });

    // Function to highlight differences
    function highlightDifferences(userAnswer, correctAnswer) {
        // Remove punctuation and convert to lowercase
        const cleanUserWords = userAnswer.replace(/[^\w\s가-힣]/gi, '').toLowerCase().trim().split(/\s+/);
        const cleanCorrectWords = correctAnswer.replace(/[^\w\s가-힣]/gi, '').toLowerCase().trim().split(/\s+/);

        // Create highlighted version of user answer
        const highlightedWords = cleanUserWords.map(word => {
            if (cleanCorrectWords.includes(word)) {
                return `<span class="match">${word}</span>`;
            } else {
                return `<span class="mismatch">${word}</span>`;
            }
        });

        return highlightedWords.join(' ');
    }

    // Function to calculate text similarity with more flexible matching
    function calculateSimilarity(userAnswer, correctAnswer) {
        // Remove punctuation and convert to lowercase
        const cleanUserWords = userAnswer.replace(/[^\w\s가-힣]/gi, '').toLowerCase().trim().split(/\s+/);
        const cleanCorrectWords = correctAnswer.replace(/[^\w\s가-힣]/gi, '').toLowerCase().trim().split(/\s+/);

        // More flexible matching by considering partial matches and word order
        let matchingWords = 0;
        const usedCorrectWords = new Set();

        cleanUserWords.forEach(userWord => {
            const matchIndex = cleanCorrectWords.findIndex(
                (correctWord, index) => 
                    correctWord === userWord && !usedCorrectWords.has(index)
            );

            if (matchIndex !== -1) {
                matchingWords++;
                usedCorrectWords.add(matchIndex);
            }
        });

        // Calculate similarity percentage
        const similarityPercentage = Math.round(
            (matchingWords / Math.max(cleanUserWords.length, cleanCorrectWords.length)) * 100
        );

        return similarityPercentage;
    }

    // Function to submit the test
    submitTestBtn.addEventListener('click', () => {
        // Collect user answers
        testSentences.forEach((sentence, index) => {
            const userAnswerInput = document.getElementById(`user-answer-${index}`);
            userAnswers[index] = userAnswerInput.value.trim();
            userAnswerInput.disabled = true;
        });

        // Calculate similarity and generate results
        const results = testSentences.map((sentence, index) => {
            const userAnswer = userAnswers[index];
            const correctAnswer = sentence.korean;
            
            // Calculate similarity percentage
            const similarity = calculateSimilarity(userAnswer, correctAnswer);
            const highlightedUserAnswer = highlightDifferences(userAnswer, correctAnswer);

            return {
                english: sentence.english,
                userAnswer,
                correctAnswer,
                similarity,
                highlightedUserAnswer
            };
        });

        // Calculate total percentage
        const totalPercentage = Math.round(
            results.reduce((sum, result) => sum + result.similarity, 0) / results.length
        );

        // Display results
        testSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        totalPercentageSpan.textContent = `${totalPercentage}%`;

        // Generate detailed results
        detailedResultsContainer.innerHTML = results.map((result, index) => `
            <div class="result-item">
                <p><strong>문장 ${index + 1}:</strong> ${result.english}</p>
                <p>일치율: ${result.similarity}%</p>
                <p>나의 답변: <span class="user-answer">${result.highlightedUserAnswer}</span></p>
                <p>정답: <span class="correct-answer">${result.correctAnswer}</span></p>
            </div>
        `).join('');
    });

    // Reset function
    resetBtn.addEventListener('click', () => {
        // Reset all sections and inputs
        inputSection.classList.remove('hidden');
        testSection.classList.add('hidden');
        resultSection.classList.add('hidden');

        englishSentencesTextarea.value = '';
        koreanTranslationsTextarea.value = '';
        testQuestionsContainer.innerHTML = '';
        detailedResultsContainer.innerHTML = '';
        totalPercentageSpan.textContent = '0%';

        englishSentences = [];
        koreanTranslations = [];
        testSentences = [];
        userAnswers = [];
    });
});
