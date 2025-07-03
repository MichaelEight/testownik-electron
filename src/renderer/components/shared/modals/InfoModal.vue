<template>
<Modal @close="$emit('close')">
  <div slot="body">
    <h2>Testownik</h2>
    <p>Autor: <b>{{ authorName }}</b></p>
    <p>Adres E-Mail: <b><a :href="'mailto:' + authorEmail">{{ authorEmail }}</a></b></p>
    <div v-if="contributors.length">
       <h3>Oryginalny twórca:</h3>
       <ul class="contributors-ul">
         <li v-for="(contributor, index) in contributors" :key="index">
           <span>{{ contributor.name }}</span> — <a :href="'mailto:' + contributor.email">{{ contributor.email }}</a>
         </li>
       </ul>
     </div>
    <p>Wersja: <b>{{ appVersion }}</b></p>
    <h3>Co nowego w tej wersji?</h3>
    <ul v-if="whatsnew" class="whatsnew-ul">
      <li v-for="(paragraph, index) in whatsnew" :key="index">{{ paragraph }}</li>
    </ul>
  </div>
</Modal>
</template>

<script>
import { versions } from '@/changelog'
import { shell } from 'electron'
import Modal from '@/components/shared/Modal'
import pkg from '../../../../../package.json'

const appVersion = pkg.version
const authorMatch = pkg.author.match(/^(.*)\s<(.+)>$/)
const authorName = authorMatch ? authorMatch[1].trim() : pkg.author
const authorEmail = authorMatch ? authorMatch[2] : ''
const contributorsArr = Array.isArray(pkg.contributors) ? pkg.contributors : []
const contributors = contributorsArr.map(c => {
  const m = c.match(/^(.*)\s<(.+)>$/)
  return m ? { name: m[1].trim(), email: m[2] } : { name: c, email: '' }
})

export default {
  components: {
    Modal
  },
  data () {
    return {
      appVersion,
      whatsnew: versions[appVersion],
      authorName,
      authorEmail,
      contributors
    }
  },
  methods: {
    openExternal (url) {
      shell.openExternal(url)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_colors.scss";

h3 {
  margin-top: 32px;
}

a {
  text-decoration: none;
  color: inherit;
  transition: color .2s ease;
  cursor: pointer;
  &:hover {
    color: $primary-color;
  }
}

p {
  font-size: 0.875em;
  color: var(--secondary-text);
  b {
    color: var(--primary-text);
  }
}

b {
  font-weight: 600;
}

.whatsnew-ul {
  margin-top: 12px;
  padding-left: 24px;
  > li {
    font-size: 0.875em;
    margin: 6px 0;
  }
}

.contributors-ul {
  margin-top: 12px;
  padding-left: 24px;
  font-size: 0.875em;
  color: var(--secondary-text);
  li {
    margin: 6px 0;
  }
}
</style>
