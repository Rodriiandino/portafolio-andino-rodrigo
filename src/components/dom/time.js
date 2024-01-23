export default function time() {
  const $html = document.querySelector('html')
  const $hour = document.getElementById('hour')
  const $day = document.getElementById('day')
  const $date = document.getElementById('date')

  const language = $html.getAttribute('lang')
  let locales

  language == 'es' ? (locales = 'es-AR') : (locales = 'en-US')

  const getTime = () => {
    const time = new Date().toLocaleTimeString(locales, {
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h12'
    })

    const dayName = new Date().toLocaleDateString(locales, {
      weekday: 'long'
    })

    const dateName = new Date().toLocaleDateString(locales, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    $hour.innerHTML = time
    $day.innerHTML = dayName
    $date.innerHTML = dateName
  }

  getTime()

  setInterval(() => {
    getTime()
  }, 10000)
}
