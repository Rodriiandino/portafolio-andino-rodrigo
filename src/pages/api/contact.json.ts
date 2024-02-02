import type { APIRoute } from 'astro'
import { Resend } from 'resend'

export const prerender = false
const emailTo = import.meta.env.EMAIL
const key = import.meta.env.RESEND
const resend = new Resend(key)
const domain = import.meta.env.DOMAIN

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData()
  const email = data.get('email')
  const message = data.get('message')

  if (!email || !message) {
    return new Response(
      JSON.stringify({ error: 'Email and message are required' }),
      {
        status: 400
      }
    )
  }

  try {
    await resend.emails.send({
      from: domain.toString(),
      to: emailTo,
      subject: 'Message from portfolio website - ' + email.toString(),
      text: message.toString()
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error sending email' }), {
      status: 500
    })
  }

  return new Response(JSON.stringify({ message: 'Message received' }), {
    status: 200
  })
}
