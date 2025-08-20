document.addEventListener('DOMContentLoaded', () => {
    const typingEffectSpan = document.querySelector('.typing-effect');
    const phrases = [
        "Full of comments explaining my questionable decisions",
        "Not Designed to be easily understood by future me (and others)",
        "Currently battling an inexplicable memory leak",
        "Written to solve a very specific, niche problem",
        "Probably going to break with the next minor update",
        "A testament to the power of copy-pasting from the internet",
        "The reason I always have a backup plan",
        "Optimized for human readability, not always machine speed",
        "Completely dependent on obscure third-party libraries",
        "Totally not written using AI",
    ];

    let currentPhraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isCorrectingMistake = false; // Flag: true when we are actively erasing a mistake
    let isTypingMistake = false; // New flag: true when a mistake has just been typed, and we are waiting to realize it
    let mistakeTypedCharIndex = -1; // Stores the charIndex where the mistake was made
    let mistakeRealizationDelay = 0; // Delay before realizing the mistake

    // Speed ranges for realistic typing/erasing
    const minTypingSpeed = 30; // Minimum delay per character when typing correctly
    const maxTypingSpeed = 100; // Maximum delay per character when typing correctly
    const minErasingSpeed = 30; // Minimum delay per character when erasing a full phrase
    const maxErasingSpeed = 70; // Maximum delay per character when erasing a full phrase
    const mistakeErasingSpeed = 30; // Very fast erase for immediate typos after realization

    const pauseTime = 1500;   // Milliseconds to pause after typing a phrase
    const delayBeforeFullErase = 1000; // Milliseconds to wait before starting to erase a complete phrase

    const randomDelayMinStart = 500; // Minimum additional random delay before initial sequence start
    const randomDelayMaxStart = 2000; // Maximum additional random delay

    const mistakeProbability = 0.05; // 5% chance of making a mistake for each character typed

    // Range for how many characters to type after a mistake before realizing
    const minCharsBeforeRealization = 1;
    const maxCharsBeforeRealization = 5;

    // Characters that can be typed as mistakes (only letters for realism)
    const possibleMistakeChars = "abcdefghijklmnopqrstuvwxyz";

    // Helper function to get a random integer within a range
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Helper function to get a random character for a mistake
    function getRandomMistakeChar() {
        return possibleMistakeChars[getRandomInt(0, possibleMistakeChars.length - 1)];
    }

    function type() {
        const currentPhrase = phrases[currentPhraseIndex];
        let currentSpeed; // Variable to hold the speed for the current step

        if (isTypingMistake) {
            // Scenario 1: Just typed a wrong character, and now we are in the "realization delay"
            if (mistakeRealizationDelay > 0) {
                // Still waiting for realization
                mistakeRealizationDelay--;
                // Type a few more characters if needed (if delay > 0)
                if (charIndex < currentPhrase.length) {
                    typingEffectSpan.textContent = currentPhrase.substring(0, charIndex + 1);
                    charIndex++;
                    currentSpeed = getRandomInt(minTypingSpeed, maxTypingSpeed);
                } else {
                    // Reached end of phrase while typing a mistake, just wait for realization
                    currentSpeed = getRandomInt(minTypingSpeed, maxTypingSpeed);
                }
            } else {
                // Realization! Time to start erasing the mistake and the chars typed after it
                isTypingMistake = false;
                isCorrectingMistake = true;
                charIndex--; // Go back one char to start erasing from the last typed char (which might be correct or part of the mistake trail)
                currentSpeed = mistakeErasingSpeed; // Erase very fast
            }
        } else if (isCorrectingMistake) {
            // Scenario 2: Actively erasing characters due to a realized mistake
            if (charIndex >= mistakeTypedCharIndex) {
                // Erase characters until we reach the point where the mistake was made
                typingEffectSpan.textContent = currentPhrase.substring(0, charIndex);
                charIndex--;
                currentSpeed = mistakeErasingSpeed; // Erase very fast
            } else {
                // Finished erasing the mistake and characters after it
                isCorrectingMistake = false;
                mistakeTypedCharIndex = -1; // Reset
                // Now, re-type the correct character at charIndex (which is now pointing to where the correct char should be)
                typingEffectSpan.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++; // Advance for the correct character
                currentSpeed = getRandomInt(minTypingSpeed, maxTypingSpeed);
            }
        } else if (isDeleting) {
            // Scenario 3: Erasing a full phrase
            if (charIndex > 0) {
                typingEffectSpan.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                currentSpeed = getRandomInt(minErasingSpeed, maxErasingSpeed); // Random erasing speed
            } else {
                // Finished erasing the full phrase
                isDeleting = false;
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length; // Move to next phrase (cycle)
                charIndex = 0; // Reset charIndex for the new phrase
                currentSpeed = pauseTime; // Pause before typing the next phrase
            }
        } else {
            // Scenario 4: Typing characters (either correct or making a mistake)
            if (charIndex < currentPhrase.length) {
                // Decide if a mistake should be made:
                // - Random chance `mistakeProbability`
                // - Not the very first character (`charIndex > 0`)
                // - Only if the current character is a letter (to avoid replacing spaces/punctuation)
                const currentChar = currentPhrase[charIndex];
                const isLetter = (currentChar >= 'a' && currentChar <= 'z') || (currentChar >= 'A' && currentChar <= 'Z');

                if (Math.random() < mistakeProbability && charIndex > 0 && isLetter) {
                    const wrongChar = getRandomMistakeChar();
                    // Append the wrong character temporarily
                    typingEffectSpan.textContent = currentPhrase.substring(0, charIndex) + wrongChar;
                    mistakeTypedCharIndex = charIndex; // Remember where the mistake was made
                    isTypingMistake = true; // Set flag to enter the mistake realization phase
                    mistakeRealizationDelay = getRandomInt(minCharsBeforeRealization, maxCharsBeforeRealization);
                    charIndex++; // Advance charIndex *after* typing the wrong char
                    currentSpeed = getRandomInt(minTypingSpeed / 2, maxTypingSpeed / 2); // Type mistake a bit faster
                } else {
                    // Type the correct character
                    typingEffectSpan.textContent = currentPhrase.substring(0, charIndex + 1);
                    charIndex++; // Advance charIndex for the *correct* character
                    currentSpeed = getRandomInt(minTypingSpeed, maxTypingSpeed); // Random typing speed
                }
            } else {
                // Finished typing the current phrase
                isDeleting = true;
                currentSpeed = delayBeforeFullErase; // Wait a bit before starting full erase
            }
        }

        setTimeout(type, currentSpeed); // Call `type` again after the calculated delay
    }

    // Function to start the typing effect after an initial random delay
    function startTypingEffectWithRandomDelay() {
        setTimeout(() => {
            // Clear any text that might be in the HTML initially
            typingEffectSpan.textContent = '';
            charIndex = 0;
            isDeleting = false;
            isCorrectingMistake = false;
            isTypingMistake = false;
            mistakeTypedCharIndex = -1;
            mistakeRealizationDelay = 0;

            // Start with a random phrase from the list
            currentPhraseIndex = getRandomInt(0, phrases.length - 1);

            type(); // Start the typing animation loop
        }, getRandomInt(randomDelayMinStart, randomDelayMaxStart));
    }

    // Begin the process once the DOM is fully loaded
    startTypingEffectWithRandomDelay();
});
