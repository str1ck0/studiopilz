import { redirect } from 'next/navigation'

// /work redirects to the homepage which contains the project gallery
export default function WorkPage() {
  redirect('/')
}
