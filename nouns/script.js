// German Nouns Practice App
// ===================================

// State management
let nouns = [];
let currentSession = {
    mode: null,
    nouns: [],
    currentIndex: 0,
    score: 0,
    mistakes: []
};

// DOM Elements
let elements = {};

// Initialize the app
async function init() {
    await loadNouns();
    initializeElements();
    setupEventListeners();
}

function initializeElements() {
    elements = {
        modeButtons: document.querySelectorAll('.mode-btn'),

        // Practice
        startPracticeBtn: document.getElementById('start-practice-btn'),
        practiceProgress: document.getElementById('practice-progress'),
        practiceCurrentNum: document.getElementById('practice-current-num'),
        practiceTotalNum: document.getElementById('practice-total-num'),
        practiceWord: document.getElementById('practice-word'),
        practiceTranslation: document.getElementById('practice-translation'),
        practiceChoices: document.getElementById('practice-choices'),
        articleChoiceButtons: document.querySelectorAll('.article-choice'),
        practiceNextBtn: document.getElementById('practice-next-btn'),
        practiceFinalScore: document.getElementById('practice-final-score'),
        practiceFinalTotal: document.getElementById('practice-final-total'),
        practiceScorePercentage: document.getElementById('practice-score-percentage'),
        practiceMistakesSummary: document.getElementById('practice-mistakes-summary'),
        practiceMistakesList: document.getElementById('practice-mistakes-list'),
        practiceAgainBtn: document.getElementById('practice-again-btn'),
        practiceMenuBtn: document.getElementById('practice-menu-btn'),

        // Memorize
        startMemorizeBtn: document.getElementById('start-memorize-btn'),
        memorizeProgress: document.getElementById('memorize-progress'),
        memorizeCurrentNum: document.getElementById('memorize-current-num'),
        memorizeTotalNum: document.getElementById('memorize-total-num'),
        nounFlashcard: document.getElementById('noun-flashcard'),
        memorizeWordFront: document.getElementById('memorize-word-front'),
        memorizeArticle: document.getElementById('memorize-article'),
        memorizeWordBack: document.getElementById('memorize-word-back'),
        memorizeTranslationPlural: document.getElementById('memorize-translation-plural'),
        memorizeNextBtn: document.getElementById('memorize-next-btn'),
        memorizeAgainBtn: document.getElementById('memorize-again-btn'),
        memorizeMenuBtn: document.getElementById('memorize-menu-btn'),

        // Meanings
        startMeaningsBtn: document.getElementById('start-meanings-btn'),
        meaningsProgress: document.getElementById('meanings-progress'),
        meaningsCurrentNum: document.getElementById('meanings-current-num'),
        meaningsTotalNum: document.getElementById('meanings-total-num'),
        meaningsLabel: document.getElementById('meanings-label'),
        meaningsWord: document.getElementById('meanings-word'),
        meaningsWordTranslation: document.getElementById('meanings-word-translation'),
        meaningsChoices: document.getElementById('meanings-choices'),
        meaningChoiceButtons: document.querySelectorAll('.meaning-choice'),
        meaningsNextBtn: document.getElementById('meanings-next-btn'),
        meaningsFinalScore: document.getElementById('meanings-final-score'),
        meaningsFinalTotal: document.getElementById('meanings-final-total'),
        meaningsScorePercentage: document.getElementById('meanings-score-percentage'),
        meaningsMistakesSummary: document.getElementById('meanings-mistakes-summary'),
        meaningsMistakesList: document.getElementById('meanings-mistakes-list'),
        meaningsAgainBtn: document.getElementById('meanings-again-btn'),
        meaningsMenuBtn: document.getElementById('meanings-menu-btn'),

        // Reference
        referenceSearchInput: document.getElementById('reference-search-input'),
        searchClearBtn: document.getElementById('search-clear-btn'),
        referenceList: document.getElementById('reference-list')
    };
}

async function loadNouns() {
    try {
        const response = await fetch('nouns.json');
        if (!response.ok) {
            throw new Error('Failed to load nouns');
        }
        nouns = await response.json();
        console.log(`Loaded ${nouns.length} nouns`);
    } catch (error) {
        console.error('Error loading nouns:', error);
        alert('Failed to load nouns. Please refresh the page.');
    }
}

function setupEventListeners() {
    // Mode selection
    elements.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            if (mode === 'practice') {
                showScreen('practice-setup');
            } else if (mode === 'memorize') {
                showScreen('memorize-setup');
            } else if (mode === 'meanings') {
                showScreen('meanings-setup');
            } else if (mode === 'reference') {
                showScreen('reference');
                populateReferenceList();
            }
        });
    });

    // Practice mode
    elements.startPracticeBtn.addEventListener('click', startPractice);
    elements.articleChoiceButtons.forEach(btn => {
        btn.addEventListener('click', () => checkPracticeAnswer(btn));
    });
    elements.practiceNextBtn.addEventListener('click', nextPracticeNoun);
    elements.practiceAgainBtn.addEventListener('click', () => showScreen('practice-setup'));
    elements.practiceMenuBtn.addEventListener('click', () => showScreen('menu'));

    // Memorize mode
    elements.startMemorizeBtn.addEventListener('click', startMemorize);
    elements.nounFlashcard.addEventListener('click', () => elements.nounFlashcard.classList.toggle('flipped'));
    elements.memorizeNextBtn.addEventListener('click', nextMemorizeNoun);
    elements.memorizeAgainBtn.addEventListener('click', () => showScreen('memorize-setup'));
    elements.memorizeMenuBtn.addEventListener('click', () => showScreen('menu'));

    // Meanings mode
    elements.startMeaningsBtn.addEventListener('click', startMeanings);
    elements.meaningChoiceButtons.forEach(btn => {
        btn.addEventListener('click', (e) => checkMeaningsAnswer(e.target));
    });
    elements.meaningsNextBtn.addEventListener('click', nextMeaningsNoun);
    elements.meaningsAgainBtn.addEventListener('click', () => showScreen('meanings-setup'));
    elements.meaningsMenuBtn.addEventListener('click', () => showScreen('menu'));

    // Reference mode
    elements.referenceSearchInput.addEventListener('input', filterReferenceList);
    elements.searchClearBtn.addEventListener('click', clearReferenceSearch);
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(`${screenName}-screen`).classList.add('active');
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Gender display helpers
const GENDER_DISPLAY = {
    'm': 'Masculine (der)',
    'f': 'Feminine (die)',
    'n': 'Neuter (das)',
    'pl': 'Plural (die)'
};

const GENDER_SHORT = {
    'm': 'der',
    'f': 'die',
    'n': 'das',
    'pl': 'die'
};

// ==================
// PRACTICE MODE
// ==================

function startPractice() {
    const countValue = document.querySelector('input[name="practice-noun-count"]:checked').value;
    const count = countValue === 'all' ? nouns.length : Math.min(parseInt(countValue), nouns.length);

    currentSession = {
        mode: 'practice',
        nouns: shuffleArray(nouns).slice(0, count),
        currentIndex: 0,
        score: 0,
        mistakes: []
    };

    elements.practiceTotalNum.textContent = currentSession.nouns.length;
    showScreen('practice');
    displayPracticeNoun();
}

function displayPracticeNoun() {
    const noun = currentSession.nouns[currentSession.currentIndex];

    elements.practiceCurrentNum.textContent = currentSession.currentIndex + 1;
    const progressPercent = (currentSession.currentIndex / currentSession.nouns.length) * 100;
    elements.practiceProgress.style.width = `${progressPercent}%`;

    elements.practiceWord.textContent = noun.word;
    elements.practiceTranslation.textContent = noun.translation;

    // Reset choice buttons
    elements.articleChoiceButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect', 'correct-answer');
    });

    elements.practiceNextBtn.classList.add('hidden');
}

function checkPracticeAnswer(selectedButton) {
    const noun = currentSession.nouns[currentSession.currentIndex];
    const selectedGender = selectedButton.dataset.gender;
    const isCorrect = selectedGender === noun.gender;

    // Disable all buttons
    elements.articleChoiceButtons.forEach(btn => {
        btn.disabled = true;
    });

    // Mark selected button
    selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');

    // Always show the correct answer if wrong
    if (!isCorrect) {
        elements.articleChoiceButtons.forEach(btn => {
            if (btn.dataset.gender === noun.gender) {
                btn.classList.add('correct-answer');
            }
        });
    }

    // Update score
    if (isCorrect) {
        currentSession.score++;
    } else {
        currentSession.mistakes.push({
            word: noun.word,
            correctArticle: `${noun.article} (${noun.gender})`,
            userArticle: `${selectedButton.dataset.article} (${selectedGender})`,
            translation: noun.translation
        });
    }

    const isLastNoun = currentSession.currentIndex >= currentSession.nouns.length - 1;
    elements.practiceNextBtn.textContent = isLastNoun ? 'Finish Practice' : 'Next Noun';
    elements.practiceNextBtn.classList.remove('hidden');
}

function nextPracticeNoun() {
    currentSession.currentIndex++;

    if (currentSession.currentIndex >= currentSession.nouns.length) {
        showPracticeResults();
    } else {
        displayPracticeNoun();
    }
}

function showPracticeResults() {
    const total = currentSession.nouns.length;
    const score = currentSession.score;
    const percentage = Math.round((score / total) * 100);

    elements.practiceFinalScore.textContent = score;
    elements.practiceFinalTotal.textContent = total;
    elements.practiceScorePercentage.textContent = `${percentage}%`;

    if (percentage >= 80) {
        elements.practiceScorePercentage.style.color = 'var(--success)';
    } else if (percentage >= 50) {
        elements.practiceScorePercentage.style.color = 'var(--secondary-color)';
    } else {
        elements.practiceScorePercentage.style.color = 'var(--error)';
    }

    if (currentSession.mistakes.length > 0) {
        elements.practiceMistakesSummary.classList.remove('hidden');
        elements.practiceMistakesList.innerHTML = currentSession.mistakes.map(m =>
            `<li><strong>${m.word}</strong> (${m.translation})<br>Correct: ${m.correctArticle}<br>You chose: ${m.userArticle}</li>`
        ).join('');
    } else {
        elements.practiceMistakesSummary.classList.add('hidden');
    }

    elements.practiceProgress.style.width = '100%';
    showScreen('practice-results');
}

// ==================
// MEMORIZE MODE
// ==================

function startMemorize() {
    const countValue = document.querySelector('input[name="memorize-noun-count"]:checked').value;
    const count = countValue === 'all' ? nouns.length : Math.min(parseInt(countValue), nouns.length);

    currentSession = {
        mode: 'memorize',
        nouns: shuffleArray(nouns).slice(0, count),
        currentIndex: 0
    };

    elements.memorizeTotalNum.textContent = currentSession.nouns.length;
    showScreen('memorize');
    displayMemorizeNoun();
}

function displayMemorizeNoun() {
    const noun = currentSession.nouns[currentSession.currentIndex];

    elements.memorizeCurrentNum.textContent = currentSession.currentIndex + 1;
    const progressPercent = (currentSession.currentIndex / currentSession.nouns.length) * 100;
    elements.memorizeProgress.style.width = `${progressPercent}%`;

    // Front of card
    elements.memorizeWordFront.textContent = noun.word;

    // Back of card
    elements.memorizeArticle.textContent = noun.article;
    elements.memorizeWordBack.textContent = noun.word;
    elements.memorizeTranslationPlural.textContent = `${noun.translation} | die ${noun.plural}`;

    // Reset flashcard (unflip)
    elements.nounFlashcard.classList.remove('flipped');

    const isLastNoun = currentSession.currentIndex >= currentSession.nouns.length - 1;
    elements.memorizeNextBtn.textContent = isLastNoun ? 'Finish Review' : 'Next Noun';
}

function nextMemorizeNoun() {
    currentSession.currentIndex++;

    if (currentSession.currentIndex >= currentSession.nouns.length) {
        elements.memorizeProgress.style.width = '100%';
        showScreen('memorize-complete');
    } else {
        displayMemorizeNoun();
    }
}

// ==================
// MEANINGS MODE
// ==================

function startMeanings() {
    const countValue = document.querySelector('input[name="meanings-noun-count"]:checked').value;
    const direction = document.querySelector('input[name="meanings-direction"]:checked').value;

    const count = countValue === 'all' ? nouns.length : parseInt(countValue);

    currentSession = {
        mode: 'meanings',
        direction: direction,
        nouns: shuffleArray(nouns).slice(0, count),
        currentIndex: 0,
        score: 0,
        mistakes: []
    };

    elements.meaningsTotalNum.textContent = currentSession.nouns.length;
    showScreen('meanings');
    displayMeaningsNoun();
}

function displayMeaningsNoun() {
    const noun = currentSession.nouns[currentSession.currentIndex];

    elements.meaningsCurrentNum.textContent = currentSession.currentIndex + 1;
    const progressPercent = (currentSession.currentIndex / currentSession.nouns.length) * 100;
    elements.meaningsProgress.style.width = `${progressPercent}%`;

    let showGerman;
    if (currentSession.direction === 'de-en') {
        showGerman = true;
    } else if (currentSession.direction === 'en-de') {
        showGerman = false;
    } else {
        showGerman = Math.random() < 0.5;
    }

    currentSession.currentShowGerman = showGerman;

    elements.meaningsLabel.textContent = showGerman ? 'German' : 'English';
    elements.meaningsWord.textContent = showGerman ? `${noun.article} ${noun.word}` : noun.translation;
    elements.meaningsWordTranslation.textContent = '';

    const correctAnswer = showGerman ? noun.translation : noun.word;
    const wrongAnswers = getWrongAnswers(noun, showGerman, 3);
    const choices = shuffleArray([correctAnswer, ...wrongAnswers]);

    currentSession.correctAnswerIndex = choices.indexOf(correctAnswer);
    currentSession.correctAnswer = correctAnswer;

    elements.meaningChoiceButtons.forEach((btn, index) => {
        btn.textContent = choices[index];
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect', 'correct-answer');
    });

    elements.meaningsNextBtn.classList.add('hidden');
}

function getWrongAnswers(currentNoun, showGerman, count) {
    const otherNouns = nouns.filter(n => n.word !== currentNoun.word);
    const shuffled = shuffleArray(otherNouns);

    const wrongAnswers = [];
    for (let i = 0; i < shuffled.length && wrongAnswers.length < count; i++) {
        const answer = showGerman ? shuffled[i].translation : shuffled[i].word;
        if (!wrongAnswers.includes(answer) && answer !== (showGerman ? currentNoun.translation : currentNoun.word)) {
            wrongAnswers.push(answer);
        }
    }

    return wrongAnswers;
}

function checkMeaningsAnswer(selectedButton) {
    const selectedIndex = parseInt(selectedButton.dataset.index);
    const isCorrect = selectedIndex === currentSession.correctAnswerIndex;

    elements.meaningChoiceButtons.forEach(btn => {
        btn.disabled = true;
    });

    selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
        elements.meaningChoiceButtons[currentSession.correctAnswerIndex].classList.add('correct-answer');
    }

    if (isCorrect) {
        currentSession.score++;
    } else {
        const noun = currentSession.nouns[currentSession.currentIndex];
        currentSession.mistakes.push({
            word: currentSession.currentShowGerman ? `${noun.article} ${noun.word}` : noun.translation,
            correctAnswer: currentSession.correctAnswer,
            userAnswer: selectedButton.textContent,
            direction: currentSession.currentShowGerman ? 'DE → EN' : 'EN → DE'
        });
    }

    const isLastNoun = currentSession.currentIndex >= currentSession.nouns.length - 1;
    elements.meaningsNextBtn.textContent = isLastNoun ? 'Finish' : 'Next Noun';
    elements.meaningsNextBtn.classList.remove('hidden');
}

function nextMeaningsNoun() {
    currentSession.currentIndex++;

    if (currentSession.currentIndex >= currentSession.nouns.length) {
        showMeaningsResults();
    } else {
        displayMeaningsNoun();
    }
}

function showMeaningsResults() {
    const total = currentSession.nouns.length;
    const score = currentSession.score;
    const percentage = Math.round((score / total) * 100);

    elements.meaningsFinalScore.textContent = score;
    elements.meaningsFinalTotal.textContent = total;
    elements.meaningsScorePercentage.textContent = `${percentage}%`;

    if (percentage >= 80) {
        elements.meaningsScorePercentage.style.color = 'var(--success)';
    } else if (percentage >= 50) {
        elements.meaningsScorePercentage.style.color = 'var(--secondary-color)';
    } else {
        elements.meaningsScorePercentage.style.color = 'var(--error)';
    }

    if (currentSession.mistakes.length > 0) {
        elements.meaningsMistakesSummary.classList.remove('hidden');
        elements.meaningsMistakesList.innerHTML = currentSession.mistakes.map(m =>
            `<li><strong>${m.word}</strong> (${m.direction})<br>Correct: ${m.correctAnswer}<br>You chose: ${m.userAnswer}</li>`
        ).join('');
    } else {
        elements.meaningsMistakesSummary.classList.add('hidden');
    }

    elements.meaningsProgress.style.width = '100%';
    showScreen('meanings-results');
}

// ==================
// REFERENCE MODE
// ==================

function populateReferenceList() {
    const sortedNouns = [...nouns].sort((a, b) => a.word.localeCompare(b.word));

    elements.referenceList.innerHTML = sortedNouns.map((noun) => {
        const nounIndex = nouns.indexOf(noun);
        return `<div class="reference-item" data-noun-index="${nounIndex}" data-word="${noun.word.toLowerCase()}" data-translation="${noun.translation.toLowerCase()}" data-article="${noun.article.toLowerCase()}">
            <div class="reference-item-main">
                <span class="reference-item-word">${noun.word}</span>
                <span class="reference-item-translation">${noun.translation}</span>
            </div>
            <div class="reference-item-badges">
                <span class="reference-badge article-tag-${noun.gender}">${noun.article}</span>
                <span class="reference-badge gender-tag-${noun.gender}">${noun.gender}</span>
                <span class="reference-badge plural-badge">die ${noun.plural}</span>
            </div>
        </div>`;
    }).join('');

    elements.referenceSearchInput.value = '';
    elements.searchClearBtn.classList.remove('visible');
}

function filterReferenceList() {
    const searchTerm = elements.referenceSearchInput.value.toLowerCase().trim();

    elements.searchClearBtn.classList.toggle('visible', searchTerm.length > 0);

    document.querySelectorAll('.reference-item').forEach(item => {
        const word = item.dataset.word;
        const translation = item.dataset.translation;
        const article = item.dataset.article;

        const matches = word.includes(searchTerm) || translation.includes(searchTerm) || article.includes(searchTerm);
        item.style.display = matches ? '' : 'none';
    });
}

function clearReferenceSearch() {
    elements.referenceSearchInput.value = '';
    elements.searchClearBtn.classList.remove('visible');
    filterReferenceList();
    elements.referenceSearchInput.focus();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('current-year').textContent = new Date().getFullYear();
});