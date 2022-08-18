const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished',
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbols = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
      <img src="${symbols}" alt="">
      <p>${number}</p>
    `
  },

  getCardElement(index) {
    return `<div class="card back" data-number="${index}"></div>`
  },

  // 翻牌程式， ...為展開運算子
  flipCards(...cards) {
    cards.map(card => {
      // 如果卡片背面，翻轉成正片
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.number))
        return
      }
      // 卡片正面，翻轉成背面
      card.classList.add('back')
      card.innerHTML = null
    })

  },

  // 將數字轉換成字母
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number

    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('');
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })

  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(tried) {
    document.querySelector('.tried').textContent = `You've tried: ${tried} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => card.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },

}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        view.appendWrongAnimation(...model.revealedCards)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(model.revealedCards[0])
          view.pairCards(model.revealedCards[1])
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    // console.log('this.currentState', this.currentState)
    // console.log('revealerCards', model.revealedCards.map(card => card.dataset.number))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.number % 13 === this.revealedCards[1].dataset.number % 13
  },

  score: 0,
  triedTimes: 0,
}

// 隨機更換牌位置，洗牌函示式
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})