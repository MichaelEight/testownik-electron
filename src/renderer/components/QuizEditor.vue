<template>
  <div class="quiz-editor" :theme="theme">
    <h1>{{ isEditing ? 'Edytuj quiz' : 'Nowy quiz' }}</h1>
    <div v-for="(q, qIndex) in questions" :key="qIndex" class="question-block">
      <input
        class="custom-input line question-input"
        :theme="theme"
        v-model="q.text"
        :ref="'question-' + qIndex"
        @focus="focusQuestion(qIndex)"
        placeholder="Treść pytania"/>
      <div class="answers-block">
        <div
          class="answer-item"
          v-for="(a, aIndex) in q.answers"
          :key="aIndex">
          <input
            class="custom-input line answer-input"
            :theme="theme"
            v-model="a.text"
            :ref="'answer-' + qIndex + '-' + aIndex"
            @focus="focusAnswer(qIndex, aIndex)"
            placeholder="Odpowiedź"/>
          <button
            type="button"
            class="correct-button"
            :class="{ 'true': a.isCorrect, 'false': !a.isCorrect }"
            @click="a.isCorrect = !a.isCorrect">
            {{ a.isCorrect ? 'TRUE' : 'FALSE' }}
          </button>
          <button class="default-button remove-button" @click="removeAnswer(qIndex, aIndex)">-</button>
        </div>
        <div class="question-actions">
          <button class="default-button add-answer-button" @click="addAnswer(qIndex)">Dodaj odpowiedź</button>
          <button class="default-button remove-question-button" @click="removeQuestion(qIndex)">Usuń pytanie</button>
        </div>
      </div>
    </div>
    <div class="editor-actions">
      <button class="default-button" @click="addQuestion">Dodaj pytanie</button>
      <button class="default-button" @click="goHome">Powrót do menu</button>
      <button class="default-button save-button" @click="saveQuiz">Zapisz quiz</button>
    </div>
  </div>
</template>

<script>
import fs from 'fs'
const { dialog } = require('electron').remote
const openDialogAsync = options => new Promise(resolve => dialog.showOpenDialog(options, resolve))

export default {
  name: 'quiz-editor',
  data () {
    return {
      questions: [],
      currentQuestionIndex: 0,
      currentAnswerIndex: 0
    }
  },
  computed: {
    theme () {
      return this.$store.state.theme
    },
    isEditing () {
      return this.questions.length > 0
    }
  },
  mounted () {
    document.body.addEventListener('keydown', this.handleKeydown)
    if (this.$route.params && this.$route.params.loadedQuestions) {
      this.questions = this.$route.params.loadedQuestions
    }
  },
  beforeDestroy () {
    document.body.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    focusQuestion (index) {
      this.currentQuestionIndex = index
      this.currentAnswerIndex = 0
    },
    focusAnswer (qIndex, aIndex) {
      this.currentQuestionIndex = qIndex
      this.currentAnswerIndex = aIndex
    },
    addQuestion () {
      this.questions.push({ text: '', answers: [{ text: '', isCorrect: false }] })
      this.$nextTick(() => {
        this.focusQuestion(this.questions.length - 1)
        const ref = this.$refs['question-' + (this.questions.length - 1)]
        ref && ref.focus()
      })
    },
    removeQuestion (index) {
      this.questions.splice(index, 1)
    },
    addAnswer (qIndex) {
      this.questions[qIndex].answers.push({ text: '', isCorrect: false })
      this.$nextTick(() => {
        const idx = this.questions[qIndex].answers.length - 1
        this.focusAnswer(qIndex, idx)
        const ref = this.$refs['answer-' + qIndex + '-' + idx]
        ref && ref.focus()
      })
    },
    removeAnswer (qIndex, aIndex) {
      this.questions[qIndex].answers.splice(aIndex, 1)
    },
    handleKeydown (e) {
      if (e.altKey && e.key === 'ArrowDown') {
        if (this.currentQuestionIndex < this.questions.length - 1) {
          const next = this.currentQuestionIndex + 1
          const ref = this.$refs['question-' + next]
          ref && ref.focus()
          this.focusQuestion(next)
        }
      } else if (e.altKey && e.key === 'ArrowUp') {
        if (this.currentQuestionIndex > 0) {
          const prev = this.currentQuestionIndex - 1
          const ref = this.$refs['question-' + prev]
          ref && ref.focus()
          this.focusQuestion(prev)
        }
      } else if (e.altKey && e.key === 'ArrowRight') {
        const answers = this.questions[this.currentQuestionIndex].answers
        if (this.currentAnswerIndex < answers.length - 1) {
          const next = this.currentAnswerIndex + 1
          const ref = this.$refs['answer-' + this.currentQuestionIndex + '-' + next]
          ref && ref.focus()
          this.focusAnswer(this.currentQuestionIndex, next)
        }
      } else if (e.altKey && e.key === 'ArrowLeft') {
        if (this.currentAnswerIndex > 0) {
          const prev = this.currentAnswerIndex - 1
          const ref = this.$refs['answer-' + this.currentQuestionIndex + '-' + prev]
          ref && ref.focus()
          this.focusAnswer(this.currentQuestionIndex, prev)
        }
      } else if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        this.addQuestion()
      } else if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        this.addAnswer(this.currentQuestionIndex)
      } else if (e.ctrlKey && e.key === 'Backspace') {
        e.preventDefault()
        this.removeQuestion(this.currentQuestionIndex)
      } else if (e.ctrlKey && e.key === 'Delete') {
        e.preventDefault()
        this.removeAnswer(this.currentQuestionIndex, this.currentAnswerIndex)
      }
    },
    goHome () {
      this.$router.push('/')
    },
    async saveQuiz () {
      const path = await openDialogAsync({ properties: ['openDirectory', 'createDirectory'] })
      if (!path || !path[0]) return
      const folder = path[0]
      this.questions.forEach((q, idx) => {
        const correctLine = 'X' + q.answers.map(a => a.isCorrect ? '1' : '0').join('')
        const lines = [correctLine, q.text, ...q.answers.map(a => a.text)]
        const filename = folder + '/' + String(idx + 1).padStart(3, '0') + '.txt'
        fs.writeFileSync(filename, lines.join('\n'), 'utf8')
      })
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
/* Base layout */
.quiz-editor {
  padding: 32px;
  height: 100vh;
  overflow-y: auto;
  background: var(--main-window-background);
  transition: background 0.2s ease;
}
.question-block {
  margin: 16px 0;
  padding: 16px;
  border-radius: 8px;
  background: var(--sidebar-background);
  box-shadow: 0 4px 16px rgba(0, 0, 0, .05);
}
.answers-block {
  margin-top: 8px;
}
.answer-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.answer-input {
  flex: 1;
  margin-right: 8px;
}
.editor-actions {
  margin-top: 24px;
  text-align: center;
}

/* Default button style */
.default-button {
  margin: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 48px;
  cursor: pointer;
  background: var(--sidebar-background);
  transition: background 0.2s ease, color 0.2s ease;
  color: var(--primary-text);
  box-shadow: 0 2px 8px rgba(0, 0, 0, .05);
}
.default-button:hover {
  background: var(--background);
}
.save-button {
  border-radius: 4px;
  background: #39b54a;
  color: #fff;
}
.save-button:hover {
  background: #4dc65d;
}

/* Remove (minus) buttons */
.default-button.remove-button {
  width: 32px;
  height: 32px;
  padding: 0;
  line-height: 32px;
  border-radius: 50%;
  background: #f15151;
  color: #fff;
  border: none;
  transition: background 0.2s ease;
}
.default-button.remove-button:hover {
  background: #f46c6c;
}

/* Styled text inputs */
.question-input.custom-input,
.answer-input.custom-input {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  border: 1px solid transparent;
  padding: 10px 16px;
  font-size: .875em;
  font-family: 'Open Sans', sans-serif;
  color: var(--primary-text);
  outline: none;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}
.question-input.custom-input:focus,
.answer-input.custom-input:focus {
  border-color: #39b54a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

/* Question-specific action buttons container */
.question-actions {
  display: flex;
  gap: 12px;
  margin: 12px 0;
}
.add-answer-button {
  background: #39b54a;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 24px;
  transition: background 0.2s ease;
}
.add-answer-button:hover {
  background: #4dc65d;
}
.remove-question-button {
  background: #f15151;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 24px;
  transition: background 0.2s ease;
}
.remove-question-button:hover {
  background: #f46c6c;
}

/* Ensure input text and placeholder are visible */
.custom-input {
  color: var(--primary-text) !important;
}
.custom-input::placeholder {
  color: var(--secondary-text) !important;
}
.custom-input.line {
  background: #fff !important;
}
</style>
<style scoped>
/* Toggle button replacing checkbox */
.correct-button {
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  color: #fff;
  font-size: .875em;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-right: 8px;
}
.correct-button.true {
  background: #39b54a;
}
.correct-button.true:hover {
  background: #4dc65d;
}
.correct-button.false {
  background: #f15151;
}
.correct-button.false:hover {
  background: #f46c6c;
}
</style>
<style scoped>
/* Force input background and text color */
input.question-input,
input.answer-input {
  background: #fff !important;
  color: #333 !important;
}
input.question-input::placeholder,
input.answer-input::placeholder {
  color: #888 !important;
}
</style>
<style scoped>
.question-input.custom-input {
  /* Make question input as long as answer inputs */
  width: 100%;
  min-width: 0;
  /* Make it visually unique */
  font-weight: bold;
  background: #e8f5e9 !important; /* subtle green tint */
  border: 2px solid #39b54a;
  font-size: 1.05em;
}
.question-input.custom-input:focus {
  border-color: #2e9140;
  background: #d0f2d6 !important;
}
</style>
