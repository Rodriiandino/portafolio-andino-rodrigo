import './form.css'
import { useTranslations } from '../../i18n/utils'
import { useState } from 'preact/hooks'

export default function Form({ currentLocale }) {
  const t = useTranslations(currentLocale)
  const [responseMessage, setResponseMessage] = useState('')

  async function submit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const response = await fetch('/api/contact.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: formData
    })
    const data = await response.json()
    if (data.message) {
      setResponseMessage(
        currentLocale === 'es' && data.message == 'Message received'
          ? 'Mensaje recibido'
          : data.message
      )
    }
  }
  return (
    <form class='bento__4-form' onSubmit={submit}>
      <input
        type='email'
        name='email'
        id='email'
        placeholder='andinorodrigo.job@gmail.com'
        required
      />
      {currentLocale === 'es' ? (
        <textarea
          name='message'
          id='message'
          cols='20'
          rows='4'
          placeholder='Escribe tu mensaje'
          required
        />
      ) : (
        <textarea
          name='message'
          id='message'
          cols='20'
          rows='4'
          placeholder='Write your message'
          required
        />
      )}
      <button>{t('bento.send')}</button>
      <p class='bento__4-response'>{responseMessage}</p>
    </form>
  )
}
