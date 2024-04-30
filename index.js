let currentBox = 1
let word = 'luspl'
let splitWord = word.split('')
let currentGuessedWord = ''
let guessWall = 1

let wordObject = {}
const boxesToCheck = [6, 11, 16, 21, 26, 31]

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

const getWord = async () => {
    const res =  await fetch('https://words.dev-apis.com/word-of-the-day')
    const data = await res.json()
    word = data.word
    splitWord = word.split('')

    generateWordObject()
}

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

const restartGame = () => {
    window.location.reload()
}

const checkIfWordValid = async (word) => {
    const res = await fetch('https://words.dev-apis.com/validate-word', {method: 'POST', body: JSON.stringify({word})})
    return res
}

const renderLetter = (color, currentBox, index) => {
    setTimeout(() => {
        document.getElementById(`letter-${currentBox}`).style.backgroundColor = color
        document.getElementById(`letter-${currentBox}`).classList.add('flip')
    }, index * 350);
}

const lookAheadForCorrectGuess = (index) => {
    let result = false
    for (let i = index+1; i<5; i++) {
        if (currentGuessedWord[i].toLowerCase() === word[i].toLowerCase()) {
            result = true
        }
    }
    return result
}

const validateGuess = (currentBox) => {
    document.body.removeEventListener('keydown', handleKeyPress)
    let color
    let index = 0
    for (let i = currentBox - 5; i<currentBox; i++) {
        const guessedLetter = document.getElementById(`letter-${i}`).textContent.toLowerCase()
        if (guessedLetter === splitWord[index].toLowerCase()) {    
            color = '#A3D6FF' 
            wordObject[guessedLetter] -= 1
        } else if (word.toLowerCase().includes(guessedLetter)) {
            const result = lookAheadForCorrectGuess(index)
            if (wordObject[guessedLetter] >= 1 && result === false || result === true && wordObject[guessedLetter] >= 2) {
                color = '#FECA7A'
            } else {
                color = 'lightgray'
            }               
           wordObject[guessedLetter] === 0 ? null : wordObject[guessedLetter] -= 1
        } else {
            color = 'lightgray'
        }
        renderLetter(color, i, index)
        index++
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
    generateWordObject()
}

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

const checkWord = async () => {
        let res = await checkIfWordValid(currentGuessedWord)
        const status = await res.json()
        if (status.validWord === true) {
            guessWall = currentBox
            validateGuess(currentBox)
        } else {
            addShake()
            setTimeout(() => {
                alert('Not a valid word')
            }, 600);
        }
    }

const handleKeyPress = async (event) => {

    if (event.key === 'Backspace' && currentBox > guessWall) {
        document.getElementById(`letter-${currentBox - 1}`).textContent = ''
        currentGuessedWord = currentGuessedWord.slice(0, -1)
        currentBox -= 1
        return
    }

    if (event.key === 'Enter' && currentGuessedWord.length < 5) {
        addShake()
        setTimeout(() => {
            alert('Not enough letters')
        }, 600);
        return
    } else if (event.key === 'Enter' && currentGuessedWord.length === 5) {
         return checkWord()
    }

    if (boxesToCheck.includes(currentBox) && currentGuessedWord.length === 5) {
        return null
    }

    if (!letters.includes(event.key.toLowerCase())) {
        return alert('Not a valid letter. Try again.')
    }

    document.getElementById(`letter-${currentBox}`).textContent = event.key.toUpperCase()
    currentGuessedWord += event.key.toUpperCase()

    currentBox++
}

getWord().then(() => {
    document.body.addEventListener('keydown', handleKeyPress)
})