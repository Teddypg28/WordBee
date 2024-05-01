let currentBox = 1
let word
let splitWord
let currentGuessedWord = ''
let guessWall = 1

let wordObject = {}
const boxesToCheck = [6, 11, 16, 21, 26, 31]

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

// fetch word from api

const getWord = async () => {
    const res =  await fetch('https://words.dev-apis.com/word-of-the-day')
    const data = await res.json()
    word = data.word
    splitWord = word.split('')

    generateWordObject()
}

// Store user guess in an object

const generateWordObject = () => {
    wordObject = {}
    splitWord.forEach(letter => {
        if (wordObject.hasOwnProperty(letter)) {
            wordObject[letter] += 1
        } else {
            wordObject[letter] = 1
        }
    })
}

// Restarts the game

const restartGame = () => {
    window.location.reload()
}

// Checks if valid word was guessed

const checkIfWordValid = async (word) => {
    const res = await fetch('https://words.dev-apis.com/validate-word', {method: 'POST', body: JSON.stringify({word})})
    return res
}

const renderLetter = (color, boxId, letterIndex) => {
    setTimeout(() => {
        document.getElementById(`letter-${boxId}`).style.backgroundColor = color
        document.getElementById(`letter-${boxId}`).classList.add('flip')
    }, letterIndex * 350);
}

const lookAheadForCorrectGuess = (index, letter) => {
    let numOfCorrectGuesses = 0
    let isTrue = false
    for (let i = index+1; i<5; i++) {
        if (currentGuessedWord[i].toLowerCase() === word[i].toLowerCase() === letter) {
            numOfCorrectGuesses += 1
            isTrue = true
        }
    }
    return { isTrue, numOfCorrectGuesses }
}

const validateGuess = (currentBox) => {
    document.body.removeEventListener('keydown', handleKeyPress)
    let color
    let letterIndex = 0

    // loops through each guessed letter

    for (let boxId = currentBox - 5; boxId<currentBox; boxId++) {

        const guessedLetter = document.getElementById(`letter-${boxId}`).textContent.toLowerCase()

        if (guessedLetter === splitWord[letterIndex].toLowerCase()) {    

            // correct guess logic
            color = '#A3D6FF' 
            wordObject[guessedLetter] -= 1

        } else if (word.toLowerCase().includes(guessedLetter)) {

            // not correct guess, but letter is present
            // need to look ahead in order to set the right background color (yellow or lightgray)

            const result = lookAheadForCorrectGuess(letterIndex, guessedLetter)

            if (result.isTrue) {

                // if correct guesses found and equal the rest of the remaining amount of that letter
                // color = lightgray since there's no more of that letter in the word --> otherwise color = yellow

                if (wordObject[guessedLetter] - result.numOfCorrectGuesses === 0) {
                    color = 'lightgray'
                } else {
                    color = '#FECA7A'
                }
            } else {

                // if no correct guesses found and word object letter key !== 0,
                // color = yellow since there are more of that letter in the word, otherwise 
                // color = lightgray since no more of that letter in the word

                if (wordObject[guessedLetter] >= 1) {
                    color = '#FECA7A'
                } else {
                    color = 'lightgray'
                }
            }

            // update word object 
             
           wordObject[guessedLetter] === 0 ? null : wordObject[guessedLetter] -= 1

        } else {
            color = 'lightgray'
        }

        renderLetter(color, boxId, letterIndex)
        letterIndex++
    }
        if (word === currentGuessedWord[0].toLowerCase() + currentGuessedWord[1].toLowerCase() + currentGuessedWord[2].toLowerCase() + currentGuessedWord[3].toLowerCase()
        + currentGuessedWord[4].toLowerCase()) {
            setTimeout(() => {
                    document.body.removeEventListener('keydown', handleKeyPress)
            }, 2000);
        }
        else if (currentBox === 31) {
            document.body.removeEventListener('keydown', handleKeyPress)
            setTimeout(() => {
                document.getElementById('tryAgainBtn').style.display = 'inline'
            }, 2000);
        } else {
            setTimeout(() => {
                document.body.addEventListener('keydown', handleKeyPress)
            }, 2000);
        }

    currentGuessedWord = ''

    // refresh word object

    generateWordObject()
}

// These two functions below add and remove the shake effects

const addShake = () => {
    for (let i = guessWall; i<guessWall + 5; i++) {
        const currentBox = document.getElementById(`letter-${i}`)
        currentBox.classList.add('shake')
        removeShake(i)
    }
}

const removeShake = (currentBox) => {
    setTimeout(() => {
        document.getElementById(`letter-${currentBox}`).classList.remove('shake')
    }, 500);
}

// checks if word is valid
// if word is, then check if the word has any matches, otherwise alert user that it isn't

const checkWord = async () => {
        let res = await checkIfWordValid(currentGuessedWord)
        const status = await res.json()
        if (status.validWord) {
            guessWall = currentBox
            validateGuess(currentBox)
        } else {
            addShake()
            setTimeout(() => {
                alert('Not a valid word')
            }, 600);
        }
    }

// handles user letter selections

const handleKeyPress = async (event) => {

    // handles removing letters from guess
    // guess wall is the first box of each row to limit how far you can back space

    if (event.key === 'Backspace' && currentBox > guessWall) {
        document.getElementById(`letter-${currentBox - 1}`).textContent = ''
        currentGuessedWord = currentGuessedWord.slice(0, -1)
        currentBox -= 1
        return
    }

    // checks if enough letters are present when submitting guess

    if (event.key === 'Enter' && currentGuessedWord.length < 5) {
        addShake()
        setTimeout(() => {
            alert('Not enough letters')
        }, 600);
        return
    } else if (event.key === 'Enter' && currentGuessedWord.length === 5) {
        checkWord()
    }

    // This ensures that the user cannot type past the 5 boxes before submitting a guess

    if (boxesToCheck.includes(currentBox) && currentGuessedWord.length === 5) {
        return null
    }

    // checks if a valid letter was typed

    if (!letters.includes(event.key.toLowerCase())) {
        return alert('Not a valid letter. Try again.')
    }

    // assigns word to current box and updates new current box

    document.getElementById(`letter-${currentBox}`).textContent = event.key.toUpperCase()
    currentGuessedWord += event.key.toUpperCase()

    currentBox++
}

getWord().then(() => {
    document.body.addEventListener('keydown', handleKeyPress)
})